/*
 * GitHub Card for Home Assistant
 * https://github.com/juju35/ha-github
 *
 * Lovelace cards for the core GitHub integration (https://www.home-assistant.io/integrations/github/):
 * stars, forks, watchers, open issues and pull requests, and the latest release, tag, commit, issue,
 * pull request and discussion of each repository. Entities are discovered automatically through the
 * entity registry (platform "github", translation key, device), whatever the language.
 */

const VERSION = "2.9.1";

// Material Design Icons paths.
const ICONS = {
  github:
    "M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z",
  star: "M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z",
  fork: "M6,2A3,3 0 0,1 9,5C9,6.28 8.19,7.38 7.06,7.81C7.15,8.27 7.39,8.83 8,9.63C9,10.92 11,12.83 12,14.17C13,12.83 15,10.92 16,9.63C16.61,8.83 16.85,8.27 16.94,7.81C15.81,7.38 15,6.28 15,5A3,3 0 0,1 18,2A3,3 0 0,1 21,5C21,6.32 20.14,7.45 18.95,7.85C18.87,8.37 18.64,9 18,9.83C17,11.17 15,13.08 14,14.38C13.39,15.17 13.15,15.73 13.06,16.19C14.19,16.62 15,17.72 15,19A3,3 0 0,1 12,22A3,3 0 0,1 9,19C9,17.72 9.81,16.62 10.94,16.19C10.85,15.73 10.61,15.17 10,14.38C9,13.08 7,11.17 6,9.83C5.36,9 5.13,8.37 5.05,7.85C3.86,7.45 3,6.32 3,5A3,3 0 0,1 6,2M6,4A1,1 0 0,0 5,5A1,1 0 0,0 6,6A1,1 0 0,0 7,5A1,1 0 0,0 6,4M18,4A1,1 0 0,0 17,5A1,1 0 0,0 18,6A1,1 0 0,0 19,5A1,1 0 0,0 18,4M12,18A1,1 0 0,0 11,19A1,1 0 0,0 12,20A1,1 0 0,0 13,19A1,1 0 0,0 12,18Z",
  eye: "M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z",
  issue: "M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,9.5A2.5,2.5 0 0,0 9.5,12A2.5,2.5 0 0,0 12,14.5A2.5,2.5 0 0,0 14.5,12A2.5,2.5 0 0,0 12,9.5Z",
  pr: "M6,3A3,3 0 0,1 9,6C9,7.31 8.17,8.42 7,8.83V15.17C8.17,15.58 9,16.69 9,18A3,3 0 0,1 6,21A3,3 0 0,1 3,18C3,16.69 3.83,15.58 5,15.17V8.83C3.83,8.42 3,7.31 3,6A3,3 0 0,1 6,3M6,5A1,1 0 0,0 5,6A1,1 0 0,0 6,7A1,1 0 0,0 7,6A1,1 0 0,0 6,5M6,17A1,1 0 0,0 5,18A1,1 0 0,0 6,19A1,1 0 0,0 7,18A1,1 0 0,0 6,17M21,18A3,3 0 0,1 18,21A3,3 0 0,1 15,18C15,16.69 15.83,15.58 17,15.17V7H15V10.25L10.75,6L15,1.75V5H17A2,2 0 0,1 19,7V15.17C20.17,15.58 21,16.69 21,18M18,17A1,1 0 0,0 17,18A1,1 0 0,0 18,19A1,1 0 0,0 19,18A1,1 0 0,0 18,17Z",
  merge: "M7,3A3,3 0 0,1 10,6C10,7.29 9.19,8.39 8.04,8.81C8.58,13.81 13.08,14.77 15.19,14.96C15.61,13.81 16.71,13 18,13A3,3 0 0,1 21,16A3,3 0 0,1 18,19C16.69,19 15.57,18.16 15.16,17C10.91,16.8 9.44,15.19 8,13.39V15.17C9.17,15.58 10,16.69 10,18A3,3 0 0,1 7,21A3,3 0 0,1 4,18C4,16.69 4.83,15.58 6,15.17V8.83C4.83,8.42 4,7.31 4,6A3,3 0 0,1 7,3M7,5A1,1 0 0,0 6,6A1,1 0 0,0 7,7A1,1 0 0,0 8,6A1,1 0 0,0 7,5M7,17A1,1 0 0,0 6,18A1,1 0 0,0 7,19A1,1 0 0,0 8,18A1,1 0 0,0 7,17M18,15A1,1 0 0,0 17,16A1,1 0 0,0 18,17A1,1 0 0,0 19,16A1,1 0 0,0 18,15Z",
  forum: "M17,12V3A1,1 0 0,0 16,2H3A1,1 0 0,0 2,3V17L6,13H16A1,1 0 0,0 17,12M21,6H19V15H6V17A1,1 0 0,0 7,18H18L22,22V7A1,1 0 0,0 21,6Z",
  download: "M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z",
  tag: "M5.5,7A1.5,1.5 0 0,1 4,5.5A1.5,1.5 0 0,1 5.5,4A1.5,1.5 0 0,1 7,5.5A1.5,1.5 0 0,1 5.5,7M21.41,11.58L12.41,2.58C12.05,2.22 11.55,2 11,2H4C2.89,2 2,2.89 2,4V11C2,11.55 2.22,12.05 2.59,12.41L11.58,21.41C11.95,21.77 12.45,22 13,22C13.55,22 14.05,21.77 14.41,21.41L21.41,14.41C21.78,14.05 22,13.55 22,13C22,12.44 21.77,11.94 21.41,11.58Z",
  release: "M12,2L3,7V17L12,22L21,17V7L12,2M12,4.31L18.47,7.9L12,11.5L5.53,7.9L12,4.31M5,9.6L11,12.94V19.6L5,16.27V9.6M13,19.6V12.94L19,9.6V16.27L13,19.6Z",
  commit: "M17,12C17,14.42 15.28,16.44 13,16.9V21H11V16.9C8.72,16.44 7,14.42 7,12C7,9.58 8.72,7.56 11,7.1V3H13V7.1C15.28,7.56 17,9.58 17,12M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z",
  group: "M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25M0,20V18.5C0,17.11 1.89,15.94 4.45,15.6C3.86,16.28 3.5,17.22 3.5,18.25V20H0M24,20H20.5V18.25C20.5,17.22 20.14,16.28 19.55,15.6C22.11,15.94 24,17.11 24,18.5V20Z",
  account: "M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z",
  code: "M8,3A2,2 0 0,0 6,5V9A2,2 0 0,1 4,11H3V13H4A2,2 0 0,1 6,15V19A2,2 0 0,0 8,21H10V19H8V14A2,2 0 0,0 6,12A2,2 0 0,0 8,10V5H10V3M16,3A2,2 0 0,1 18,5V9A2,2 0 0,0 20,11H21V13H20A2,2 0 0,0 18,15V19A2,2 0 0,1 16,21H14V19H16V14A2,2 0 0,1 18,12A2,2 0 0,1 16,10V5H14V3H16Z",
  open: "M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z",
  chevron: "M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z",
  // mdi:arrow-expand and mdi:arrow-collapse, for the zoom button of the mini card.
  expand: "M10,21V19H6.41L10.91,14.5L9.5,13.09L5,17.59V14H3V21H10M14.5,10.91L19,6.41V10H21V3H14V5H17.59L13.09,9.5L14.5,10.91Z",
  collapse: "M19.5,3.09L15,7.59V4H13V11H20V9H16.41L20.91,4.5L19.5,3.09M4,13V15H7.59L3.09,19.5L4.5,20.91L9,16.41V20H11V13H4Z",
};

// ---------------------------------------------------------------------------
// Translations: one table per language, by key (the tests check that every language has the English keys).
// Counts use the "label: {n}" form, which reads right in every language whatever its plural rules.
// ---------------------------------------------------------------------------

