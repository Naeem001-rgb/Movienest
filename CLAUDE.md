# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Pure static multi-page movie/TV browsing and streaming site: HTML + CSS + vanilla JavaScript, no framework, no build step, no package.json, no test suite. All data comes live from the TMDB API at runtime; playback embeds third-party players in iframes. Deployed on Vercel (see the hardcoded `baseUrl` in sitemap-generator.js). README.md is garbled (UTF-16/BOM; contains only the project name) — there is nothing useful in it.

## Commands

There is nothing to build, lint, or test. To develop locally, serve the repo root with any static server and open it in a browser:

```
python3 -m http.server 8000
```

Opening `index.html` via `file://` also works; fetches go straight to TMDB, there is no backend.

## Architecture

### Page flow

Three pages, each self-contained (own HTML + CSS + JS trio), wired together with URL parameters:

- `index.html` + `script.js` — home/browse. Uses **hash navigation** (`#movies`, `#tv`, `#trending`, `#new`, `#top`, `#action`, `#comedy`, `#drama`, `#horror`, `#sci-fi`, plus GENRE/COUNTRIES dropdowns keyed by TMDB genre IDs and ISO country codes) to toggle between the home sections and a hidden full-section view with "Load More" pagination. Hashes are cleaned up with `history.replaceState` so browsing doesn't fill history.
- `movie.html?id={tmdbId}&type={movie|tv}` + `movie.js` — details page (`type` defaults to `movie`). Fetches details with `append_to_response=credits,videos`, renders ~15 DOM elements, and fills related titles from `/{type}/{id}/similar` (falls back to `/popular` when empty).
- `watch.html?id={tmdbId}&type={movie|tv}` + `watch.js` — player page. Loads the iframe embed and, for TV, the season/episode list.

Cards navigate one level deeper: index and movie pages' cards → `movie.html`; the watch page's related cards → `watch.html` (staying in the player context).

### State pattern

Each page script uses global mutable variables rather than modules or classes: `currentPage`/`currentType`/`currentCategory`/`currentSection`/`isLoading`/`searchQuery` on index; `currentMovie` on movie.js; `currentMovie`/`currentSeason`/`currentEpisode` on watch.js. Top-level function declarations read and write these directly.

### TMDB data layer

The API config (hardcoded TMDB API key, base URL `https://api.themoviedb.org/3`, poster image base `.../t/p/w500`, and in movie.js only the `w1280` backdrop base) is **duplicated as constants at the top of script.js, movie.js, and watch.js** — changing any of it means editing all three files.

Endpoints in use: `/trending/{type}/week`, `/movie/popular`, `/tv/on_the_air`, `/search/multi`, `/discover/movie?with_genres=`, `/discover/movie?with_origin_country=`, `/{type}/{id}` (+ `append_to_response`), `/{type}/{id}/similar`, and `/tv/{id}/season/{n}`.

Only script.js caches responses (an in-memory `Map`, `movieDetailsCache`, inside `fetchMovieDetails`). movie.js and watch.js re-fetch on every page load.

Media type is inferred with `movie.media_type === 'movie' || !movie.first_air_date` when a TMDB item doesn't carry an explicit type.

### Video embedding (watch.js)

`startStreaming()` builds an iframe URL from the active `.server-btn`'s `data-server` (falls back to `'videasy'`):

- **videasy** (default): `player.videasy.net/{movie|tv}/{id}`
- **vidfast**: `vidfast.pro/{movie|tv}/{id}` with `?autoPlay=true`
- **vidsrc**: `vidsrc.to/embed/{movie|tv}/{id}`

TV embed URLs append `/{season}/{episode}`. Season/episode flow: `setupTvShowSelectors()` sorts seasons by `season_number` (defaults to season 1 or the first available), `loadEpisodes()` fetches `/tv/{id}/season/{n}`, and clicking an `.episode-card` sets `currentEpisode` and re-calls `startStreaming()`.

movie.js still contains an older inline-player `switchServer()` (vidsrc / movcloud.net / mixdrop.co) from before playback moved to watch.html — its "Watch Now" buttons now just redirect to `watch.html`. Don't confuse the two different server sets.

### Duplicated utilities — keep in sync

`showError`, `showSuccessMessage`, `setupNewsletterSubscription`, `isValidEmail`, and `setupHeaderScrollBehavior` (hide-header-on-scroll-down) are copy-pasted into all three page scripts with slight variations. A change to any of these must be replicated in script.js, movie.js, and watch.js, or the pages will drift.

### Conventions

- Rating badges show `vote_average × 10` as a percentage, colored by `getRatingColor()`: ≥70 `#21d07a`, ≥40 `#d2d531`, else `#db2360`.
- Theme is read from localStorage key `'theme'` (default `dark-mode`) and applied by an IIFE at the end of script.js.
- Error/success toasts are dynamically created fixed-position divs, removed after 5 seconds.

### Sitemap / SEO files

`sitemap-generator.js` is a standalone `SitemapGenerator` class (hardcoded Vercel baseUrl, dual `module.exports`/`window` export) that can generate/update `sitemap.xml` and an HTML sitemap — it is not referenced by any HTML page. `robots.txt`, `sitemap.xml`, `sitemap.html`, and the Google Search Console verification file sit at the repo root. The legal/support pages (contact, DMCA, privacy-policy, Terms of Service) are static standalone HTML.

### Not part of the site

`impeccable/`, `skills/`, and `taste-skill/` are vendored, unrelated plugin/skill projects (each with their own README, CLAUDE.md, package.json, etc.). No page loads anything from them — ignore them when working on the Movie Nest site.
