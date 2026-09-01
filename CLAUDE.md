# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Movie Nest is a movie/TV browsing and streaming site built with **Next.js (App Router) + TypeScript + Tailwind CSS v4**. All catalog data comes live from the TMDB API at runtime, fetched **server-side only** (the API key lives in the `TMDB_API_KEY` env var and is never sent to the browser). Playback embeds third-party players in iframes. Deployed on Vercel.

## Commands

```bash
npm run dev     # dev server on :3000
npm run build   # production build (also type-checks; fails on TS errors)
npm run start   # serve the production build
npm test        # Vitest unit tests (pure-logic libs only)
```

`.env.local` must contain `TMDB_API_KEY` (see `.env.example`). Without it, pages error at request time.

## Architecture

### Routes (src/app)

- `/` — home: trending hero + MediaRow rows (Trending, Popular Movies, Airing TV, Top Rated, Action/Comedy/Horror). Statically prerendered with 1h revalidate.
- `/movies`, `/tv` — browse grids with `?page=` pagination, via shared `<BrowsePage>`.
- `/genre/[slug]`, `/country/[code]` — discover pages; slugs/codes resolved against `src/lib/genres.ts` (`genreBySlug`, `countryByCode`); unknown ones `notFound()`.
- `/search?q=` — live multi-search (`/search/multi`, `revalidate: 0`), filtered to movie/tv with posters.
- `/movie/[id]`, `/tv/[id]` — details pages; shared `<DetailsPage details={…} type={…}>` + `<RelatedGrid>` (falls back to `/popular` when `similar` is empty).
- `/watch/movie/[id]`, `/watch/tv/[id]?season=&episode=` — player pages. Season/episode live in the URL (shareable); validated against the show's actual seasons/episodes with graceful defaults.
- `/contact`, `/privacy`, `/terms`, `/dmca` — legal pages (static wording preserved from the old site).
- `src/app/movie.html/route.ts` and `watch.html/route.ts` — legacy URL redirect handlers that read `?id=&type=&season=&episode=`; plain `.html` paths redirect via `next.config.ts`.
- `robots.ts`, `sitemap.ts` — SEO files generated at the app root (TMDB-driven sitemap).

### Data layer (src/lib/tmdb.ts)

Single `tmdbFetch<T>(path, params, revalidate=3600)` helper. Defaults to 1h revalidation; search and season episode lists pass `0` for live data. Throws `TmdbNotFoundError` on TMDB 404 — check with `isNotFound(err)` and call `notFound()`.

**Important gotchas (learned the hard way):**
- `isNotFound` uses a property check (`err.tmdbNotFound`), not `instanceof` — the bundler duplicates the class into per-route chunks so cross-chunk `instanceof` fails.
- A page's `try/catch` does **not** catch errors thrown by async child server components (they reject during render, outside the parent's synchronous frame). Fetch data in the page component, then pass it down as props — that's why `DetailsPage`/`WatchPage`/`BrowsePage` take data or params and pages own the fetching.

### Watch / embed servers (src/lib/embed.ts)

`buildEmbedUrl(server, { id, type, season?, episode? })` with `SERVERS = videasy (default) | vidfast | vidsrc`. URL shapes:
- videasy: `player.videasy.net/{movie|tv}/{id}` (+ `/{season}/{episode}` for TV)
- vidfast: `vidfast.pro/{movie|tv}/{id}` (+ TV suffix) + `?autoPlay=true`
- vidsrc: `vidsrc.to/embed/{movie|tv}/{id}` (+ TV suffix)

`Player.tsx` (client) renders the iframe for the active server, defaulting to videasy and restoring the visitor's saved preference from `localStorage` key `server` after hydration. Episode/season changes navigate (URL is state), which re-renders the player server-side.

### Conventions

- Ratings are TMDB `vote_average × 10` as a percentage (`ratingPercent`), colored by `ratingColor()`: ≥70 `#21d07a`, ≥40 `#d2d531`, else `#db2360`.
- Theme: dark by default, class-based (`html.dark`), toggle in Header, persisted in `localStorage` key `theme` with values `'dark-mode'`/`'light-mode'` (same values the old static site used). A tiny inline script in `layout.tsx` applies the class pre-hydration to avoid flash.
- Design tokens are CSS variables in `globals.css` (`--background`, `--surface`, `--text`, `--accent`, …) exposed to Tailwind via `@theme inline` — use classes like `bg-surface`, `text-text-secondary`, `border-border`, `text-accent`.
- Media type inference: `isMovie()` checks `media_type === 'movie'` first, then absence of `first_air_date`. `hrefFor`/`watchHrefFor` build details/watch links; watch-page related cards pass `linkToWatch` to stay in the player context.
- Newsletter form in Footer is cosmetic only (client-side toast) — intentionally, same as the old site.

### Tests

Vitest covers pure logic only: `src/lib/__tests__/` (rating, embed URL builders, genre map, title/year/type helpers). `vitest.config.ts` scopes tests to `src/**` (the vendored folders contain their own test suites that must not run).

## Not part of the site

`impeccable/`, `skills/`, and `taste-skill/` are vendored, unrelated plugin/skill projects — ignore them when working on Movie Nest. They're excluded from `tsconfig.json` and Vitest for that reason.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