const STRINGS = {
  en: {
    stars: "Stars",
    forks: "Forks",
    watchers: "Watchers",
    issues: "Issues",
    pulls: "Pull requests",
    merged_pulls: "Merged PRs",
    discussions: "Discussions",
    downloads: "Downloads",
    latest_release: "Latest release",
    latest_tag: "Latest tag",
    latest_commit: "Latest commit",
    latest_issue: "Latest issue",
    latest_pull_request: "Latest pull request",
    latest_discussion: "Latest discussion",
    account: "Account",
    followers: "Followers",
    following: "Following",
    public_repos: "Public repositories",
    public_gists: "Public gists",
    repos_n: "Repositories: {n}",
    open_none: "Nothing open",
    open_n: "Open: {n}",
    unknown: "Unknown",
    open_github: "Open on GitHub",
    no_github: "No GitHub entities found. Is the GitHub integration set up with at least one repository?",
    zoom_in: "Show the full card",
    zoom_out: "Back to the compact view",
    title: "Title (optional, defaults to GitHub)",
    repositories: "Repositories (optional, all by default)",
    show_latest: "Show latest activity",
    show_account: "Show account",
    show_title: "Sort repositories",
    show_subtitle: "By name",
    sort: "By stars",
    sort_name: "By open issues and pull requests",
    sort_stars: "Show title",
    sort_open: "Show subtitle",
    max_repos: "Repositories in the compact view",
    zoom: "Zoom button",
    zoom_helper: "Switches the card to the full card and back",
    language: "Language",
    lang_auto: "Automatic",
    no_repos: "No repository followed",
    no_repos_hint: "Add your repositories to the GitHub integration to see them here.",
    no_match: "None of the repositories of the card is followed by the GitHub integration.",
    open_integration: "Open the GitHub integration",
  },
  fr: {
    stars: "Étoiles",
    forks: "Forks",
    watchers: "Observateurs",
    issues: "Issues",
    pulls: "Pull requests",
    merged_pulls: "PR fusionnées",
    discussions: "Discussions",
    downloads: "Téléchargements",
    latest_release: "Dernière version",
    latest_tag: "Dernier tag",
    latest_commit: "Dernier commit",
    latest_issue: "Dernière issue",
    latest_pull_request: "Dernière pull request",
    latest_discussion: "Dernière discussion",
    account: "Compte",
    followers: "Abonnés",
    following: "Abonnements",
    public_repos: "Dépôts publics",
    public_gists: "Gists publics",
    repos_n: "Dépôts : {n}",
    open_none: "Rien en attente",
    open_n: "Ouverts : {n}",
    unknown: "Inconnu",
    open_github: "Ouvrir sur GitHub",
    no_github: "Aucune entité GitHub trouvée. L’intégration GitHub est-elle configurée avec au moins un dépôt ?",
    zoom_in: "Afficher la carte complète",
    zoom_out: "Revenir à la vue compacte",
    title: "Titre (facultatif, GitHub par défaut)",
    repositories: "Dépôts (facultatif, tous par défaut)",
    show_latest: "Afficher l’activité récente",
    show_account: "Afficher le compte",
    show_title: "Tri des dépôts",
    show_subtitle: "Par nom",
    sort: "Par étoiles",
    sort_name: "Par issues et pull requests ouvertes",
    sort_stars: "Afficher le titre",
    sort_open: "Afficher le sous-titre",
    max_repos: "Dépôts dans la vue compacte",
    zoom: "Bouton zoom",
    zoom_helper: "Bascule la carte en carte complète, et inversement",
    language: "Langue",
    lang_auto: "Automatique",
    no_repos: "Aucun dépôt suivi",
    no_repos_hint: "Ajoutez vos dépôts à l’intégration GitHub pour les afficher ici.",
    no_match: "Aucun des dépôts de la carte n’est suivi par l’intégration GitHub.",
    open_integration: "Ouvrir l’intégration GitHub",
  },
  de: {
    stars: "Sterne",
    forks: "Forks",
    watchers: "Beobachter",
    issues: "Issues",
    pulls: "Pull Requests",
    merged_pulls: "Gemergte PRs",
    discussions: "Diskussionen",
    downloads: "Downloads",
    latest_release: "Neuestes Release",
    latest_tag: "Neuester Tag",
    latest_commit: "Letzter Commit",
    latest_issue: "Neuestes Issue",
    latest_pull_request: "Neuester Pull Request",
    latest_discussion: "Neueste Diskussion",
    account: "Konto",
    followers: "Follower",
    following: "Folgt",
    public_repos: "Öffentliche Repositorys",
    public_gists: "Öffentliche Gists",
    repos_n: "Repositorys: {n}",
    open_none: "Nichts offen",
    open_n: "Offen: {n}",
    unknown: "Unbekannt",
    open_github: "Auf GitHub öffnen",
    no_github: "Keine GitHub-Entitäten gefunden. Ist die GitHub-Integration mit mindestens einem Repository eingerichtet?",
    zoom_in: "Vollständige Karte anzeigen",
    zoom_out: "Zurück zur kompakten Ansicht",
    title: "Titel (optional, standardmäßig GitHub)",
    repositories: "Repositorys (optional, standardmäßig alle)",
    show_latest: "Letzte Aktivität anzeigen",
    show_account: "Konto anzeigen",
    show_title: "Sortierung der Repositorys",
    show_subtitle: "Nach Name",
    sort: "Nach Sternen",
    sort_name: "Nach offenen Issues und Pull Requests",
    sort_stars: "Titel anzeigen",
    sort_open: "Untertitel anzeigen",
    max_repos: "Repositorys in der kompakten Ansicht",
    zoom: "Zoom-Schaltfläche",
    zoom_helper: "Schaltet zwischen kompakter und vollständiger Karte um",
    language: "Sprache",
    lang_auto: "Automatisch",
    no_repos: "Kein Repository verfolgt",
    no_repos_hint: "Füge deine Repositorys in der GitHub-Integration hinzu, um sie hier zu sehen.",
    no_match: "Keines der Repositorys der Karte wird von der GitHub-Integration verfolgt.",
    open_integration: "GitHub-Integration öffnen",
  },
  es: {
    stars: "Estrellas",
    forks: "Forks",
    watchers: "Observadores",
    issues: "Issues",
    pulls: "Pull requests",
    merged_pulls: "PR fusionadas",
    discussions: "Discusiones",
    downloads: "Descargas",
    latest_release: "Última versión",
    latest_tag: "Última etiqueta",
    latest_commit: "Último commit",
    latest_issue: "Última issue",
    latest_pull_request: "Última pull request",
    latest_discussion: "Última discusión",
    account: "Cuenta",
    followers: "Seguidores",
    following: "Siguiendo",
    public_repos: "Repositorios públicos",
    public_gists: "Gists públicos",
    repos_n: "Repositorios: {n}",
    open_none: "Nada abierto",
    open_n: "Abiertos: {n}",
    unknown: "Desconocido",
    open_github: "Abrir en GitHub",
    no_github: "No se encontraron entidades de GitHub. ¿Está configurada la integración GitHub con al menos un repositorio?",
    zoom_in: "Mostrar la tarjeta completa",
    zoom_out: "Volver a la vista compacta",
    title: "Título (opcional, GitHub por defecto)",
    repositories: "Repositorios (opcional, todos por defecto)",
    show_latest: "Mostrar la actividad reciente",
    show_account: "Mostrar la cuenta",
    show_title: "Orden de los repositorios",
    show_subtitle: "Por nombre",
    sort: "Por estrellas",
    sort_name: "Por issues y pull requests abiertas",
    sort_stars: "Mostrar el título",
    sort_open: "Mostrar el subtítulo",
    max_repos: "Repositorios en la vista compacta",
    zoom: "Botón de zoom",
    zoom_helper: "Alterna entre la tarjeta completa y la vista compacta",
    language: "Idioma",
    lang_auto: "Automático",
    no_repos: "Ningún repositorio seguido",
    no_repos_hint: "Añade tus repositorios a la integración GitHub para verlos aquí.",
    no_match: "La integración GitHub no sigue ninguno de los repositorios de la tarjeta.",
    open_integration: "Abrir la integración GitHub",
  },
  sr: {
    stars: "Звездице",
    forks: "Форкови",
    watchers: "Посматрачи",
    issues: "Проблеми",
    pulls: "Pull захтеви",
    merged_pulls: "Спојени PR",
    discussions: "Дискусије",
    downloads: "Преузимања",
    latest_release: "Најновије издање",
    latest_tag: "Најновија ознака",
    latest_commit: "Последњи комит",
    latest_issue: "Последњи проблем",
    latest_pull_request: "Последњи pull захтев",
    latest_discussion: "Последња дискусија",
    account: "Налог",
    followers: "Пратиоци",
    following: "Прати",
    public_repos: "Јавни репозиторијуми",
    public_gists: "Јавни гистови",
    repos_n: "Репозиторијуми: {n}",
    open_none: "Ништа отворено",
    open_n: "Отворено: {n}",
    unknown: "Непознато",
    open_github: "Отвори на GitHub-у",
    no_github: "Није пронађен ниједан GitHub ентитет. Да ли је интеграција GitHub подешена са бар једним репозиторијумом?",
    zoom_in: "Прикажи целу картицу",
    zoom_out: "Назад на компактни приказ",
    title: "Наслов (опционо, подразумевано GitHub)",
    repositories: "Репозиторијуми (опционо, подразумевано сви)",
    show_latest: "Прикажи недавну активност",
    show_account: "Прикажи налог",
    show_title: "Редослед репозиторијума",
    show_subtitle: "По имену",
    sort: "По звездицама",
    sort_name: "По отвореним проблемима и pull захтевима",
    sort_stars: "Прикажи наслов",
    sort_open: "Прикажи поднаслов",
    max_repos: "Репозиторијуми у компактном приказу",
    zoom: "Дугме за зумирање",
    zoom_helper: "Пребацује између целе картице и компактног приказа",
    language: "Језик",
    lang_auto: "Аутоматски",
    no_repos: "Ниједан репозиторијум се не прати",
    no_repos_hint: "Додајте своје репозиторијуме у интеграцију GitHub да бисте их видели овде.",
    no_match: "Интеграција GitHub не прати ниједан репозиторијум картице.",
    open_integration: "Отвори интеграцију GitHub",
  },
  "sr-Latn": {
    stars: "Zvezdice",
    forks: "Forkovi",
    watchers: "Posmatrači",
    issues: "Problemi",
    pulls: "Pull zahtevi",
    merged_pulls: "Spojeni PR",
    discussions: "Diskusije",
    downloads: "Preuzimanja",
    latest_release: "Najnovije izdanje",
    latest_tag: "Najnovija oznaka",
    latest_commit: "Poslednji komit",
    latest_issue: "Poslednji problem",
    latest_pull_request: "Poslednji pull zahtev",
    latest_discussion: "Poslednja diskusija",
    account: "Nalog",
    followers: "Pratioci",
    following: "Prati",
    public_repos: "Javni repozitorijumi",
    public_gists: "Javni gistovi",
    repos_n: "Repozitorijumi: {n}",
    open_none: "Ništa otvoreno",
    open_n: "Otvoreno: {n}",
    unknown: "Nepoznato",
    open_github: "Otvori na GitHub-u",
    no_github: "Nije pronađen nijedan GitHub entitet. Da li je integracija GitHub podešena sa bar jednim repozitorijumom?",
    zoom_in: "Prikaži celu karticu",
    zoom_out: "Nazad na kompaktni prikaz",
    title: "Naslov (opciono, podrazumevano GitHub)",
    repositories: "Repozitorijumi (opciono, podrazumevano svi)",
    show_latest: "Prikaži nedavnu aktivnost",
    show_account: "Prikaži nalog",
    show_title: "Redosled repozitorijuma",
    show_subtitle: "Po imenu",
    sort: "Po zvezdicama",
    sort_name: "Po otvorenim problemima i pull zahtevima",
    sort_stars: "Prikaži naslov",
    sort_open: "Prikaži podnaslov",
    max_repos: "Repozitorijumi u kompaktnom prikazu",
    zoom: "Dugme za zumiranje",
    zoom_helper: "Prebacuje između cele kartice i kompaktnog prikaza",
    language: "Jezik",
    lang_auto: "Automatski",
    no_repos: "Nijedan repozitorijum se ne prati",
    no_repos_hint: "Dodajte svoje repozitorijume u integraciju GitHub da biste ih videli ovde.",
    no_match: "Integracija GitHub ne prati nijedan repozitorijum kartice.",
    open_integration: "Otvori integraciju GitHub",
  },
  it: {
    stars: "Stelle",
    forks: "Fork",
    watchers: "Osservatori",
    issues: "Issue",
    pulls: "Pull request",
    merged_pulls: "PR unite",
    discussions: "Discussioni",
    downloads: "Download",
    latest_release: "Ultima release",
    latest_tag: "Ultimo tag",
    latest_commit: "Ultimo commit",
    latest_issue: "Ultima issue",
    latest_pull_request: "Ultima pull request",
    latest_discussion: "Ultima discussione",
    account: "Account",
    followers: "Follower",
    following: "Seguiti",
    public_repos: "Repository pubblici",
    public_gists: "Gist pubblici",
    repos_n: "Repository: {n}",
    open_none: "Niente di aperto",
    open_n: "Aperti: {n}",
    unknown: "Sconosciuto",
    open_github: "Apri su GitHub",
    no_github: "Nessuna entità GitHub trovata. L’integrazione GitHub è configurata con almeno un repository?",
    zoom_in: "Mostra la scheda completa",
    zoom_out: "Torna alla vista compatta",
    title: "Titolo (facoltativo, GitHub per impostazione predefinita)",
    repositories: "Repository (facoltativo, tutti per impostazione predefinita)",
    show_latest: "Mostra l’attività recente",
    show_account: "Mostra l’account",
    show_title: "Ordinamento dei repository",
    show_subtitle: "Per nome",
    sort: "Per stelle",
    sort_name: "Per issue e pull request aperte",
    sort_stars: "Mostra il titolo",
    sort_open: "Mostra il sottotitolo",
    max_repos: "Repository nella vista compatta",
    zoom: "Pulsante zoom",
    zoom_helper: "Alterna tra la scheda completa e la vista compatta",
    language: "Lingua",
    lang_auto: "Automatica",
    no_repos: "Nessun repository seguito",
    no_repos_hint: "Aggiungi i tuoi repository all’integrazione GitHub per vederli qui.",
    no_match: "L’integrazione GitHub non segue nessuno dei repository della scheda.",
    open_integration: "Apri l’integrazione GitHub",
  },
  nl: {
    stars: "Sterren",
    forks: "Forks",
    watchers: "Kijkers",
    issues: "Issues",
    pulls: "Pull requests",
    merged_pulls: "Samengevoegde PR’s",
    discussions: "Discussies",
    downloads: "Downloads",
    latest_release: "Nieuwste release",
    latest_tag: "Nieuwste tag",
    latest_commit: "Laatste commit",
    latest_issue: "Nieuwste issue",
    latest_pull_request: "Nieuwste pull request",
    latest_discussion: "Nieuwste discussie",
    account: "Account",
    followers: "Volgers",
    following: "Volgend",
    public_repos: "Openbare repositories",
    public_gists: "Openbare gists",
    repos_n: "Repositories: {n}",
    open_none: "Niets open",
    open_n: "Open: {n}",
    unknown: "Onbekend",
    open_github: "Openen op GitHub",
    no_github: "Geen GitHub-entiteiten gevonden. Is de GitHub-integratie ingesteld met ten minste één repository?",
    zoom_in: "Volledige kaart tonen",
    zoom_out: "Terug naar de compacte weergave",
    title: "Titel (optioneel, standaard GitHub)",
    repositories: "Repositories (optioneel, standaard alle)",
    show_latest: "Recente activiteit tonen",
    show_account: "Account tonen",
    show_title: "Sortering van repositories",
    show_subtitle: "Op naam",
    sort: "Op sterren",
    sort_name: "Op open issues en pull requests",
    sort_stars: "Titel tonen",
    sort_open: "Ondertitel tonen",
    max_repos: "Repositories in de compacte weergave",
    zoom: "Zoomknop",
    zoom_helper: "Schakelt tussen de volledige kaart en de compacte weergave",
    language: "Taal",
    lang_auto: "Automatisch",
    no_repos: "Geen repository gevolgd",
    no_repos_hint: "Voeg je repositories toe aan de GitHub-integratie om ze hier te zien.",
    no_match: "De GitHub-integratie volgt geen enkele repository van de kaart.",
    open_integration: "GitHub-integratie openen",
  },
  pt: {
    stars: "Estrelas",
    forks: "Forks",
    watchers: "Observadores",
    issues: "Issues",
    pulls: "Pull requests",
    merged_pulls: "PR integrados",
    discussions: "Discussões",
    downloads: "Transferências",
    latest_release: "Versão mais recente",
    latest_tag: "Etiqueta mais recente",
    latest_commit: "Último commit",
    latest_issue: "Issue mais recente",
    latest_pull_request: "Pull request mais recente",
    latest_discussion: "Discussão mais recente",
    account: "Conta",
    followers: "Seguidores",
    following: "A seguir",
    public_repos: "Repositórios públicos",
    public_gists: "Gists públicos",
    repos_n: "Repositórios: {n}",
    open_none: "Nada em aberto",
    open_n: "Em aberto: {n}",
    unknown: "Desconhecido",
    open_github: "Abrir no GitHub",
    no_github: "Nenhuma entidade GitHub encontrada. A integração GitHub está configurada com pelo menos um repositório?",
    zoom_in: "Mostrar o cartão completo",
    zoom_out: "Voltar à vista compacta",
    title: "Título (opcional, GitHub por predefinição)",
    repositories: "Repositórios (opcional, todos por predefinição)",
    show_latest: "Mostrar a atividade recente",
    show_account: "Mostrar a conta",
    show_title: "Ordenação dos repositórios",
    show_subtitle: "Por nome",
    sort: "Por estrelas",
    sort_name: "Por issues e pull requests em aberto",
    sort_stars: "Mostrar o título",
    sort_open: "Mostrar o subtítulo",
    max_repos: "Repositórios na vista compacta",
    zoom: "Botão de zoom",
    zoom_helper: "Alterna entre o cartão completo e a vista compacta",
    language: "Idioma",
    lang_auto: "Automático",
    no_repos: "Nenhum repositório seguido",
    no_repos_hint: "Adicione os seus repositórios à integração GitHub para os ver aqui.",
    no_match: "A integração GitHub não segue nenhum dos repositórios do cartão.",
    open_integration: "Abrir a integração GitHub",
  },
  pl: {
    stars: "Gwiazdki",
    forks: "Forki",
    watchers: "Obserwatorzy",
    issues: "Zgłoszenia",
    pulls: "Pull requesty",
    merged_pulls: "Scalone PR",
    discussions: "Dyskusje",
    downloads: "Pobrania",
    latest_release: "Najnowsze wydanie",
    latest_tag: "Najnowszy tag",
    latest_commit: "Ostatni commit",
    latest_issue: "Najnowsze zgłoszenie",
    latest_pull_request: "Najnowszy pull request",
    latest_discussion: "Najnowsza dyskusja",
    account: "Konto",
    followers: "Obserwujący",
    following: "Obserwowani",
    public_repos: "Publiczne repozytoria",
    public_gists: "Publiczne gisty",
    repos_n: "Repozytoria: {n}",
    open_none: "Nic otwartego",
    open_n: "Otwarte: {n}",
    unknown: "Nieznany",
    open_github: "Otwórz w GitHub",
    no_github: "Nie znaleziono encji GitHub. Czy integracja GitHub jest skonfigurowana z co najmniej jednym repozytorium?",
    zoom_in: "Pokaż pełną kartę",
    zoom_out: "Wróć do widoku kompaktowego",
    title: "Tytuł (opcjonalny, domyślnie GitHub)",
    repositories: "Repozytoria (opcjonalne, domyślnie wszystkie)",
    show_latest: "Pokaż ostatnią aktywność",
    show_account: "Pokaż konto",
    show_title: "Sortowanie repozytoriów",
    show_subtitle: "Według nazwy",
    sort: "Według gwiazdek",
    sort_name: "Według otwartych zgłoszeń i pull requestów",
    sort_stars: "Pokaż tytuł",
    sort_open: "Pokaż podtytuł",
    max_repos: "Repozytoria w widoku kompaktowym",
    zoom: "Przycisk powiększenia",
    zoom_helper: "Przełącza między pełną kartą a widokiem kompaktowym",
    language: "Język",
    lang_auto: "Automatyczny",
    no_repos: "Brak śledzonych repozytoriów",
    no_repos_hint: "Dodaj swoje repozytoria do integracji GitHub, aby zobaczyć je tutaj.",
    no_match: "Integracja GitHub nie śledzi żadnego z repozytoriów karty.",
    open_integration: "Otwórz integrację GitHub",
  },
  ro: {
    stars: "Stele",
    forks: "Fork-uri",
    watchers: "Observatori",
    issues: "Issue-uri",
    pulls: "Pull request-uri",
    merged_pulls: "PR-uri îmbinate",
    discussions: "Discuții",
    downloads: "Descărcări",
    latest_release: "Cea mai recentă versiune",
    latest_tag: "Cea mai recentă etichetă",
    latest_commit: "Ultimul commit",
    latest_issue: "Cel mai recent issue",
    latest_pull_request: "Cel mai recent pull request",
    latest_discussion: "Cea mai recentă discuție",
    account: "Cont",
    followers: "Urmăritori",
    following: "Urmăriți",
    public_repos: "Depozite publice",
    public_gists: "Gist-uri publice",
    repos_n: "Depozite: {n}",
    open_none: "Nimic deschis",
    open_n: "Deschise: {n}",
    unknown: "Necunoscut",
    open_github: "Deschide pe GitHub",
    no_github: "Nu s-au găsit entități GitHub. Este integrarea GitHub configurată cu cel puțin un depozit?",
    zoom_in: "Afișează cardul complet",
    zoom_out: "Înapoi la vizualizarea compactă",
    title: "Titlu (opțional, implicit GitHub)",
    repositories: "Depozite (opțional, implicit toate)",
    show_latest: "Afișează activitatea recentă",
    show_account: "Afișează contul",
    show_title: "Sortarea depozitelor",
    show_subtitle: "După nume",
    sort: "După stele",
    sort_name: "După issue-uri și pull request-uri deschise",
    sort_stars: "Afișează titlul",
    sort_open: "Afișează subtitlul",
    max_repos: "Depozite în vizualizarea compactă",
    zoom: "Buton de zoom",
    zoom_helper: "Comută între cardul complet și vizualizarea compactă",
    language: "Limbă",
    lang_auto: "Automat",
    no_repos: "Niciun depozit urmărit",
    no_repos_hint: "Adaugă depozitele tale în integrarea GitHub pentru a le vedea aici.",
    no_match: "Integrarea GitHub nu urmărește niciunul dintre depozitele cardului.",
    open_integration: "Deschide integrarea GitHub",
  },
  da: {
    stars: "Stjerner",
    forks: "Forks",
    watchers: "Overvågere",
    issues: "Issues",
    pulls: "Pull requests",
    merged_pulls: "Flettede PR’er",
    discussions: "Diskussioner",
    downloads: "Downloads",
    latest_release: "Seneste udgivelse",
    latest_tag: "Seneste tag",
    latest_commit: "Seneste commit",
    latest_issue: "Seneste issue",
    latest_pull_request: "Seneste pull request",
    latest_discussion: "Seneste diskussion",
    account: "Konto",
    followers: "Følgere",
    following: "Følger",
    public_repos: "Offentlige repositories",
    public_gists: "Offentlige gists",
    repos_n: "Repositories: {n}",
    open_none: "Intet åbent",
    open_n: "Åbne: {n}",
    unknown: "Ukendt",
    open_github: "Åbn på GitHub",
    no_github: "Ingen GitHub-enheder fundet. Er GitHub-integrationen sat op med mindst ét repository?",
    zoom_in: "Vis hele kortet",
    zoom_out: "Tilbage til kompakt visning",
    title: "Titel (valgfri, GitHub som standard)",
    repositories: "Repositories (valgfri, alle som standard)",
    show_latest: "Vis seneste aktivitet",
    show_account: "Vis konto",
    show_title: "Sortering af repositories",
    show_subtitle: "Efter navn",
    sort: "Efter stjerner",
    sort_name: "Efter åbne issues og pull requests",
    sort_stars: "Vis titel",
    sort_open: "Vis undertitel",
    max_repos: "Repositories i kompakt visning",
    zoom: "Zoomknap",
    zoom_helper: "Skifter mellem hele kortet og kompakt visning",
    language: "Sprog",
    lang_auto: "Automatisk",
    no_repos: "Ingen repositories fulgt",
    no_repos_hint: "Tilføj dine repositories i GitHub-integrationen for at se dem her.",
    no_match: "GitHub-integrationen følger ingen af kortets repositories.",
    open_integration: "Åbn GitHub-integrationen",
  },
  sv: {
    stars: "Stjärnor",
    forks: "Forks",
    watchers: "Bevakare",
    issues: "Ärenden",
    pulls: "Pull requests",
    merged_pulls: "Sammanfogade PR",
    discussions: "Diskussioner",
    downloads: "Nedladdningar",
    latest_release: "Senaste release",
    latest_tag: "Senaste tagg",
    latest_commit: "Senaste commit",
    latest_issue: "Senaste ärende",
    latest_pull_request: "Senaste pull request",
    latest_discussion: "Senaste diskussion",
    account: "Konto",
    followers: "Följare",
    following: "Följer",
    public_repos: "Publika repon",
    public_gists: "Publika gists",
    repos_n: "Repon: {n}",
    open_none: "Inget öppet",
    open_n: "Öppna: {n}",
    unknown: "Okänd",
    open_github: "Öppna på GitHub",
    no_github: "Inga GitHub-entiteter hittades. Är GitHub-integrationen konfigurerad med minst ett repo?",
    zoom_in: "Visa hela kortet",
    zoom_out: "Tillbaka till kompakt vy",
    title: "Titel (valfri, GitHub som standard)",
    repositories: "Repon (valfritt, alla som standard)",
    show_latest: "Visa senaste aktivitet",
    show_account: "Visa konto",
    show_title: "Sortering av repon",
    show_subtitle: "Efter namn",
    sort: "Efter stjärnor",
    sort_name: "Efter öppna ärenden och pull requests",
    sort_stars: "Visa rubrik",
    sort_open: "Visa underrubrik",
    max_repos: "Repon i kompakt vy",
    zoom: "Zoomknapp",
    zoom_helper: "Växlar mellan hela kortet och kompakt vy",
    language: "Språk",
    lang_auto: "Automatiskt",
    no_repos: "Inga repon följs",
    no_repos_hint: "Lägg till dina repon i GitHub-integrationen för att se dem här.",
    no_match: "GitHub-integrationen följer inget av kortets repon.",
    open_integration: "Öppna GitHub-integrationen",
  },
  bg: {
    stars: "Звезди",
    forks: "Форкове",
    watchers: "Наблюдаващи",
    issues: "Проблеми",
    pulls: "Pull заявки",
    merged_pulls: "Слети PR",
    discussions: "Дискусии",
    downloads: "Изтегляния",
    latest_release: "Последна версия",
    latest_tag: "Последен таг",
    latest_commit: "Последен commit",
    latest_issue: "Последен проблем",
    latest_pull_request: "Последна pull заявка",
    latest_discussion: "Последна дискусия",
    account: "Акаунт",
    followers: "Последователи",
    following: "Следвани",
    public_repos: "Публични хранилища",
    public_gists: "Публични gist-ове",
    repos_n: "Хранилища: {n}",
    open_none: "Нищо отворено",
    open_n: "Отворени: {n}",
    unknown: "Неизвестно",
    open_github: "Отвори в GitHub",
    no_github: "Не са намерени GitHub обекти. Настроена ли е интеграцията GitHub с поне едно хранилище?",
    zoom_in: "Покажи цялата карта",
    zoom_out: "Обратно към компактния изглед",
    title: "Заглавие (по избор, по подразбиране GitHub)",
    repositories: "Хранилища (по избор, по подразбиране всички)",
    show_latest: "Покажи последната активност",
    show_account: "Покажи акаунта",
    show_title: "Подреждане на хранилищата",
    show_subtitle: "По име",
    sort: "По звезди",
    sort_name: "По отворени проблеми и pull заявки",
    sort_stars: "Показване на заглавието",
    sort_open: "Показване на подзаглавието",
    max_repos: "Хранилища в компактния изглед",
    zoom: "Бутон за мащабиране",
    zoom_helper: "Превключва между цялата карта и компактния изглед",
    language: "Език",
    lang_auto: "Автоматично",
    no_repos: "Няма следени хранилища",
    no_repos_hint: "Добавете хранилищата си в интеграцията GitHub, за да ги видите тук.",
    no_match: "Интеграцията GitHub не следи нито едно от хранилищата на картата.",
    open_integration: "Отвори интеграцията GitHub",
  },
  ru: {
    stars: "Звёзды",
    forks: "Форки",
    watchers: "Наблюдатели",
    issues: "Задачи",
    pulls: "Pull-запросы",
    merged_pulls: "Слитые PR",
    discussions: "Обсуждения",
    downloads: "Загрузки",
    latest_release: "Последний релиз",
    latest_tag: "Последний тег",
    latest_commit: "Последний коммит",
    latest_issue: "Последняя задача",
    latest_pull_request: "Последний pull-запрос",
    latest_discussion: "Последнее обсуждение",
    account: "Аккаунт",
    followers: "Подписчики",
    following: "Подписки",
    public_repos: "Публичные репозитории",
    public_gists: "Публичные gist",
    repos_n: "Репозитории: {n}",
    open_none: "Ничего не открыто",
    open_n: "Открыто: {n}",
    unknown: "Неизвестно",
    open_github: "Открыть на GitHub",
    no_github: "Сущности GitHub не найдены. Настроена ли интеграция GitHub хотя бы с одним репозиторием?",
    zoom_in: "Показать полную карточку",
    zoom_out: "Вернуться к компактному виду",
    title: "Заголовок (необязательно, по умолчанию GitHub)",
    repositories: "Репозитории (необязательно, по умолчанию все)",
    show_latest: "Показывать последнюю активность",
    show_account: "Показывать аккаунт",
    show_title: "Сортировка репозиториев",
    show_subtitle: "По имени",
    sort: "По звёздам",
    sort_name: "По открытым задачам и pull-запросам",
    sort_stars: "Показывать заголовок",
    sort_open: "Показывать подзаголовок",
    max_repos: "Репозитории в компактном виде",
    zoom: "Кнопка масштабирования",
    zoom_helper: "Переключает между полной карточкой и компактным видом",
    language: "Язык",
    lang_auto: "Автоматически",
    no_repos: "Нет отслеживаемых репозиториев",
    no_repos_hint: "Добавьте свои репозитории в интеграцию GitHub, чтобы увидеть их здесь.",
    no_match: "Интеграция GitHub не отслеживает ни один из репозиториев карточки.",
    open_integration: "Открыть интеграцию GitHub",
  },
  uk: {
    stars: "Зірки",
    forks: "Форки",
    watchers: "Спостерігачі",
    issues: "Задачі",
    pulls: "Pull-запити",
    merged_pulls: "Злиті PR",
    discussions: "Обговорення",
    downloads: "Завантаження",
    latest_release: "Останній реліз",
    latest_tag: "Останній тег",
    latest_commit: "Останній коміт",
    latest_issue: "Остання задача",
    latest_pull_request: "Останній pull-запит",
    latest_discussion: "Останнє обговорення",
    account: "Обліковий запис",
    followers: "Підписники",
    following: "Стежить",
    public_repos: "Публічні репозиторії",
    public_gists: "Публічні gist",
    repos_n: "Репозиторії: {n}",
    open_none: "Нічого не відкрито",
    open_n: "Відкрито: {n}",
    unknown: "Невідомо",
    open_github: "Відкрити на GitHub",
    no_github: "Сутності GitHub не знайдено. Чи налаштовано інтеграцію GitHub хоча б з одним репозиторієм?",
    zoom_in: "Показати повну картку",
    zoom_out: "Повернутися до компактного вигляду",
    title: "Заголовок (необов’язково, за замовчуванням GitHub)",
    repositories: "Репозиторії (необов’язково, за замовчуванням усі)",
    show_latest: "Показувати останню активність",
    show_account: "Показувати обліковий запис",
    show_title: "Сортування репозиторіїв",
    show_subtitle: "За назвою",
    sort: "За зірками",
    sort_name: "За відкритими задачами та pull-запитами",
    sort_stars: "Показувати заголовок",
    sort_open: "Показувати підзаголовок",
    max_repos: "Репозиторії в компактному вигляді",
    zoom: "Кнопка масштабування",
    zoom_helper: "Перемикає між повною карткою та компактним виглядом",
    language: "Мова",
    lang_auto: "Автоматично",
    no_repos: "Немає відстежуваних репозиторіїв",
    no_repos_hint: "Додайте свої репозиторії до інтеграції GitHub, щоб побачити їх тут.",
    no_match: "Інтеграція GitHub не відстежує жодного з репозиторіїв картки.",
    open_integration: "Відкрити інтеграцію GitHub",
  },
  hu: {
    stars: "Csillagok",
    forks: "Forkok",
    watchers: "Figyelők",
    issues: "Hibajegyek",
    pulls: "Pull requestek",
    merged_pulls: "Egyesített PR-ek",
    discussions: "Beszélgetések",
    downloads: "Letöltések",
    latest_release: "Legújabb kiadás",
    latest_tag: "Legújabb címke",
    latest_commit: "Legutóbbi commit",
    latest_issue: "Legújabb hibajegy",
    latest_pull_request: "Legújabb pull request",
    latest_discussion: "Legújabb beszélgetés",
    account: "Fiók",
    followers: "Követők",
    following: "Követettek",
    public_repos: "Nyilvános tárolók",
    public_gists: "Nyilvános gistek",
    repos_n: "Tárolók: {n}",
    open_none: "Nincs nyitott elem",
    open_n: "Nyitott: {n}",
    unknown: "Ismeretlen",
    open_github: "Megnyitás a GitHubon",
    no_github: "Nem található GitHub entitás. Be van állítva a GitHub integráció legalább egy tárolóval?",
    zoom_in: "Teljes kártya megjelenítése",
    zoom_out: "Vissza a kompakt nézethez",
    title: "Cím (nem kötelező, alapértelmezés: GitHub)",
    repositories: "Tárolók (nem kötelező, alapértelmezés: mind)",
    show_latest: "Legutóbbi tevékenység megjelenítése",
    show_account: "Fiók megjelenítése",
    show_title: "Tárolók rendezése",
    show_subtitle: "Név szerint",
    sort: "Csillagok szerint",
    sort_name: "Nyitott hibajegyek és pull requestek szerint",
    sort_stars: "Cím megjelenítése",
    sort_open: "Alcím megjelenítése",
    max_repos: "Tárolók a kompakt nézetben",
    zoom: "Nagyítás gomb",
    zoom_helper: "Vált a teljes kártya és a kompakt nézet között",
    language: "Nyelv",
    lang_auto: "Automatikus",
    no_repos: "Nincs követett tároló",
    no_repos_hint: "Add hozzá a tárolóidat a GitHub integrációhoz, hogy itt lásd őket.",
    no_match: "A GitHub integráció a kártya egyik tárolóját sem követi.",
    open_integration: "GitHub integráció megnyitása",
  },
  sk: {
    stars: "Hviezdičky",
    forks: "Forky",
    watchers: "Pozorovatelia",
    issues: "Problémy",
    pulls: "Pull requesty",
    merged_pulls: "Zlúčené PR",
    discussions: "Diskusie",
    downloads: "Stiahnutia",
    latest_release: "Najnovšie vydanie",
    latest_tag: "Najnovší tag",
    latest_commit: "Posledný commit",
    latest_issue: "Najnovší problém",
    latest_pull_request: "Najnovší pull request",
    latest_discussion: "Najnovšia diskusia",
    account: "Účet",
    followers: "Sledovatelia",
    following: "Sleduje",
    public_repos: "Verejné repozitáre",
    public_gists: "Verejné gisty",
    repos_n: "Repozitáre: {n}",
    open_none: "Nič otvorené",
    open_n: "Otvorené: {n}",
    unknown: "Neznámy",
    open_github: "Otvoriť na GitHube",
    no_github: "Nenašli sa žiadne entity GitHub. Je integrácia GitHub nastavená aspoň s jedným repozitárom?",
    zoom_in: "Zobraziť celú kartu",
    zoom_out: "Späť na kompaktné zobrazenie",
    title: "Názov (voliteľný, predvolene GitHub)",
    repositories: "Repozitáre (voliteľné, predvolene všetky)",
    show_latest: "Zobraziť nedávnu aktivitu",
    show_account: "Zobraziť účet",
    show_title: "Zoradenie repozitárov",
    show_subtitle: "Podľa názvu",
    sort: "Podľa hviezdičiek",
    sort_name: "Podľa otvorených problémov a pull requestov",
    sort_stars: "Zobraziť názov",
    sort_open: "Zobraziť podnázov",
    max_repos: "Repozitáre v kompaktnom zobrazení",
    zoom: "Tlačidlo priblíženia",
    zoom_helper: "Prepína medzi celou kartou a kompaktným zobrazením",
    language: "Jazyk",
    lang_auto: "Automaticky",
    no_repos: "Žiadny sledovaný repozitár",
    no_repos_hint: "Pridajte svoje repozitáre do integrácie GitHub, aby ste ich videli tu.",
    no_match: "Integrácia GitHub nesleduje žiadny z repozitárov karty.",
    open_integration: "Otvoriť integráciu GitHub",
  },
  cs: {
    stars: "Hvězdičky",
    forks: "Forky",
    watchers: "Pozorovatelé",
    issues: "Problémy",
    pulls: "Pull requesty",
    merged_pulls: "Sloučené PR",
    discussions: "Diskuze",
    downloads: "Stažení",
    latest_release: "Nejnovější vydání",
    latest_tag: "Nejnovější tag",
    latest_commit: "Poslední commit",
    latest_issue: "Nejnovější problém",
    latest_pull_request: "Nejnovější pull request",
    latest_discussion: "Nejnovější diskuze",
    account: "Účet",
    followers: "Sledující",
    following: "Sleduje",
    public_repos: "Veřejné repozitáře",
    public_gists: "Veřejné gisty",
    repos_n: "Repozitáře: {n}",
    open_none: "Nic otevřeného",
    open_n: "Otevřeno: {n}",
    unknown: "Neznámý",
    open_github: "Otevřít na GitHubu",
    no_github: "Nebyly nalezeny žádné entity GitHub. Je integrace GitHub nastavena alespoň s jedním repozitářem?",
    zoom_in: "Zobrazit celou kartu",
    zoom_out: "Zpět na kompaktní zobrazení",
    title: "Název (volitelný, výchozí GitHub)",
    repositories: "Repozitáře (volitelné, výchozí všechny)",
    show_latest: "Zobrazit nedávnou aktivitu",
    show_account: "Zobrazit účet",
    show_title: "Řazení repozitářů",
    show_subtitle: "Podle názvu",
    sort: "Podle hvězdiček",
    sort_name: "Podle otevřených problémů a pull requestů",
    sort_stars: "Zobrazit název",
    sort_open: "Zobrazit podnázev",
    max_repos: "Repozitáře v kompaktním zobrazení",
    zoom: "Tlačítko přiblížení",
    zoom_helper: "Přepíná mezi celou kartou a kompaktním zobrazením",
    language: "Jazyk",
    lang_auto: "Automaticky",
    no_repos: "Žádný sledovaný repozitář",
    no_repos_hint: "Přidejte své repozitáře do integrace GitHub, abyste je zde viděli.",
    no_match: "Integrace GitHub nesleduje žádný z repozitářů karty.",
    open_integration: "Otevřít integraci GitHub",
  },
  sl: {
    stars: "Zvezdice",
    forks: "Forki",
    watchers: "Opazovalci",
    issues: "Težave",
    pulls: "Pull requesti",
    merged_pulls: "Združeni PR",
    discussions: "Razprave",
    downloads: "Prenosi",
    latest_release: "Najnovejša izdaja",
    latest_tag: "Najnovejša oznaka",
    latest_commit: "Zadnji commit",
    latest_issue: "Najnovejša težava",
    latest_pull_request: "Najnovejši pull request",
    latest_discussion: "Najnovejša razprava",
    account: "Račun",
    followers: "Sledilci",
    following: "Sledi",
    public_repos: "Javni repozitoriji",
    public_gists: "Javni gisti",
    repos_n: "Repozitoriji: {n}",
    open_none: "Nič odprtega",
    open_n: "Odprto: {n}",
    unknown: "Neznano",
    open_github: "Odpri na GitHubu",
    no_github: "Ni najdenih entitet GitHub. Ali je integracija GitHub nastavljena z vsaj enim repozitorijem?",
    zoom_in: "Prikaži celotno kartico",
    zoom_out: "Nazaj na strnjen pogled",
    title: "Naslov (neobvezno, privzeto GitHub)",
    repositories: "Repozitoriji (neobvezno, privzeto vsi)",
    show_latest: "Prikaži nedavno dejavnost",
    show_account: "Prikaži račun",
    show_title: "Razvrščanje repozitorijev",
    show_subtitle: "Po imenu",
    sort: "Po zvezdicah",
    sort_name: "Po odprtih težavah in pull requestih",
    sort_stars: "Prikaži naslov",
    sort_open: "Prikaži podnaslov",
    max_repos: "Repozitoriji v strnjenem pogledu",
    zoom: "Gumb za povečavo",
    zoom_helper: "Preklaplja med celotno kartico in strnjenim pogledom",
    language: "Jezik",
    lang_auto: "Samodejno",
    no_repos: "Noben repozitorij ni spremljan",
    no_repos_hint: "Dodajte svoje repozitorije v integracijo GitHub, da jih vidite tukaj.",
    no_match: "Integracija GitHub ne spremlja nobenega repozitorija kartice.",
    open_integration: "Odpri integracijo GitHub",
  },
  lv: {
    stars: "Zvaigznes",
    forks: "Forki",
    watchers: "Vērotāji",
    issues: "Problēmas",
    pulls: "Pull pieprasījumi",
    merged_pulls: "Apvienotie PR",
    discussions: "Diskusijas",
    downloads: "Lejupielādes",
    latest_release: "Jaunākais laidiens",
    latest_tag: "Jaunākā birka",
    latest_commit: "Pēdējais commit",
    latest_issue: "Jaunākā problēma",
    latest_pull_request: "Jaunākais pull pieprasījums",
    latest_discussion: "Jaunākā diskusija",
    account: "Konts",
    followers: "Sekotāji",
    following: "Seko",
    public_repos: "Publiskās krātuves",
    public_gists: "Publiskie gist",
    repos_n: "Krātuves: {n}",
    open_none: "Nekas nav atvērts",
    open_n: "Atvērti: {n}",
    unknown: "Nezināms",
    open_github: "Atvērt GitHub",
    no_github: "Nav atrasta neviena GitHub entītija. Vai GitHub integrācija ir iestatīta ar vismaz vienu krātuvi?",
    zoom_in: "Rādīt pilno karti",
    zoom_out: "Atpakaļ uz kompakto skatu",
    title: "Virsraksts (neobligāts, pēc noklusējuma GitHub)",
    repositories: "Krātuves (neobligāti, pēc noklusējuma visas)",
    show_latest: "Rādīt nesenās aktivitātes",
    show_account: "Rādīt kontu",
    show_title: "Krātuvju kārtošana",
    show_subtitle: "Pēc nosaukuma",
    sort: "Pēc zvaigznēm",
    sort_name: "Pēc atvērtajām problēmām un pull pieprasījumiem",
    sort_stars: "Rādīt virsrakstu",
    sort_open: "Rādīt apakšvirsrakstu",
    max_repos: "Krātuves kompaktajā skatā",
    zoom: "Tālummaiņas poga",
    zoom_helper: "Pārslēdz starp pilno karti un kompakto skatu",
    language: "Valoda",
    lang_auto: "Automātiski",
    no_repos: "Netiek sekots nevienai krātuvei",
    no_repos_hint: "Pievienojiet savas krātuves GitHub integrācijai, lai tās redzētu šeit.",
    no_match: "GitHub integrācija neseko nevienai kartes krātuvei.",
    open_integration: "Atvērt GitHub integrāciju",
  },
  el: {
    stars: "Αστέρια",
    forks: "Forks",
    watchers: "Παρατηρητές",
    issues: "Ζητήματα",
    pulls: "Pull requests",
    merged_pulls: "Συγχωνευμένα PR",
    discussions: "Συζητήσεις",
    downloads: "Λήψεις",
    latest_release: "Τελευταία έκδοση",
    latest_tag: "Τελευταία ετικέτα",
    latest_commit: "Τελευταίο commit",
    latest_issue: "Τελευταίο ζήτημα",
    latest_pull_request: "Τελευταίο pull request",
    latest_discussion: "Τελευταία συζήτηση",
    account: "Λογαριασμός",
    followers: "Ακόλουθοι",
    following: "Ακολουθεί",
    public_repos: "Δημόσια αποθετήρια",
    public_gists: "Δημόσια gists",
    repos_n: "Αποθετήρια: {n}",
    open_none: "Τίποτα ανοιχτό",
    open_n: "Ανοιχτά: {n}",
    unknown: "Άγνωστο",
    open_github: "Άνοιγμα στο GitHub",
    no_github: "Δεν βρέθηκαν οντότητες GitHub. Έχει ρυθμιστεί η ενσωμάτωση GitHub με τουλάχιστον ένα αποθετήριο;",
    zoom_in: "Εμφάνιση πλήρους κάρτας",
    zoom_out: "Επιστροφή στη συμπαγή προβολή",
    title: "Τίτλος (προαιρετικός, προεπιλογή GitHub)",
    repositories: "Αποθετήρια (προαιρετικά, προεπιλογή όλα)",
    show_latest: "Εμφάνιση πρόσφατης δραστηριότητας",
    show_account: "Εμφάνιση λογαριασμού",
    show_title: "Ταξινόμηση αποθετηρίων",
    show_subtitle: "Κατά όνομα",
    sort: "Κατά αστέρια",
    sort_name: "Κατά ανοιχτά ζητήματα και pull requests",
    sort_stars: "Εμφάνιση τίτλου",
    sort_open: "Εμφάνιση υπότιτλου",
    max_repos: "Αποθετήρια στη συμπαγή προβολή",
    zoom: "Κουμπί μεγέθυνσης",
    zoom_helper: "Εναλλάσσει μεταξύ πλήρους κάρτας και συμπαγούς προβολής",
    language: "Γλώσσα",
    lang_auto: "Αυτόματα",
    no_repos: "Δεν παρακολουθείται κανένα αποθετήριο",
    no_repos_hint: "Προσθέστε τα αποθετήριά σας στην ενσωμάτωση GitHub για να τα δείτε εδώ.",
    no_match: "Η ενσωμάτωση GitHub δεν παρακολουθεί κανένα από τα αποθετήρια της κάρτας.",
    open_integration: "Άνοιγμα της ενσωμάτωσης GitHub",
  },
};

