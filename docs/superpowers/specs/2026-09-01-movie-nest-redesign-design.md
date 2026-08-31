# Movie Nest Redesign — Design Spec

Date: 2026-09-01
Status: Pending user approval

## Summary

Rebuild Movie Nest as a modern Next.js + TypeScript + Tailwind CSS application, replacing the current static HTML/CSS/vanilla-JS site. All TMDB data usage and the three third-party embed servers are preserved. Old files are deleted only after the new app is verified working.

## Goals

1. Modern, cinematic redesign — dark mode by default with a light-mode toggle.
2. Server-rendered pages with ~1 hour caching for browse content (chosen "Option A"): best SEO, hidden TMDB key, fast repeat visits.
3. Preserve every user-facing capability of the current site: browse (trending/movies/TV/genres/countries), search, details, watch with three servers, TV season/episode selection, legal pages, SEO files.
4. Clean URL structure with redirects from old URLs so no inbound link breaks.

## Non-goals

- No backend accounts, auth, database, or user watchlists.
- Newsletter signup stays cosmetic (client-side "thank you" only), as today.
- No changes to `impeccable/`, `skills/`, `taste-skill/` (unrelated vendored projects).

## Technology

- Next.js (App Router) + TypeScript + Tailwind CSS, deployed on Vercel.
- TMDB API key stored as a Vercel environment variable (`TMDB_API_KEY`), never shipped to the browser.
- Rating badge convention preserved: `vote_average × 10` as a percentage; ≥70 `#21d07a`, ≥40 `#d2d531`, else `#db2360`.

## Routes

| Route | Purpose |
|---|---|
| `/` | Home: hero (top trending item) + horizontal rows (Trending, Popular Movies, TV On Air, Top Rated, genre rows) |
| `/movies` | Browse movies grid with page-number pagination (replaces "Load More") |
| `/tv` | Browse TV shows grid with pagination |
| `/genre/[slug]` | One page per genre, mapped to TMDB genre IDs (movies) |
| `/country/[code]` | Browse by origin country (TMDB `with_origin_country`) |
| `/search?q=` | Search page (live, uncached, TMDB `/search/multi`) |
| `/movie/[id]` | Movie details |
| `/tv/[id]` | TV details |
| `/watch/movie/[id]` | Movie player |
| `/watch/tv/[id]?season=&episode=` | TV player; season/episode in query params so links are shareable/bookmarkable |
| `/contact`, `/privacy`, `/terms`, `/dmca` | Legal/support pages, existing wording, new design |

Redirects (in `next.config`): `movie.html?id=&type=` → `/movie/{id}` or `/tv/{id}`; `watch.html?id=&type=` → `/watch/movie/{id}` or `/watch/tv/{id}` (with season/episode passthrough if present); `index.html` and hash URLs → `/`.

## Data layer

Single typed module `lib/tmdb.ts` (server-only):

- Endpoints preserved from current site: `/trending/{type}/week`, `/movie/popular`, `/tv/on_the_air`, `/movie/top_rated` (new, for Top Rated row), `/search/multi`, `/discover/movie?with_genres=`, `/discover/movie?with_origin_country=`, `/{type}/{id}?append_to_response=credits,videos`, `/{type}/{id}/similar` (fallback `/popular`), `/tv/{id}/season/{n}`.
- Caching via Next.js `fetch` revalidation: browse/discover/details cached 1 hour; search and season episodes fetched live.
- TypeScript types for Movie, TVShow, Season, Episode, credits.

## Watch page behavior (preserved exactly)

- Three servers as selectable buttons: **videasy** (default), **vidfast** (with `?autoPlay=true`), **vidsrc**.
- Embed URL patterns (unchanged from current `watch.js`):
  - videasy: `player.videasy.net/{movie|tv}/{id}` (+ `/{season}/{episode}` for TV)
  - vidfast: `vidfast.pro/{movie|tv}/{id}` (+ `/{season}/{episode}` for TV, `?autoPlay=true`)
  - vidsrc: `vidsrc.to/embed/{movie|tv}/{id}` (+ `/{season}/{episode}` for TV)
- TV: season dropdown (seasons sorted by number, default season 1 or first available), episode list cards (number + name, active episode highlighted). Selecting an episode updates the URL and reloads the player.
- Below the player: title info, Facebook/Twitter share buttons, related titles grid linking within watch context (`/watch/...`).
- Server selection state persisted in the URL or local storage so switching pages keeps the user's preferred server.

## Theme system

- Dark cinematic default: near-black backgrounds, artwork-forward layouts, gold accent for branding.
- Light mode via header sun/moon toggle; preference stored in `localStorage` (key `theme`), applied without flash on load. Tailwind `class`-based dark mode.

## SEO

- Per-page metadata (titles/descriptions) via the Next.js metadata API.
- `robots.txt` and the Google Search Console verification file kept at the root.
- `sitemap.xml` regenerated for the new routes.
- Legal pages re-hosted with existing content.

## Components (rough file map)

- `components/Header.tsx` (nav, search box, theme toggle, hide-on-scroll-down kept), `Footer.tsx` (with newsletter form, cosmetic as today)
- `components/Hero.tsx`, `MediaRow.tsx` (horizontal scroll), `MediaCard.tsx` (poster, title, year, rating badge), `MediaGrid.tsx` + `Pagination.tsx`
- `components/Player.tsx` (server buttons + iframe), `SeasonPicker.tsx` / `EpisodeList.tsx`
- `lib/tmdb.ts`, `lib/theme.ts`, `lib/genres.ts` (slug ↔ TMDB genre ID map)

## Error handling

- TMDB fetch failures render friendly error states (not blank pages); missing/invalid IDs show a "not found" page.
- Missing posters/overviews fall back gracefully (placeholder art, "No overview available").

## Verification

No existing test suite; the project has no build/lint today. Verification per stage:

- `next build` passes with no type errors.
- Local run and manual click-through: all routes render, search works, all three servers load, TV season/episode switching works, dark/light toggle persists, old URLs redirect, legal pages render.
- Lightweight unit tests (Vitest) for pure logic only: genre slug map, rating color/percentage, embed URL builders.

## Migration / deletion plan

1. New Next.js app built inside the repo (replacing the site root structure) while old files remain untouched.
2. User click-through approval.
3. Delete: `index.html`, `movie.html`, `watch.html`, `styles.css`, `movie.css`, `watch.css`, `script.js`, `movie.js`, `watch.js`, `sitemap-generator.js`, old `sitemap.html`.
4. Keep: `robots.txt`, `google5f6c4aa191d3fa27.html` (served via `public/`), legal page content (rebuilt as routes), README rewritten cleanly.
5. Deploy: Vercel with `TMDB_API_KEY` env var set.

## Open decisions already made by user

- Tailwind CSS (not Bootstrap) — approved.
- Next.js (not bare React) — approved.
- Dark with light-mode toggle — approved.
- Server-rendered + cached (Option A) — approved.
