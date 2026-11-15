"""Open issues and pull requests of the followed repositories (GitHub GraphQL API, cached)."""

from datetime import timedelta

import pytest
from homeassistant.config_entries import ConfigEntryState
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_fire_time_changed

from custom_components.github_card.const import DOMAIN
from custom_components.github_card.items import GRAPHQL_URL, async_items, build_query, parse, parse_mine

from .test_init import _setup, _ws


async def _poll_once(hass):
    """Let the background poller's deferred first fetch run."""
    async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=30))
    await hass.async_block_till_done()


NODE = {
    "number": 97,
    "title": "Translations: Greek",
    "url": "https://github.com/juju35/ha-parcel/pull/97",
    "createdAt": "2026-11-01T10:00:00Z",
    "updatedAt": "2026-11-08T10:00:00Z",
    "author": {"login": "octocat"},
    "comments": {"totalCount": 2},
    "labels": {"nodes": [{"name": "i18n", "color": "0e8a16"}]},
}


MINE = {
    **NODE,
    "number": 12,
    "title": "Fix the door sensor",
    "url": "https://github.com/octo-org/octo-repo/pull/12",
    "updatedAt": "2026-11-10T09:00:00Z",
    "author": {"login": "juju35"},
    "isDraft": True,
    "reviewDecision": None,
    "repository": {"nameWithOwner": "octo-org/octo-repo"},
}


def _mine():
    """The search for the user's own open pull requests, as answered under the `mine` alias."""
    older = {**MINE, "number": 3, "updatedAt": "2026-10-01T09:00:00Z", "isDraft": False, "reviewDecision": "APPROVED"}
    return {"issueCount": 57, "nodes": [older, MINE, {}]}


def _answer():
    issue = {
        **NODE,
        "number": 94,
        "title": "Logo missing",
        "url": "https://github.com/juju35/ha-parcel/issues/94",
        "updatedAt": "2026-11-09T08:00:00Z",
    }
    return {
        "data": {
            "r0": {
                "nameWithOwner": "juju35/ha-parcel",
                "issues": {"totalCount": 3, "nodes": [issue]},
                "pullRequests": {"totalCount": 1, "nodes": [{**NODE, "isDraft": False, "reviewDecision": "APPROVED"}]},
            },
            "r1": None,
            "mine": _mine(),
        }
    }


@pytest.fixture
def github(hass):
    gh = MockConfigEntry(
        domain="github",
        data={"access_token": "tok"},
        subentries_data=[
            {"data": {"repository": n}, "subentry_type": "repository", "title": n, "unique_id": n}
            for n in ("juju35/ha-parcel", "juju35/gone")
        ],
    )
    gh.add_to_hass(hass)
    gh.mock_state(hass, ConfigEntryState.NOT_LOADED)
    return gh


def test_query_quotes_names():
    query = build_query(["juju35/ha-parcel", 'a/b"c'])
    assert 'r0: repository(owner: "juju35", name: "ha-parcel")' in query
    assert 'name: "b\\"c"' in query
    assert "states: OPEN" in query and "isDraft reviewDecision" in query
    assert "search(" not in query


def test_query_searches_my_pull_requests():
    """The first query also searches the user's own open pull requests, in any repository."""
    query = build_query(["juju35/ha-parcel"], mine=True)
    assert 'mine: search(query: "is:pr is:open author:@me archived:false sort:updated-desc", type: ISSUE' in query
    assert "repository { nameWithOwner }" in query
    # Alone, without any repository followed
    assert build_query([], mine=True).startswith("query { mine: search(")


def test_parse_mine_sorts_newest_first_and_keeps_the_total():
    mine, total = parse_mine(_answer()["data"])
    assert [p["number"] for p in mine] == [12, 3]  # the empty node (not a pull request) is skipped
    assert mine[0]["repo"] == "octo-org/octo-repo" and mine[0]["draft"] is True and mine[0]["review"] is None
    assert mine[1]["review"] == "APPROVED"
    assert total == 57
    assert parse_mine({}) == ([], 0)


def test_parse_sorts_newest_first_and_skips_missing():
    issues, pulls, totals = parse(_answer()["data"])
    assert [i["number"] for i in issues] == [94]
    assert pulls[0]["review"] == "APPROVED" and pulls[0]["draft"] is False
    assert pulls[0]["labels"] == [{"name": "i18n", "color": "0e8a16"}]
    assert totals == {"juju35/ha-parcel": {"issues": 3, "pulls": 1}}  # the mine alias is not a repository


