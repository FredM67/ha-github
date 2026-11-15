"""Open issues and pull requests of the followed repositories, for the panel's Issues and Pull requests tabs, and
the open pull requests of the token's user in any repository, for its My pull requests tab.

The GitHub integration only exposes counts and the latest issue / pull request of a repository. The full lists
come from the GitHub GraphQL API, with the access token of the GitHub integration (no token of our own): one
query for 20 repositories at a time, kept for a few minutes. The user's own pull requests come from a search
added to the first of these queries (alias ``mine``), so they cost no request of their own.
"""

from __future__ import annotations

import asyncio
import json
import logging
import re
import time
from collections.abc import Callable
from dataclasses import dataclass, field
from datetime import timedelta
from typing import Any

import aiohttp
from homeassistant.const import CONF_ACCESS_TOKEN
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import async_call_later, async_track_time_interval

from .const import (
    CONF_REFRESH_MINUTES,
    DEFAULT_REFRESH_MINUTES,
    DOMAIN,
    MAX_REFRESH_MINUTES,
    MIN_REFRESH_MINUTES,
    SIGNAL_ITEMS_UPDATED,
)
from .repositories import followed, github_entry

_LOGGER = logging.getLogger(__name__)

GRAPHQL_URL = "https://api.github.com/graphql"
CACHE_SECONDS = 300
CHUNK = 20
PER_REPO = 50
MINE_LIMIT = 50
# The open pull requests of the token's user, in any repository (archived ones left out), most recently updated first
MINE_SEARCH = "is:pr is:open author:@me archived:false sort:updated-desc"
_NAME = re.compile(r"^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$")

_FIELDS = (
    "number title url createdAt updatedAt author { login } comments { totalCount } "
    "labels(first: 6) { nodes { name color } }"
)
_ORDER = f"states: OPEN, first: {PER_REPO}, orderBy: {{field: UPDATED_AT, direction: DESC}}"


def build_query(repos: list[str], mine: bool = False) -> str:
    """One GraphQL query for these repositories (validated owner/name, quoted with JSON); `mine` adds the search
    for the user's own open pull requests."""
    parts = []
    for i, repo in enumerate(repos):
        owner, name = repo.split("/", 1)
        parts.append(
            f"r{i}: repository(owner: {json.dumps(owner)}, name: {json.dumps(name)}) {{ nameWithOwner "
            f"issues({_ORDER}) {{ totalCount nodes {{ {_FIELDS} }} }} "
            f"pullRequests({_ORDER}) {{ totalCount nodes {{ {_FIELDS} isDraft reviewDecision }} }} }}"
        )
    if mine:
        parts.append(
            f"mine: search(query: {json.dumps(MINE_SEARCH)}, type: ISSUE, first: {MINE_LIMIT}) {{ issueCount "
            f"nodes {{ ... on PullRequest {{ {_FIELDS} isDraft reviewDecision repository {{ nameWithOwner }} }} }} }}"
        )
    return "query { " + " ".join(parts) + " }"


def _item(repo: str, node: dict[str, Any], pull: bool) -> dict[str, Any]:
    item = {
        "repo": repo,
        "number": node.get("number"),
        "title": node.get("title") or "",
        "url": node.get("url") or "",
        "author": (node.get("author") or {}).get("login") or "",
        "created": node.get("createdAt"),
        "updated": node.get("updatedAt"),
        "comments": (node.get("comments") or {}).get("totalCount") or 0,
        "labels": [
            {"name": lb.get("name", ""), "color": lb.get("color", "")}
            for lb in (node.get("labels") or {}).get("nodes") or []
        ],
    }
    if pull:
        item["draft"] = bool(node.get("isDraft"))
        item["review"] = node.get("reviewDecision")
    return item


def _newest(item: dict[str, Any]) -> str:
    return item["updated"] or ""


