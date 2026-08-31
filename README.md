# 🎬 Movie Nest

A movie & TV show browsing and streaming site built with **Next.js + TypeScript + Tailwind CSS**. Data comes live from the [TMDB API](https://www.themoviedb.org/documentation/api); playback embeds third-party players in iframes.

## Features

- **Home** — trending hero + scrolling rows (Trending, Popular Movies, Airing TV, Top Rated, genre rows)
- **Browse** — `/movies`, `/tv`, per-genre (`/genre/action`), per-country (`/country/kr`) with pagination
- **Search** — live multi-search at `/search?q=…`
- **Details** — backdrop, poster, TMDB user rating, cast, related titles at `/movie/{id}` and `/tv/{id}`
- **Watch** — `/watch/movie/{id}` and `/watch/tv/{id}?season=&episode=` with three selectable servers (Videasy, VidFast, VidSrc) and a season/episode picker for TV
- **Dark mode by default** with a light-mode toggle (remembered per visitor)
- **SEO** — server-rendered pages, per-page metadata, auto-generated `sitemap.xml` and `robots.txt`, legacy `.html` URLs redirect to the new routes

## Getting started

```bash
npm install
cp .env.example .env.local   # then put your TMDB API key inside
npm run dev                  # http://localhost:3000
```

Get a free API key at [themoviedb.org](https://www.themoviedb.org/settings/api).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build (also type-checks) |
| `npm run start` | Serve the production build |
| `npm test` | Run unit tests (Vitest) |

## Configuration

| Environment variable | Required | Purpose |
|---|---|---|
| `TMDB_API_KEY` | yes | TMDB v3 API key. Server-side only — never exposed to the browser. |
| `NEXT_PUBLIC_SITE_URL` | no | Canonical site URL used in `robots.txt` / `sitemap.xml` (defaults to the Vercel URL). |

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

## Legal

Contact, Privacy Policy, Terms of Service, and DMCA pages live at `/contact`, `/privacy`, `/terms`, `/dmca`.