async def test_items_cached_then_refreshed(hass, aioclient_mock, github):
    aioclient_mock.post(GRAPHQL_URL, json=_answer())
    items = await async_items(hass)
    assert items.error is None
    assert aioclient_mock.call_count == 1  # the user's pull requests come with the repositories' query
    assert aioclient_mock.mock_calls[0][3]["Authorization"] == "Bearer tok"
    assert [p["number"] for p in items.mine] == [12, 3] and items.mine_total == 57
    await async_items(hass)
    assert aioclient_mock.call_count == 1  # cached
    await async_items(hass, refresh=True)
    assert aioclient_mock.call_count == 2


async def test_items_errors(hass, aioclient_mock, github):
    aioclient_mock.post(GRAPHQL_URL, status=401)
    assert (await async_items(hass)).error == "http_401"


async def test_items_without_github_or_repositories(hass, aioclient_mock):
    assert (await async_items(hass)).error == "github_not_configured"
    assert aioclient_mock.call_count == 0
    # No repository followed: the user's own pull requests are still searched, alone
    aioclient_mock.post(GRAPHQL_URL, json={"data": {"mine": _mine()}})
    MockConfigEntry(domain="github", data={"access_token": "tok"}).add_to_hass(hass)
    items = await async_items(hass)
    assert items.error is None and items.issues == [] and items.pulls == [] and items.totals == {}
    assert aioclient_mock.call_count == 1
    assert aioclient_mock.mock_calls[0][2]["query"].startswith("query { mine: search(")
    assert [p["number"] for p in items.mine] == [12, 3] and items.mine_total == 57
    assert items.as_dict()["pending"] is False


async def test_items_command_reads_the_cache(hass, aioclient_mock, github, hass_ws_client):
    """A tab read returns the cache the background poller filled, without querying GitHub again."""
    aioclient_mock.post(GRAPHQL_URL, json=_answer())
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)
    await _setup(hass, entry)
    # A tab read before the first poll is pending, with no GitHub query.
    msg = await _ws(hass, hass_ws_client, {"type": f"{DOMAIN}/items"})
    assert aioclient_mock.call_count == 0
    assert msg["result"]["pending"] is True
    # The background poll fills the cache; the next read serves it, still without a query.
    await _poll_once(hass)
    assert aioclient_mock.call_count == 1
    msg = await _ws(hass, hass_ws_client, {"type": f"{DOMAIN}/items"})
    assert aioclient_mock.call_count == 1
    assert msg["result"]["issues"][0]["title"] == "Logo missing"
    assert msg["result"]["pulls"][0]["url"] == "https://github.com/juju35/ha-parcel/pull/97"
    assert msg["result"]["mine"][0]["url"] == "https://github.com/octo-org/octo-repo/pull/12"
    assert msg["result"]["mine_total"] == 57
    assert msg["result"]["pending"] is False
    assert "tok" not in str(msg)


async def test_items_command_refresh_queries_github(hass, aioclient_mock, github, hass_ws_client):
    """The Refresh button (refresh=True) queries GitHub now."""
    aioclient_mock.post(GRAPHQL_URL, json=_answer())
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)
    await _setup(hass, entry)
    await _poll_once(hass)
    assert aioclient_mock.call_count == 1
    msg = await _ws(hass, hass_ws_client, {"type": f"{DOMAIN}/items", "refresh": True})
    assert aioclient_mock.call_count == 2
    assert msg["result"]["issues"][0]["title"] == "Logo missing"


async def test_subscribe_items_pushes_the_cache(hass, aioclient_mock, github, hass_ws_client):
    """Subscribing sends the current snapshot at once."""
    aioclient_mock.post(GRAPHQL_URL, json=_answer())
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)
    await _setup(hass, entry)
    await _poll_once(hass)
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": f"{DOMAIN}/subscribe_items"})
    assert (await client.receive_json())["success"] is True
    event = await client.receive_json()
    assert event["event"]["issues"][0]["title"] == "Logo missing"


def test_a_repository_followed_under_two_names_is_counted_once():
    """The former name of a renamed repository redirects to it: GitHub answers twice with the same repository."""
    answer = _answer()["data"]
    answer["r1"] = answer["r0"]
    issues, pulls, totals = parse(answer)
    assert [p["number"] for p in pulls] == [97]
    assert [i["number"] for i in issues] == [94]
    assert totals == {"juju35/ha-parcel": {"issues": 3, "pulls": 1}}
    # Across two queries (20 repositories each) too
    seen = set()
    parse(_answer()["data"], seen)
    assert parse(_answer()["data"], seen) == ([], [], {})