def parse(
    data: dict[str, Any], seen: set[str] | None = None
) -> tuple[list[dict], list[dict], dict[str, dict[str, int]]]:
    """Issues and pull requests of a GraphQL answer, and the open totals per repository."""
    seen = set() if seen is None else seen
    issues, pulls, totals = [], [], {}
    for alias, repo_data in (data or {}).items():
        if not repo_data or alias == "mine":
            continue  # a repository that no longer exists or is not readable: its alias is null; mine: parse_mine
        repo = repo_data["nameWithOwner"]
        # A repository followed under two names (its former name redirects to the new one) comes back twice:
        # counted once. `seen` carries the repositories already read from the previous queries.
        if repo.casefold() in seen:
            continue
        seen.add(repo.casefold())
        issues += [_item(repo, n, False) for n in repo_data["issues"]["nodes"]]
        pulls += [_item(repo, n, True) for n in repo_data["pullRequests"]["nodes"]]
        totals[repo] = {"issues": repo_data["issues"]["totalCount"], "pulls": repo_data["pullRequests"]["totalCount"]}
    return sorted(issues, key=_newest, reverse=True), sorted(pulls, key=_newest, reverse=True), totals


def parse_mine(data: dict[str, Any]) -> tuple[list[dict], int]:
    """The user's own open pull requests of a GraphQL answer (most recently updated first) and their total."""
    search = (data or {}).get("mine") or {}
    mine = [
        _item(node["repository"]["nameWithOwner"], node, True)
        for node in search.get("nodes") or []
        if node and (node.get("repository") or {}).get("nameWithOwner")
    ]
    return sorted(mine, key=_newest, reverse=True), search.get("issueCount") or 0


@dataclass
class Items:
    issues: list[dict] = field(default_factory=list)
    pulls: list[dict] = field(default_factory=list)
    totals: dict[str, dict[str, int]] = field(default_factory=dict)
    # The user's own open pull requests, in any repository (the first MINE_LIMIT), and how many are open in all
    mine: list[dict] = field(default_factory=list)
    mine_total: int = 0
    fetched_at: float | None = None
    error: str | None = None

    def as_dict(self) -> dict[str, Any]:
        return {
            "issues": self.issues,
            "pulls": self.pulls,
            "totals": self.totals,
            "mine": self.mine,
            "mine_total": self.mine_total,
            "fetched_at": self.fetched_at,
            "error": self.error,
            # Never fetched yet (the first background poll has not landed): the panel keeps showing "loading"
            "pending": self.fetched_at is None and self.error is None,
        }


async def async_items(hass: HomeAssistant, refresh: bool = False) -> Items:
    """Open issues and pull requests of the followed repositories and the user's own open pull requests, from the
    cache unless stale or `refresh`. The user's pull requests are fetched even with no repository followed."""
    entry = github_entry(hass)
    if entry is None:
        return Items(error="github_not_configured")
    repos = sorted((r for r in followed(entry) if _NAME.match(r)), key=str.casefold)
    cache = hass.data.setdefault(DOMAIN, {})
    cached = cache.get("items")
    now = time.time()
    if not refresh and cached and cached[0] == repos and now - cached[1].fetched_at < CACHE_SECONDS:
        return cached[1]
    token = entry.data.get(CONF_ACCESS_TOKEN)
    if not token:
        return Items(error="no_token")
    session = async_get_clientsession(hass)
    issues, pulls, totals = [], [], {}
    mine: list[dict] = []
    mine_total = 0
    seen: set[str] = set()
    # 20 repositories per query; the first query also searches the user's own pull requests (alone, without any
    # repository followed)
    chunks = [repos[s : s + CHUNK] for s in range(0, len(repos), CHUNK)] or [[]]

    async def _query(query: str) -> dict[str, Any] | str:
        async with session.post(
            GRAPHQL_URL,
            json={"query": query},
            headers={"Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json"},
            timeout=aiohttp.ClientTimeout(total=30),
        ) as resp:
            if resp.status in (401, 403):
                return f"http_{resp.status}"
            resp.raise_for_status()
            return await resp.json()

    # The queries of 20 repositories each run side by side (they waited for one another), parsed in order
    try:
        bodies = await asyncio.gather(*(_query(build_query(names, mine=i == 0)) for i, names in enumerate(chunks)))
        for i, body in enumerate(bodies):
            if isinstance(body, str):
                return Items(error=body)
            data = body.get("data") or {}
            if i == 0:
                mine, mine_total = parse_mine(data)
            found_issues, found_pulls, found_totals = parse(data, seen)
            issues += found_issues
            pulls += found_pulls
            totals.update(found_totals)
    except (aiohttp.ClientError, TimeoutError, ValueError, KeyError) as err:
        return Items(error=type(err).__name__)
    items = Items(
        sorted(issues, key=_newest, reverse=True),
        sorted(pulls, key=_newest, reverse=True),
        totals,
        mine,
        mine_total,
        now,
    )
    cache["items"] = (repos, items)
    return items