const LANGUAGES = [
  ["en", "English"], ["fr", "Français"], ["de", "Deutsch"], ["es", "Español"], ["sr", "Српски"], ["sr-Latn", "Srpski (latinica)"],
  ["it", "Italiano"], ["nl", "Nederlands"], ["pt", "Português (Portugal)"], ["pl", "Polski"], ["ro", "Română"], ["da", "Dansk"],
  ["sv", "Svenska"], ["bg", "Български"], ["ru", "Русский"], ["uk", "Українська"], ["hu", "Magyar"], ["sk", "Slovenčina"],
  ["cs", "Čeština"], ["sl", "Slovenščina"], ["lv", "Latviešu"], ["el", "Ελληνικά"],
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const lang = (hass, config) => {
  const l = config?.language || (hass && (hass.locale?.language || hass.language)) || "en";
  return STRINGS[l] ? l : STRINGS[l.split("-")[0]] ? l.split("-")[0] : "en";
};

// Locale for Intl: Home Assistant's full locale when its base matches the card's language (keeps the region), else
// the resolved language; Home Assistant's "pt" is European Portuguese, which Intl would format as Brazilian.
const fmtLang = (hass, config) => {
  const l = lang(hass, config);
  const ha = hass && (hass.locale?.language || hass.language);
  const loc = ha && ha.split("-")[0] === l ? ha : l;
  return loc === "pt" ? "pt-PT" : loc;
};

const t = (hass, config, key) => STRINGS[lang(hass, config)][key] ?? STRINGS.en[key] ?? key;

/** A count in the compact notation of the locale (1.2k, 1,2 k, 78K…), the exact number in `fmtFull`. */
const fmtCount = (v, loc = "en") => {
  if (v === null || v === undefined) return "—";
  try {
    return new Intl.NumberFormat(loc, { notation: "compact", maximumFractionDigits: 1 }).format(v);
  } catch {
    return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(v);
  }
};
const fmtFull = (v, loc = "en") => {
  if (v === null || v === undefined) return "—";
  try {
    return new Intl.NumberFormat(loc).format(v);
  } catch {
    return String(v);
  }
};

const isUnknown = (s) => !s || s.state === "unavailable" || s.state === "unknown";

/** Only web links: a state attribute never becomes a javascript: URL. */
const safeUrl = (u) => (/^https?:\/\//i.test(String(u || "")) ? String(u) : "");

const svgIcon = (path, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;

const fireMoreInfo = (node, entityId) => {
  if (!entityId) return;
  node.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
};

/** A click inside a dialog (more-info opened from the card) is not a click outside the card. */
const inDialog = (ev) => ev.composedPath().some((n) => ["ha-more-info-dialog", "ha-dialog", "dialog"].includes(n.localName));

// "A click elsewhere" is caught on the pointer, not only on the click event: on iOS (Safari and the companion app) a
// tap on something that is not clickable (the background, an empty spot, a card with no action) sends no click to the
// page. It counts when the press and the release are both outside the card (a slider dragged out of the card does not
// fold it), and a scroll does not count (the browser cancels the pointer). Keyboard clicks still go through the click
// event. `tap(ev)` (a press and a release at the same spot) is for the tests.
const watchOutside = (isOut, handler) => {
  let downOutside = false;
  const onDown = (ev) => {
    downOutside = isOut(ev);
  };
  const onUp = (ev) => {
    if (downOutside && isOut(ev)) handler(ev);
    downOutside = false;
  };
  const onClick = (ev) => {
    if (ev.detail === 0 && isOut(ev)) handler(ev);
  };
  return {
    on() {
      document.addEventListener("pointerdown", onDown, true);
      document.addEventListener("pointerup", onUp, true);
      document.addEventListener("click", onClick, true);
    },
    tap(ev) {
      onDown(ev);
      onUp(ev);
    },
    off() {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointerup", onUp, true);
      document.removeEventListener("click", onClick, true);
    },
  };
};

// ---------------------------------------------------------------------------
// Discovery
// ---------------------------------------------------------------------------

// Counters of a repository: translation key, label key, icon, colour class.
const REPO_STATS = [
  ["stargazers_count", "stars", ICONS.star, "star"],
  ["forks_count", "forks", ICONS.fork, "fork"],
  ["subscribers_count", "watchers", ICONS.eye, "watch"],
  ["issues_count", "issues", ICONS.issue, "issue"],
  ["pulls_count", "pulls", ICONS.pr, "pr"],
  ["merged_pulls_count", "merged_pulls", ICONS.merge, "merged"],
  ["discussions_count", "discussions", ICONS.forum, "disc"],
  ["latest_release_downloads", "downloads", ICONS.download, "dl"],
];

// Latest activity of a repository: translation key and icon (the label key is the translation key).
const REPO_LATEST = [
  ["latest_release", ICONS.release],
  ["latest_tag", ICONS.tag],
  ["latest_commit", ICONS.commit],
  ["latest_pull_request", ICONS.pr],
  ["latest_issue", ICONS.issue],
  ["latest_discussion", ICONS.forum],
];

// Counters of the account (disabled by default in the integration).
const USER_STATS = [
  ["followers", "followers", ICONS.group, "user"],
  ["following", "following", ICONS.account, "user"],
  ["public_repos", "public_repos", ICONS.code, "user"],
  ["public_gists", "public_gists", ICONS.code, "user"],
];

const REPO_KEYS = new Set([...REPO_STATS.map(([k]) => k), ...REPO_LATEST.map(([k]) => k)]);
const USER_KEYS = new Set(USER_STATS.map(([k]) => k));

// Without a translation key in the registry: the end of the English entity id, made from the English names.
const ID_SUFFIXES = Object.entries({
  stargazers_count: "stars",
  forks_count: "forks",
  subscribers_count: "watchers",
  issues_count: "issues",
  pulls_count: "pull_requests",
  merged_pulls_count: "merged_pull_requests",
  discussions_count: "discussions",
  latest_release_downloads: "latest_release_downloads",
  latest_release: "latest_release",
  latest_tag: "latest_tag",
  latest_commit: "latest_commit",
  latest_issue: "latest_issue",
  latest_pull_request: "latest_pull_request",
  latest_discussion: "latest_discussion",
  followers: "followers",
  following: "following",
  public_repos: "public_repositories",
  public_gists: "public_gists",
}).sort((a, b) => b[1].length - a[1].length);

const keyOf = (e) => {
  if (e.translation_key) return REPO_KEYS.has(e.translation_key) || USER_KEYS.has(e.translation_key) ? e.translation_key : null;
  return ID_SUFFIXES.find(([, sfx]) => e.entity_id.endsWith(`_${sfx}`))?.[0] || null;
};

let discoveryCache = null;

/**
 * The repositories and accounts of the GitHub integration, from the entity registry: one group per device (a
 * repository's device is named after its full name, owner/repo; an account's after its login), each with its
 * sensors by translation key. Cached until the entity or device registry changes.
 */
const discover = (hass) => {
  if (discoveryCache && discoveryCache.entities === hass.entities && discoveryCache.devices === hass.devices) return discoveryCache.result;
  const groups = { repos: new Map(), users: new Map() };
  for (const e of Object.values(hass.entities || {})) {
    if (e.platform !== "github" || !String(e.entity_id).startsWith("sensor.") || e.hidden) continue;
    const key = keyOf(e);
    if (!key) continue;
    const map = USER_KEYS.has(key) ? groups.users : groups.repos;
    const id = e.device_id || "github";
    if (!map.has(id)) {
      const dev = hass.devices?.[e.device_id];
      const name = dev?.name || "";
      map.set(id, {
        id,
        name,
        label: dev?.name_by_user || name || "GitHub",
        url: safeUrl(dev?.configuration_url) || (name ? `https://github.com/${name}` : ""),
        s: {},
      });
    }
    map.get(id).s[key] = e.entity_id;
  }
  const result = { repos: [...groups.repos.values()], users: [...groups.users.values()] };
  discoveryCache = { entities: hass.entities, devices: hass.devices, result };
  return result;
};

const trackedIds = (gh) => [...gh.repos, ...gh.users].flatMap((g) => Object.values(g.s));

/** What a render depends on: the registries, the language, and the states of the GitHub sensors. */
const renderSignature = (hass) => {
  const gh = discover(hass);
  return [hass.entities, hass.devices, hass.language, hass.locale, ...trackedIds(gh).map((id) => hass.states[id])];
};

const sameSignature = (a, b) => !!a && a.length === b.length && a.every((v, i) => v === b[i]);

/** Selector finding the same focused element after a re-render, from its data-* attributes. */
const focusSelector = (el) => {
  const d = el?.dataset;
  if (!d?.action && !d?.entity) return null;
  return ["action", "target", "entity"]
    .filter((k) => d[k] !== undefined)
    .map((k) => `[data-${k}="${String(d[k]).replace(/["\\]/g, "\\$&")}"]`)
    .join("");
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const BASE_STYLE = `
  :host { display: block; }
  :host { --gh-accent: #8957e5; --gh-blue: #18bcf2; --gh-ok: var(--success-color, #43a047); --gh-warn: var(--warning-color, #ffa600);
          --gh-crit: var(--error-color, #db4437); --gh-focus: var(--primary-color, #03a9f4);
          --gh-star: #e3a008; --gh-green: #2da44e; --gh-purple: #8957e5; }
  ha-card { overflow: hidden; position: relative; }
  .icon { width: 18px; height: 18px; fill: currentColor; flex: none; }
  .muted { color: var(--secondary-text-color); --c: var(--secondary-text-color); }
  .clickable { cursor: pointer; }
  [role="button"]:focus-visible, a:focus-visible { outline: 2px solid var(--gh-focus); outline-offset: -2px; }
  .good { --c: var(--gh-ok); } .open { --c: var(--gh-blue); }
  .star { --c: var(--gh-star); } .fork, .watch, .disc, .dl, .user { --c: var(--gh-blue); }
  .issue, .pr { --c: var(--gh-green); } .merged { --c: var(--gh-purple); }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--c, var(--gh-ok)); flex: none; display: inline-block; }
  .chip { display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px; border-radius: 12px; font-size: 11px; font-weight: 500;
          background: color-mix(in srgb, var(--c, var(--gh-ok)) 15%, transparent); color: color-mix(in srgb, var(--c, var(--gh-ok)) 45%, var(--primary-text-color)); }
  .header { display: flex; align-items: center; gap: 10px; padding: 12px 12px 8px; container: gh-header / inline-size; }
  .titles { flex: 1 1 0; min-width: 6.5ch; font-size: 16px; }
  :host([hide-title]) .titles .name, :host([hide-subtitle]) .titles > .sub { display: none; }
  .title-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; row-gap: 2px; }
  .title-row > .name { flex: 1 1 0; min-width: min(6.5ch, 100%); }
  .name { font-size: 16px; font-weight: 500; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sub { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  /* Round tinted icon, 40 px, in the project's accent. */
  .logo { flex: none; width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; align-self: flex-start;
          background: color-mix(in srgb, var(--gh-accent) 16%, transparent); color: var(--gh-accent); }
  .logo .icon { width: 24px; height: 24px; }
  .title-row > .chip { flex: 0 1 auto; min-width: 0; white-space: nowrap; }
  .title-row > .chip > .chip-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  @container gh-header (max-width: 180px) {
    .title-row > .chip { padding: 4px; }
    .title-row > .chip > .chip-text { display: none; }
  }
  @container gh-header (max-width: 131px) { .header .logo { display: none; } }
  .warning { padding: 16px; color: color-mix(in srgb, var(--gh-warn) 45%, var(--primary-text-color)); }
  .zoom { all: unset; flex: none; cursor: pointer; width: 24px; height: 24px; margin: -4px -4px -4px 0; border-radius: 50%;
          display: grid; place-items: center; color: var(--secondary-text-color); align-self: flex-start; margin-top: 0; }
  .zoom .icon { width: 16px; height: 16px; }
  .zoom:hover { background: color-mix(in srgb, var(--secondary-text-color) 16%, transparent); color: var(--primary-text-color); }
  .zoom:focus-visible { outline: 2px solid var(--gh-focus); outline-offset: 1px; }
  .content { padding: 0 12px 12px; display: flex; flex-direction: column; gap: 8px; container: gh-content / inline-size; }
  /* Counter tiles: icon in its colour, label, value. */
  .tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(124px, 1fr)); gap: 6px; }
  .tile { display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 10px; min-width: 0;
          background: var(--secondary-background-color, rgba(127,127,127,.08)); }
  .tile .icon { color: var(--c, var(--gh-blue)); width: 16px; height: 16px; }
  .tile > div { min-width: 0; }
  .tile .k { font-size: 11px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tile .v { font-size: 14px; font-weight: 500; }
  /* Links to GitHub: an icon button, never a filled one. */
  .link { flex: none; display: grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; color: var(--secondary-text-color); }
  .link .icon { width: 14px; height: 14px; }
  .link:hover { background: color-mix(in srgb, var(--secondary-text-color) 16%, transparent); color: var(--primary-text-color); }
  /* No repository shown: what to do, and an outlined button to the GitHub integration (never a filled one). */
  .empty { display: flex; gap: 10px; align-items: flex-start; padding: 10px 12px; border-radius: 10px;
           background: var(--secondary-background-color, rgba(127,127,127,.08)); }
  .empty > .icon { color: var(--gh-accent); margin-top: 1px; }
  .empty .t { font-size: 14px; font-weight: 500; }
  .empty .h { font-size: 12px; color: var(--secondary-text-color); margin-top: 2px; }
  .empty .action { all: unset; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; margin-top: 8px; padding: 4px 12px;
                   border-radius: 16px; font-size: 12px; font-weight: 500; color: var(--gh-accent);
                   border: 1px solid color-mix(in srgb, var(--gh-accent) 50%, transparent); }
  .empty .action .icon { width: 14px; height: 14px; }
  .empty .action:hover { background: color-mix(in srgb, var(--gh-accent) 12%, transparent); }
  .empty .action:focus-visible { outline: 2px solid var(--gh-focus); outline-offset: 1px; }
`;

/** Opens a page of the Home Assistant frontend, as its own links do. */
const navigate = (path) => {
  window.history.pushState(null, "", path);
  window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
};

const INTEGRATION_PATH = "/config/integrations/integration/github";

const FULL_STYLE = `
  .section-title { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; text-transform: uppercase;
                   letter-spacing: .04em; color: var(--secondary-text-color); margin: 4px 0 2px; }
  .section-title .icon { width: 16px; height: 16px; }
  .section-title .label { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-transform: none; letter-spacing: 0; }
  .content.embed { padding: 0; }
  .repo { border-radius: 12px; border: 1px solid var(--divider-color, rgba(127,127,127,.2)); overflow: hidden; }
  .repo-head { display: flex; align-items: center; gap: 8px; padding: 8px 6px 8px 10px; min-height: 24px; }
  .repo-head.toggle { cursor: pointer; user-select: none; }
  .repo-head .icon { color: var(--secondary-text-color); }
  .repo-head .repo-name { flex: 1 1 0; min-width: 0; font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .repo-head .counts { display: inline-flex; gap: 10px; font-size: 12px; color: var(--secondary-text-color); flex: none; }
  .repo-head .counts > span { display: inline-flex; align-items: center; gap: 3px; }
  .repo-head .counts .icon { width: 14px; height: 14px; color: var(--c); }
  /* Folded: chevron to the right; unfolded: down (as in ha-carburants-france). */
  .repo-head .chevron { transition: transform .15s; }
  .repo-head.closed .chevron { transform: rotate(-90deg); }
  .repo-body { padding: 0 10px 10px; display: flex; flex-direction: column; gap: 8px; }
  .latest { display: flex; flex-direction: column; gap: 2px; }
  .row { display: grid; grid-template-columns: 18px minmax(0, max-content) minmax(0, 1fr) auto; align-items: center; gap: 8px; font-size: 13px; min-height: 26px; }
  .row .icon { color: var(--secondary-text-color); }
  .row .k { color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .row .v { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .row .v small { color: var(--secondary-text-color); font-size: 11px; margin-left: 4px; }
  /* Narrow card: the label goes under the icon line, the value keeps its width. */
  @container gh-content (max-width: 300px) {
    .row { grid-template-columns: 18px minmax(0, 1fr) auto; }
    .row .k { display: none; }
    .repo-head .counts .c-pr, .repo-head .counts .c-issue { display: none; }
  }
`;

const MINI_STYLE = `
  .title-row > .chip { display: none; }
  .tiles { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .tiles .tile { justify-content: center; padding: 6px 4px; gap: 4px; }
  .tiles .tile .k { display: none; }
  @container gh-content (max-width: 220px) { .tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  .list { display: grid; grid-template-columns: minmax(0, 1fr) repeat(3, max-content); column-gap: 10px; row-gap: 2px; }
  .item { display: grid; grid-template-columns: subgrid; grid-column: 1 / -1; align-items: center; font-size: 13px; padding: 3px 0; }
  .item .n { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .item > span:not(.n) { display: inline-flex; align-items: center; gap: 3px; justify-content: flex-end; font-size: 12px; color: var(--secondary-text-color); }
  .item .icon { width: 14px; height: 14px; color: var(--c); }
  .item.more { color: var(--secondary-text-color); font-size: 12px; }
  .foot { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 4px 8px; font-size: 12px; color: var(--secondary-text-color); }
  .foot span { display: inline-flex; align-items: center; gap: 4px; }
  .foot .icon { width: 14px; height: 14px; }
`;

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

class GitHubBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._html = "";
    this._openRepo = null;
    // No rewrite of the card between a press and its click: Home Assistant updates the card several times a second,
    // and a rewrite under the pointer replaces the element pressed, so that the click lands on the card itself and
    // does nothing. The update held back is drawn once released: by the click (registered before the card's own
    // handler, which renders at once), else right after the release.
    this._onPress = () => {
      this._byPointer = true;
      this._pressing = true;
      window.addEventListener("pointerup", this._onPressEnd, true);
      window.addEventListener("pointercancel", this._onPressEnd, true);
    };
    this._onPressEnd = () => {
      window.removeEventListener("pointerup", this._onPressEnd, true);
      window.removeEventListener("pointercancel", this._onPressEnd, true);
      setTimeout(() => {
        this._pressing = false;
        if (this._dirty) this._update();
      }, 0);
    };
    this._onPressClick = (ev) => {
      if (ev.detail === 0) this._byPointer = false;
      this._pressing = false;
    };
    this.shadowRoot.addEventListener("pointerdown", this._onPress);
    this.shadowRoot.addEventListener("click", this._onPressClick);
    // From the keyboard, the focus is kept across rewrites (with the pointer it would draw the focus ring).
    this.shadowRoot.addEventListener("keydown", () => {
      this._byPointer = false;
    });
    this.shadowRoot.addEventListener("click", (ev) => {
      const path = ev.composedPath();
      // A link to GitHub opens in a new tab: no other action.
      if (path.some((n) => n.localName === "a")) return;
      const action = path.find((n) => n.dataset?.action);
      if (action) return this._action(action.dataset.action, action.dataset.target, ev);
      const el = path.find((n) => n.dataset?.entity);
      if (el) fireMoreInfo(this, el.dataset.entity);
    });
    this.shadowRoot.addEventListener("keydown", (ev) => {
      if ((ev.key === "Enter" || ev.key === " ") && ev.target?.getAttribute?.("role") === "button") {
        ev.preventDefault();
        ev.target.click();
      }
    });
    // A tap elsewhere folds the unfolded repository (as in ha-carburants-france).
    this._outside = watchOutside(
      (ev) => !ev.composedPath().includes(this) && !inDialog(ev),
      () => {
        if (this._openRepo === null) return;
        this._openRepo = null;
        this._update();
      },
    );
  }

  connectedCallback() {
    this._outside.on();
    // Back on the page after leaving it: rendered again in its default state.
    if (this._hass && this._config) this._update();
  }

  disconnectedCallback() {
    this._pressing = this._dirty = false;
    window.removeEventListener("pointerup", this._onPressEnd, true);
    window.removeEventListener("pointercancel", this._onPressEnd, true);
    this._outside.off();
    // Left (another dashboard view, a conditional card hidden): the repository folds back.
    this._openRepo = null;
  }

  set hass(hass) {
    this._hass = hass;
    const sig = renderSignature(hass);
    if (sameSignature(this._sig, sig)) return;
    this._sig = sig;
    this._update();
  }

  get hass() {
    return this._hass;
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    if (config.repositories !== undefined && !Array.isArray(config.repositories))
      throw new Error("repositories must be a list of owner/repo names");
    this._config = { ...config };
    // show_title / show_subtitle: the header's title / subtitle, hidden by the stylesheet
    this.toggleAttribute?.("hide-title", config.show_title === false);
    this.toggleAttribute?.("hide-subtitle", config.show_subtitle === false);
    this._html = "";
    this._update();
  }

  _action(action, target) {
    if (action === "integration") return navigate(INTEGRATION_PATH);
    if (action === "repo") {
      this._openRepo = this._openRepo === target ? null : target;
      this._update();
    }
  }

  _t(key) {
    return t(this._hass, this._config, key);
  }

  _loc() {
    return fmtLang(this._hass, this._config);
  }

  _s(id) {
    return id ? this._hass.states[id] : undefined;
  }

  /** A counter sensor as a number, or null when missing, unavailable or not a number. */
  _num(id) {
    const s = this._s(id);
    if (isUnknown(s)) return null;
    const v = Number.parseFloat(s.state);
    return Number.isFinite(v) ? v : null;
  }

  _update() {
    if (!this._hass || !this._config) return;
    // Held back under a press (see the constructor): drawn once released.
    if (this._pressing) {
      this._dirty = true;
      return;
    }
    this._dirty = false;
    const html = this._render();
    if (html !== this._html) {
      // Kept across the rewrite for the keyboard only (with the pointer it would draw the focus ring).
      const focused = this._byPointer ? null : focusSelector(this.shadowRoot.activeElement);
      this._html = html;
      this.shadowRoot.innerHTML = html;
      if (focused) this.shadowRoot.querySelector(focused)?.focus({ preventScroll: true });
    }
  }

  /** Open issues and pull requests of a repository (null when neither is known). */
  _openCount(r) {
    const a = this._num(r.s.issues_count);
    const b = this._num(r.s.pulls_count);
    return a === null && b === null ? null : (a || 0) + (b || 0);
  }

  /**
   * The repositories shown: those with a state, restricted to `repositories` (owner/repo, any case) when set, in its
   * order, else sorted by name; `sort: stars` or `sort: open` puts the most starred or the busiest first.
   */
  _repos() {
    const gh = discover(this._hass);
    const c = this._config;
    let list = gh.repos.filter((r) => Object.values(r.s).some((id) => this._hass.states[id]));
    const want = (c.repositories || []).map((x) => String(x).trim().toLowerCase()).filter(Boolean);
    const rank = (r) => {
      const i = want.findIndex((w) => w === r.name.toLowerCase() || w === r.label.toLowerCase());
      return i < 0 ? Infinity : i;
    };
    if (want.length) list = list.filter((r) => rank(r) !== Infinity);
    const byName = (a, b) => a.label.localeCompare(b.label);
    const sort = c.sort || (want.length ? "config" : "name");
    const value = (r) => (sort === "stars" ? this._num(r.s.stargazers_count) : this._openCount(r)) ?? -1;
    if (sort === "config") list.sort((a, b) => rank(a) - rank(b));
    else if (sort === "stars" || sort === "open") list.sort((a, b) => value(b) - value(a) || byName(a, b));
    else list.sort(byName);
    return list;
  }

  _users() {
    if (this._config.show_account === false) return [];
    return discover(this._hass).users.filter((u) => Object.values(u.s).some((id) => this._hass.states[id]));
  }

  _sum(repos, key) {
    const values = repos.map((r) => this._num(r.s[key])).filter((v) => v !== null);
    return values.length ? values.reduce((a, b) => a + b, 0) : null;
  }

  /** Overall status: the open issues and pull requests of the repositories shown. */
  _status(repos) {
    if (!repos.length) return { cls: "muted", text: this._t("no_repos") };
    const counts = repos.map((r) => this._openCount(r)).filter((v) => v !== null);
    if (!counts.length) return { cls: "muted", text: this._t("unknown") };
    const n = counts.reduce((a, b) => a + b, 0);
    return n ? { cls: "open", text: this._t("open_n").replace("{n}", fmtFull(n, this._loc())) } : { cls: "good", text: this._t("open_none") };
  }

  _header(repos, aside = "") {
    const st = this._status(repos);
    // Without a repository, the message under the header says so: no pill.
    const chip = repos.length
      ? `<span class="chip ${st.cls}" title="${esc(st.text)}" aria-label="${esc(st.text)}"><span class="dot"></span><span class="chip-text">${esc(st.text)}</span></span>`
      : "";
    const stars = this._sum(repos, "stargazers_count");
    const sub = [repos.length ? this._t("repos_n").replace("{n}", repos.length) : "", stars !== null ? `★ ${fmtCount(stars, this._loc())}` : ""].filter(Boolean).join(" · ");
    return `
      <div class="header">
        <span class="logo" aria-hidden="true">${svgIcon(ICONS.github)}</span>
        <div class="titles">
          <div class="title-row"><div class="name">${esc(this._config.title || "GitHub")}</div>${chip}</div>
          <div class="sub">${esc(sub)}</div>
        </div>
        ${aside}
      </div>`;
  }

  _tile(id, label, icon, cls) {
    const v = this._num(id);
    const title = `${label}: ${fmtFull(v, this._loc())}`;
    return `<div class="tile clickable ${cls}" data-entity="${esc(id)}" role="button" tabindex="0" title="${esc(title)}" aria-label="${esc(title)}">${svgIcon(icon)}<div>
        <div class="k">${esc(label)}</div><div class="v">${fmtCount(v, this._loc())}</div></div></div>`;
  }

  _tiles(stats, group) {
    const tiles = stats.filter(([k]) => group.s[k]).map(([k, label, icon, cls]) => this._tile(group.s[k], this._t(label), icon, cls));
    return tiles.length ? `<div class="tiles">${tiles.join("")}</div>` : "";
  }

  _link(url) {
    const u = safeUrl(url);
    const title = esc(this._t("open_github"));
    return u ? `<a class="link" href="${esc(u)}" target="_blank" rel="noopener noreferrer" title="${title}" aria-label="${title}">${svgIcon(ICONS.open)}</a>` : "";
  }

  /**
   * No repository to show: the GitHub integration follows none (only the account), or none of those of the
   * `repositories` option. Says which, with a button that opens the integration's page to add some.
   */
  _empty() {
    const filtered = discover(this._hass).repos.length > 0;
    return `<div class="empty">${svgIcon(ICONS.github)}<div>
        <div class="t">${esc(this._t("no_repos"))}</div>
        <div class="h">${esc(this._t(filtered ? "no_match" : "no_repos_hint"))}</div>
        <button class="action" data-action="integration">${svgIcon(ICONS.open)}${esc(this._t("open_integration"))}</button>
      </div></div>`;
  }

  _noGh() {
    return `<style>${BASE_STYLE}</style><ha-card><div class="warning">${esc(this._t("no_github"))}</div></ha-card>`;
  }
}

/** Full card: every repository as a foldable section (counters and latest activity), then the account. */
class GitHubCard extends GitHubBase {
  static getConfigElement() {
    return document.createElement("github-card-editor");
  }

  static getStubConfig() {
    return {};
  }

  getCardSize() {
    return 2 + this._repoCount() * 1;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6 };
  }

  _repoCount() {
    return this._hass && this._config ? this._repos().length : 3;
  }

  _render() {
    const repos = this._repos();
    // `embed` (the GitHub panel's Repositories tab): only the counters and the latest activity of the repositories,
    // and the account section, without the card's frame, header or foldable sections.
    if (this._config.embed) {
      // The repositories listed in `repositories` (none without it), then the account unless `show_account: false`.
      const shown = (this._config.repositories || []).length ? repos : [];
      const body = shown.map((r) => `${this._tiles(REPO_STATS, r)}${this._config.show_latest === false ? "" : this._latest(r)}`);
      body.push(...this._users().map((u) => this._accountSection(u)));
      return body.some(Boolean) ? `<style>${BASE_STYLE}${FULL_STYLE}</style><div class="content embed">${body.join("")}</div>` : "";
    }
    const users = this._users();
    if (!repos.length && !users.length) return this._noGh();
    // A single repository is always unfolded; otherwise one at a time, folded on a click elsewhere.
    const single = repos.length === 1;
    const sections = repos.length ? repos.map((r) => this._repoSection(r, single)) : [this._empty()];
    for (const u of users) sections.push(this._accountSection(u));
    return `<style>${BASE_STYLE}${FULL_STYLE}</style>
      <ha-card>
        ${this._header(repos, this._aside?.() || "")}
        <div class="content">${sections.join("")}</div>
      </ha-card>`;
  }

  _repoSection(r, single) {
    const open = single || this._openRepo === r.id;
    const count = (key, icon, cls) => {
      if (!r.s[key]) return "";
      const v = this._num(r.s[key]);
      return `<span class="c-${cls} ${cls}" title="${esc(`${this._t(REPO_STATS.find(([k]) => k === key)[1])}: ${fmtFull(v, this._loc())}`)}">${svgIcon(icon)}${fmtCount(v, this._loc())}</span>`;
    };
    const toggle = single ? "" : ` toggle${open ? "" : " closed"}" data-action="repo" data-target="${esc(r.id)}" role="button" tabindex="0" aria-expanded="${open}`;
    const head = `<div class="repo-head${toggle}">
        ${svgIcon(ICONS.code)}<span class="repo-name" title="${esc(r.label)}">${esc(r.label)}</span>
        <span class="counts">${count("stargazers_count", ICONS.star, "star")}${count("issues_count", ICONS.issue, "issue")}${count("pulls_count", ICONS.pr, "pr")}</span>
        ${this._link(r.url)}${single ? "" : svgIcon(ICONS.chevron, "chevron")}
      </div>`;
    if (!open) return `<div class="repo">${head}</div>`;
    const latest = this._config.show_latest === false ? "" : this._latest(r);
    return `<div class="repo">${head}<div class="repo-body">${this._tiles(REPO_STATS, r)}${latest}</div></div>`;
  }

  /** Latest release, tag, commit, pull request, issue and discussion, each opening its page on GitHub. */
  _latest(r) {
    const rows = REPO_LATEST.filter(([k]) => r.s[k]).map(([k, icon]) => {
      const s = this._s(r.s[k]);
      const a = s?.attributes || {};
      const unknown = isUnknown(s);
      let value = unknown ? "—" : esc(String(s.state).split("\n")[0]);
      if (!unknown && k === "latest_commit" && a.sha) value += `<small>${esc(String(a.sha).slice(0, 7))}</small>`;
      if (!unknown && a.number !== undefined) value += `<small>#${esc(a.number)}</small>`;
      if (!unknown && k === "latest_release" && a.tag && a.tag !== s.state) value += `<small>${esc(a.tag)}</small>`;
      const label = esc(this._t(k));
      return `<div class="row clickable" data-entity="${esc(r.s[k])}" role="button" tabindex="0" title="${label}">
          ${svgIcon(icon)}<span class="k">${label}</span><span class="v">${value}</span>${unknown ? "" : this._link(a.url)}
        </div>`;
    });
    return rows.length ? `<div class="latest">${rows.join("")}</div>` : "";
  }

  _accountSection(u) {
    const tiles = this._tiles(USER_STATS, u);
    if (!tiles) return "";
    return `<div>
        <div class="section-title">${svgIcon(ICONS.account)}<span class="label" title="${esc(u.label)}">${esc(this._t("account"))} · ${esc(u.label)}</span>${this._link(u.url)}</div>
        ${tiles}
      </div>`;
  }
}

/**
 * Compact card: total stars, forks, issues and pull requests, then one line per repository. Its zoom button (top
 * right, `zoom: false` removes it) switches it to the full card and back; a click outside the card brings the compact
 * view back. A click on a repository shows the full card with that repository unfolded.
 */
class GitHubMiniCard extends GitHubCard {
  static getConfigElement() {
    return document.createElement("github-mini-card-editor");
  }

  constructor() {
    super();
    this._unzoom = watchOutside(
      (ev) => !ev.composedPath().includes(this) && !inDialog(ev),
      () => {
        if (this._zoomed) this._setZoom(false);
      },
    );
  }

  connectedCallback() {
    super.connectedCallback();
    this._unzoom.on();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unzoom.off();
    // Back to the compact view once off the screen (see the full card).
    this._zoomed = false;
  }

  getCardSize() {
    return this._zoomed ? super.getCardSize() : 3;
  }

  getGridOptions() {
    return this._zoomed ? super.getGridOptions() : { columns: 6, min_columns: 6 };
  }

  _setZoom(zoomed, repo = null) {
    this._zoomed = zoomed;
    this._openRepo = zoomed ? repo : null;
    this._update();
  }

  _action(action, target, ev) {
    if (action === "zoom") {
      ev.stopPropagation();
      this._setZoom(!this._zoomed);
      // Keyboard use (no click count) keeps the focus on the button that replaced this one.
      if (ev.detail === 0) this.shadowRoot.querySelector(".zoom")?.focus({ preventScroll: true });
      return;
    }
    if (action === "show") return this._setZoom(true, target || null);
    super._action(action, target, ev);
  }

  _aside() {
    if (this._config.zoom === false) return "";
    const title = esc(this._t(this._zoomed ? "zoom_out" : "zoom_in"));
    return `<button class="zoom" data-action="zoom" title="${title}" aria-label="${title}">${svgIcon(this._zoomed ? ICONS.collapse : ICONS.expand)}</button>`;
  }

  _render() {
    return this._zoomed ? super._render() : this._compactRender();
  }

  _compactRender() {
    const repos = this._repos();
    const users = this._users();
    if (!repos.length && !users.length) return this._noGh();
    const c = this._config;
    const loc = this._loc();
    const total = (key, label, icon, cls) => {
      const v = this._sum(repos, key);
      if (v === null) return "";
      const title = `${this._t(label)}: ${fmtFull(v, loc)}`;
      return `<div class="tile ${cls}" title="${esc(title)}" aria-label="${esc(title)}">${svgIcon(icon)}<div><div class="k">${esc(this._t(label))}</div><div class="v">${fmtCount(v, loc)}</div></div></div>`;
    };
    const totals = [
      total("stargazers_count", "stars", ICONS.star, "star"),
      total("forks_count", "forks", ICONS.fork, "fork"),
      total("issues_count", "issues", ICONS.issue, "issue"),
      total("pulls_count", "pulls", ICONS.pr, "pr"),
    ].join("");
    const max = Math.max(1, Number.parseInt(c.max_repos, 10) || 5);
    const zoom = c.zoom !== false;
    const cell = (r, key, icon, cls) => `<span class="${cls}">${r.s[key] ? `${svgIcon(icon)}${fmtCount(this._num(r.s[key]), loc)}` : ""}</span>`;
    const items = repos.slice(0, max).map((r) => {
      // With the zoom button, a repository opens the full card on it; without, the more-info of its stars.
      const target = zoom ? `data-action="show" data-target="${esc(r.id)}"` : `data-entity="${esc(r.s.stargazers_count || Object.values(r.s)[0])}"`;
      return `<div class="item clickable" ${target} role="button" tabindex="0" title="${esc(r.label)}">
          <span class="n">${esc(r.label)}</span>${cell(r, "stargazers_count", ICONS.star, "star")}${cell(r, "issues_count", ICONS.issue, "issue")}${cell(r, "pulls_count", ICONS.pr, "pr")}
        </div>`;
    });
    if (repos.length > max)
      items.push(`<div class="item more${zoom ? ' clickable" data-action="show" role="button" tabindex="0' : ""}"><span class="n">+${repos.length - max}</span></div>`);
    const st = this._status(repos);
    // Without a repository, the message above already says so: no status in the footer.
    const foot = repos.length ? [`<span class="${st.cls}"><span class="dot"></span>${esc(st.text)}</span>`] : [];
    for (const u of users) {
      const v = this._num(u.s.followers);
      if (u.s.followers)
        foot.push(`<span class="clickable" data-entity="${esc(u.s.followers)}" role="button" tabindex="0" title="${esc(`${u.label} · ${this._t("followers")}: ${fmtFull(v, loc)}`)}">${svgIcon(ICONS.group)}${fmtCount(v, loc)}</span>`);
    }
    return `<style>${BASE_STYLE}${MINI_STYLE}</style>
      <ha-card>
        ${this._header(repos, this._aside())}
        <div class="content">
          ${repos.length ? "" : this._empty()}
          ${totals ? `<div class="tiles">${totals}</div>` : ""}
          ${items.length ? `<div class="list">${items.join("")}</div>` : ""}
          <div class="foot">${foot.join("")}</div>
        </div>
      </ha-card>`;
  }
}

// ---------------------------------------------------------------------------
// Visual editors (ha-form)
// ---------------------------------------------------------------------------

class GitHubEditorBase extends HTMLElement {
  static get toggles() {
    return [];
  }

  static get defaults() {
    return { sort: "name" };
  }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _schema() {
    const tr = (k) => t(this._hass, this._config, k);
    const repos = this._hass ? discover(this._hass).repos.map((r) => r.name).filter(Boolean) : [];
    const extra = this._extraSchema?.() || [];
    return [
      { name: "title", selector: { text: {} } },
      { name: "repositories", selector: { select: { multiple: true, custom_value: true, mode: "dropdown", options: [...new Set(repos)].sort().map((r) => ({ value: r, label: r })) } } },
      {
        name: "sort",
        selector: { select: { mode: "dropdown", options: ["name", "stars", "open"].map((v) => ({ value: v, label: tr(`sort_${v}`) })) } },
      },
      { type: "grid", name: "", schema: this.constructor.toggles.map((name) => ({ name, selector: { boolean: {} } })) },
      ...extra,
      {
        name: "language",
        selector: { select: { mode: "dropdown", options: [{ value: "", label: tr("lang_auto") }, ...LANGUAGES.map(([value, label]) => ({ value, label }))] } },
      },
    ];
  }

  /** Keeps the YAML minimal: no empty values, no toggles left on, no option at its default. */
  _clean(config) {
    const out = { ...config };
    const defaults = this.constructor.defaults;
    for (const [k, v] of Object.entries(out)) {
      const empty = v === "" || v === undefined || v === null || (Array.isArray(v) && !v.length);
      if (empty || (this.constructor.toggles.includes(k) && v === true) || defaults[k] === v) delete out[k];
    }
    return out;
  }

  _render() {
    if (!this._hass || !this._config) return;
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (s) => t(this._hass, this._config, s.name);
      this._form.computeHelper = (s) => {
        const key = `${s.name}_helper`;
        const text = t(this._hass, this._config, key);
        return text === key ? undefined : text;
      };
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const config = this._clean(ev.detail.value);
        this._config = config;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    // ha-form renders again on a new data or schema object: rebuild them only when they change.
    if (this._formConfig !== this._config) {
      this._formConfig = this._config;
      const data = { ...this.constructor.defaults, ...this._config };
      for (const name of this.constructor.toggles) if (data[name] === undefined) data[name] = true;
      this._form.data = data;
    }
    const schema = this._schema();
    const key = JSON.stringify(schema);
    if (key !== this._schemaKey) {
      this._schemaKey = key;
      this._form.schema = schema;
    }
  }
}

class GitHubCardEditor extends GitHubEditorBase {
  static get toggles() {
    return ["show_title", "show_subtitle", "show_latest", "show_account"];
  }
}

class GitHubMiniCardEditor extends GitHubEditorBase {
  static get toggles() {
    return ["show_title", "show_subtitle", "show_latest", "show_account", "zoom"];
  }

  static get defaults() {
    return { sort: "name", max_repos: 5 };
  }

  _extraSchema() {
    return [{ name: "max_repos", selector: { number: { min: 1, max: 20, step: 1, mode: "box" } } }];
  }
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

const define = (name, cls) => {
  if (!customElements.get(name)) customElements.define(name, cls);
};
define("github-card", GitHubCard);
define("github-mini-card", GitHubMiniCard);
define("github-card-editor", GitHubCardEditor);
define("github-mini-card-editor", GitHubMiniCardEditor);

window.customCards = window.customCards || [];
for (const card of [
  { type: "github-card", name: "GitHub Card", description: "Your GitHub repositories: stars, forks, open issues and pull requests, latest release, commit and activity." },
  { type: "github-mini-card", name: "GitHub Mini Card", description: "Compact overview of your GitHub repositories: totals and one line per repository." },
]) {
  if (!window.customCards.some((c) => c.type === card.type))
    window.customCards.push({ ...card, preview: true, documentationURL: "https://github.com/juju35/ha-github" });
}

console.info(`%c GITHUB-CARD %c v${VERSION} `, "color: white; background: #8957e5; font-weight: 700;", "color: #8957e5; background: white; font-weight: 700;");
