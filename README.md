# 🎬 Movie Nest

A movie & TV show browsing and streaming site built with **Next.js + TypeScript + Tailwind CSS**. Data comes live from the [TMDB API](https://www.themoviedb.org/documentation/api); playback embeds third-party players in iframes.

[Open the live site](https://movienest-xi.vercel.app/).

## Features

- **Home** — trending hero + scrolling rows (Trending, Popular Movies, Airing TV, Top Rated, genre rows)
- **Browse** — `/movies`, `/tv`, per-genre (`/genre/action`), per-country (`/country/kr`) with pagination
- **Search** — live multi-search at `/search?q=…`
- **Details** — backdrop, poster, TMDB user rating, cast, related titles at `/movie/{id}` and `/tv/{id}`
- **Watch** — `/watch/movie/{id}` and `/watch/tv/{id}?season=&episode=` with three selectable servers (VidFast, VidSrc, MultiEmbed) and a season/episode picker for TV
- **Continue Watching** — a home-page row with saved movies / TV episodes, playback progress where supported, and remove / undo controls
- **Dark mode by default** with a light-mode toggle (remembered per visitor)
- **SEO** — server-rendered pages, per-page metadata, auto-generated `sitemap.xml` and `robots.txt`, legacy `.html` URLs redirect to the new routes

## Getting started

Use Node.js 22.12 or later. The repository is verified with Node.js 22 LTS.

```bash
npm install
cp .env.example .env.local   # then put your TMDB API key inside
npm run dev                  # http://localhost:3000
```

Get a free API key at [themoviedb.org](https://www.themoviedb.org/settings/api).

## Scripts

| Command                | What it does                              |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Development server                        |
| `npm run build`        | Production build (also type-checks)       |
| `npm run start`        | Serve the production build                |
| `npm test`             | Run unit tests (Vitest)                   |
| `npm run lint`         | Check application and configuration code  |
| `npm run typecheck`    | Generate route types and check TypeScript |
| `npm run format`       | Format application code and configuration |
| `npm run format:check` | Check formatting without changing files   |

## Configuration

| Environment variable   | Required | Purpose                                                                               |
| ---------------------- | -------- | ------------------------------------------------------------------------------------- |
| `TMDB_API_KEY`         | yes      | TMDB v3 API key. Server-side only — never exposed to the browser.                     |
| `NEXT_PUBLIC_SITE_URL` | no       | Canonical site URL used in `robots.txt` / `sitemap.xml` (defaults to the Vercel URL). |

## Deploying (Vercel)

1. Push this repo to GitHub.
2. Import it on [vercel.com](https://vercel.com) — Next.js is detected automatically.
3. Add `TMDB_API_KEY` (and optionally `NEXT_PUBLIC_SITE_URL`) in Project → Settings → Environment Variables.

## Project structure

```
src/
  app/          # routes: home, browse, search, details, watch, legal, redirects, sitemap
  components/   # Header, Footer, Hero, MediaCard/Row/Grid, Player, EpisodeList, …
  lib/          # tmdb.ts (API layer), embed.ts (server URLs), genres.ts, rating.ts, theme
```

Ratings shown on cards are TMDB community scores (`vote_average × 10` as a percentage). Video playback and its quality are provided by the third-party embed servers, not by this site.

## Continue Watching

Opening a watch page saves its title, poster, selected server, and TV season / episode in this browser under `movienest:continue-watching:v1`. The home page shows up to 40 recent titles, with one entry per movie or series. Removing a card persists across reloads and other tabs; Undo restores it. Clearing browser storage clears the list. There is no account or cross-device sync. If storage is unavailable, history works in memory for the current session.

VidFast progress messages update the saved position, at most every five seconds, with a final flush on navigation, server changes, or hiding the page. The listener validates the active iframe, an explicit provider-origin allowlist, content identity, and numeric progress. Resume uses VidFast's `startAt` URL parameter. These third-party protocols are outside our control; when no supported progress arrives, the card remains a title / episode bookmark with no estimated progress. VidSrc and MultiEmbed currently provide bookmarks only. Completion events or 98% progress remove the finished movie / episode; opening another episode replaces the series entry with that episode.

Implementation: `watch-history.ts` owns validation and list operations, `watch-history-store.ts` owns browser persistence / subscriptions, `player-progress.ts` adapts player events, and `ContinueWatching.tsx` renders the row. Catalog fetching remains server-side; the row needs no TMDB requests.

Switching to MultiEmbed or VidSrc preserves the last measured timestamp and its source server. If a checkpoint exists, the watch page offers an explicit **Resume on [server]** action. The home card continues to open the selected server and labels that timestamp as **Last saved at**, rather than promising an automatic seek on an unsupported player. With no recorded timestamp, no resume action is shown. Player limitations are available under **About Continue Watching**.

## Maintenance and security

- The catalog client is protected with `server-only`. Shared image URLs and responsive image sizes live in `src/lib/images.ts`; they use TMDB's CDN directly without a paid image service.
- Metadata and page requests share a request-scoped cache. Catalog requests time out after 10 seconds; optional recommendations stream independently and cannot interrupt playback. Search and episode data remain live.
- Route IDs, repeated search parameters, page numbers, and episode selections are validated centrally in `src/lib/params.ts`. Only real episodes from the selected season can be selected.
- Security headers disable MIME sniffing, cross-origin framing, plugins, off-site form submission, and camera/microphone/location access. The CSP intentionally allows the existing inline Next.js bootstrap and third-party players; it is not a nonce-based script policy.
- ESLint, TypeScript, Vitest, Tailwind, and Prettier are scoped to the application, excluding the unrelated vendored skill projects. Historical documents and agent guidance are retained.
- ESLint stays on version 9 and TypeScript on version 6 because the installed lint plugins do not support the newer major releases. The scoped `minimatch` override fixes [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) in the TypeScript ESLint dependency; remove it when that dependency adopts a patched version.

Run `npm ci`, the checks above, and `npm audit` after dependency changes. See [the November 2026 audit](docs/maintenance-audit-2026-11-05.md) for the measured results and verification scope. Third-party player code is outside this repository and cannot be certified by these checks.

## Legal

Contact, Privacy Policy, Terms of Service, and DMCA pages live at `/contact`, `/privacy`, `/terms`, `/dmca`.