def _followed_repos(hass: HomeAssistant) -> list[str] | None:
    """The followed repositories (valid names), or None when the GitHub integration is not configured."""
    entry = github_entry(hass)
    if entry is None:
        return None
    return sorted((r for r in followed(entry) if _NAME.match(r)), key=str.casefold)


def current_items(hass: HomeAssistant) -> Items:
    """The last fetched issues and pull requests from the cache, without querying GitHub.

    The panel reads this when a tab opens: the background poller is what queries GitHub, on its interval.
    """
    repos = _followed_repos(hass)
    if repos is None:
        return Items(error="github_not_configured")
    cached = hass.data.get(DOMAIN, {}).get("items")
    if cached and cached[0] == repos:
        return cached[1]
    # Nothing cached for the current repositories yet: pending until the next poll.
    return Items()


# The first fetch after Home Assistant starts, and a fetch after the followed repositories change, are deferred
# by a few seconds rather than run at once, so startup is not blocked and bursts of follows coalesce.
FIRST_FETCH_DELAY = 8


class ItemsPoller:
    """Fetches the open issues and pull requests in the background, on the configured interval.

    The panel no longer queries GitHub when its Issues or Pull requests tab opens; it reads the cache this poller
    fills (``current_items``) and listens for ``SIGNAL_ITEMS_UPDATED`` to refresh what it shows.
    """

    def __init__(self, hass: HomeAssistant, options: Callable[[], dict[str, Any]]) -> None:
        self._hass = hass
        self._options = options
        self._unsub: Callable[[], None] | None = None  # the recurring interval
        self._soon: Callable[[], None] | None = None  # a one-shot fetch scheduled soon
        self._minutes: int | None = None

    def _interval(self) -> int:
        try:
            minutes = int(self._options().get(CONF_REFRESH_MINUTES, DEFAULT_REFRESH_MINUTES))
        except (TypeError, ValueError):
            minutes = DEFAULT_REFRESH_MINUTES
        return max(MIN_REFRESH_MINUTES, min(MAX_REFRESH_MINUTES, minutes))

    @callback
    def async_start(self) -> Callable[[], None]:
        """Schedule the recurring fetch and a first one shortly after startup; returns a callback that stops them."""
        self._schedule()
        self.async_refresh_soon()

        @callback
        def _stop() -> None:
            if self._unsub:
                self._unsub()
                self._unsub = None
            if self._soon:
                self._soon()
                self._soon = None

        return _stop

    @callback
    def async_reschedule(self) -> None:
        """Re-arm the timer when the interval setting changed (called after the settings are saved)."""
        if self._interval() != self._minutes:
            self._schedule()

    @callback
    def async_refresh_soon(self) -> None:
        """Fetch a few seconds from now (startup, or the followed repositories changed); coalesces repeats."""
        if self._soon:
            self._soon()
        self._soon = async_call_later(self._hass, FIRST_FETCH_DELAY, self._poll)

    @callback
    def _schedule(self) -> None:
        if self._unsub:
            self._unsub()
        self._minutes = self._interval()
        self._unsub = async_track_time_interval(self._hass, self._poll, timedelta(minutes=self._minutes))

    async def _poll(self, _now: Any = None) -> None:
        self._soon = None
        try:
            await async_items(self._hass, refresh=True)
        except Exception:  # noqa: BLE001 - a scheduled fetch must never break the integration
            _LOGGER.exception("GitHub Card: could not refresh the open issues and pull requests")
            return
        async_dispatcher_send(self._hass, SIGNAL_ITEMS_UPDATED)
