# Movie Nest Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Movie Nest as a Next.js + TypeScript + Tailwind app (dark/light cinematic theme), preserving all TMDB data usage, the three embed servers, TV season/episode selection, legal pages, and SEO files.

**Architecture:** Next.js App Router with server components fetching TMDB server-side (key in env, 1h revalidation for browse content, live search/episodes). Routes: home, browse (`/movies`, `/tv`, `/genre/[slug]`, `/country/[code]`), search, details (`/movie/[id]`, `/tv/[id]`), watch (`/watch/movie/[id]`, `/watch/tv/[id]?season=&episode=`), legal pages. Old `.html` URLs get redirected via route handlers.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Vitest (pure-logic tests only), Vercel deploy.

**Spec:** `docs/superpowers/specs/2026-09-01-movie-nest-redesign-design.md`

## Global Constraints

- TMDB API key: read from `process.env.TMDB_API_KEY` only — never in client code. Fallback for local dev: `.env.local` (gitignored).
- TMDB base URL `https://api.themoviedb.org/3`; image bases `https://image.tmdb.org/t/p/w500` (posters) and `https://image.tmdb.org/t/p/w1280` (backdrops).
- Rating badge: `Math.round(vote_average * 10)`% — color ≥70 `#21d07a`, ≥40 `#d2d531`, else `#db2360`.
- Embed servers (exact URL shapes from old `watch.js`):
  - videasy (default): `https://player.videasy.net/{movie|tv}/{id}` (+ `/{season}/{episode}` for TV)
  - vidfast: `https://vidfast.pro/{movie|tv}/{id}` (+ `/{season}/{episode}` for TV) + `?autoPlay=true`
  - vidsrc: `https://vidsrc.to/embed/{movie|tv}/{id}` (+ `/{season}/{episode}` for TV)
- Theme: dark by default; `localStorage` key `theme` (`'dark-mode'` | `'light-mode'`); toggle in header; no flash-of-wrong-theme on load.
- Browse/discover/details fetches: `next: { revalidate: 3600 }`. Search and season episodes: no revalidate (live).
- Never modify `impeccable/`, `skills/`, `taste-skill/`, `taste-skill/`, `.claude/`, `docs/superpowers/`.
- Old site files are NOT deleted until the final gated task, after the user has click-tested the new site.
- All UI copy in English; brand name "Movie Nest" with the 🎬 logo icon.
- Newsletter form is cosmetic only (client-side "thank you" toast) — same as the old site.

---

### Task 1: Scaffold Next.js app at repo root, init git

**Files:**
- Create: everything `create-next-app` generates (`package.json`, `app/`, `tsconfig.json`, `next.config.ts`, `.gitignore`, etc.)
- Keep untouched: all old site files, `docs/`, vendored folders

**Interfaces:**
- Produces: runnable Next app at repo root; `npm run dev` / `npm run build` work; git repo initialized.

- [ ] **Step 1: Scaffold in a temp dir (create-next-app refuses non-empty dirs)**

```bash
cd /home/naeem/Documents/Movie-Nest-Application-main
npx create-next-app@latest scaffold-tmp --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack --use-npm --yes
```

- [ ] **Step 2: Move scaffold contents into repo root**

Move everything except `node_modules` into the root, then reinstall:

```bash
mv scaffold-tmp/* scaffold-tmp/.[!.]* . 2>/dev/null || true
rmdir scaffold-tmp
npm install
```

If `mv` reports `README.md` collision: delete the garbled old `README.md` (it contains only the project name, per CLAUDE.md) and re-run for that file. Do not overwrite `.gitignore` if it exists after scaffold (the scaffold one wins).

- [ ] **Step 3: Init git and first commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Next.js app alongside legacy static site"
```

- [ ] **Step 4: Verify**

Run: `npm run build` — Expected: build succeeds. Then `npm run dev` briefly and confirm `http://localhost:3000` shows the Next starter page.

---

### Task 2: Theme system (dark default, light toggle, no flash)

**Files:**
- Create: `src/lib/theme.tsx` (ThemeProvider + `useTheme` hook + `ThemeToggle` component)
- Modify: `src/app/layout.tsx` (fonts, no-flash script, provider)
- Modify: `src/app/globals.css` (Tailwind v4 dark variant + design tokens)

**Interfaces:**
- Produces: `useTheme(): { theme: 'dark' | 'light'; toggle(): void }`; `<ThemeProvider>` wraps app; `localStorage` key `theme` holds `'dark-mode'` | `'light-mode'` (same values as the old site).

- [ ] **Step 1: Set up Tailwind v4 class-based dark mode and tokens in `globals.css`**

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

:root {
  --background: #f7f7f9;
  --surface: #ffffff;
  --text: #16181d;
  --text-secondary: #5c6470;
  --accent: #d4a017;
  --border: rgba(0, 0, 0, 0.1);
}

.dark {
  --background: #0b0d12;
  --surface: #141821;
  --text: #f2f4f8;
  --text-secondary: #9aa3b2;
  --accent: #e8b931;
  --border: rgba(255, 255, 255, 0.09);
}

body {
  background: var(--background);
  color: var(--text);
}
```

Remove the scaffold's example CSS (`.center`, demo classes) but keep the dark-mode media-query block OUT — dark is class-driven only.

- [ ] **Step 2: Create `src/lib/theme.tsx`**

```tsx
"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "dark" | "light";
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({ theme: "dark", toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const t: Theme = stored === "light-mode" ? "light" : "dark";
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
  }, []);

  const toggle = () => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      localStorage.setItem("theme", next === "dark" ? "dark-mode" : "light-mode");
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  };

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="rounded-full border border-[var(--border)] p-2 text-[var(--text-secondary)] transition hover:text-[var(--accent)]"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
```

- [ ] **Step 3: Wire layout + no-flash script in `src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";

const poppins = Poppins({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"] });

export const metadata: Metadata = { title: "Movie Nest — Movies & TV Shows", description: "Browse and stream movies and TV shows on Movie Nest." };

const noFlash = `try{if(localStorage.getItem('theme')==='light-mode'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){document.documentElement.classList.add('dark')}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlash }} />
      </head>
      <body className={`${poppins.className} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Verify + commit**

Run: `npm run dev` → toggle works, persists across reload, no flash. `npm run build` passes.

```bash
git add -A && git commit -m "feat: dark-default theme system with light toggle"
```

---

### Task 3: Pure-logic libs (TMDB fetcher, genres map, rating, embed URLs) — TDD

**Files:**
- Create: `src/lib/types.ts`, `src/lib/tmdb.ts`, `src/lib/genres.ts`, `src/lib/rating.ts`, `src/lib/embed.ts`, `src/lib/servers.ts`
- Create: `src/lib/__tests__/genres.test.ts`, `src/lib/__tests__/rating.test.ts`, `src/lib/__tests__/embed.test.ts`
- Create: `.env.local` (gitignored) with `TMDB_API_KEY=b8a35fb6e575578bcd764b42561cbd4e`

**Interfaces:**
- Produces (used by every page task):
  - `tmdbFetch<T>(path: string, params?: Record<string, string>, revalidate?: number): Promise<T>` — path like `/trending/movie/week`
  - `POSTER_BASE = "https://image.tmdb.org/t/p/w500"`, `BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280"`
  - `type MediaType = "movie" | "tv"`
  - `interface MediaItem { id: number; title?: string; name?: string; poster_path?: string | null; backdrop_path?: string | null; vote_average?: number; release_date?: string; first_air_date?: string; media_type?: string; overview?: string }`
  - `interface MediaDetails extends MediaItem { genres?: { id: number; name: string }[]; credits?: { cast: { name: string }[] }; production_countries?: { name: string }[]; production_companies?: { name: string }[]; seasons?: { season_number: number; name: string }[]; runtime?: number; episode_run_time?: number[]; number_of_seasons?: number }`
  - `interface EpisodeItem { episode_number: number; name: string; overview?: string; still_path?: string | null; air_date?: string }`
  - `interface Paged<T> { page: number; total_pages: number; results: T[] }`
  - `titleOf(m: MediaItem): string`, `yearOf(m: MediaItem): string`
  - `GENRES: { slug: string; name: string; id: number }[]`, `genreBySlug(slug: string): typeof GENRES[number] | undefined`
  - `ratingPercent(v?: number): number` (0 for undefined), `ratingColor(v?: number): string`
  - `SERVERS: { id: ServerId; name: string }[]` = videasy/vidfast/vidsrc; `buildEmbedUrl(server: ServerId, opts: { id: number; type: MediaType; season?: number; episode?: number }): string`
  - `isMovie(item: { media_type?: string; first_air_date?: string }): boolean` (media_type `'movie'` or no first_air_date)

- [ ] **Step 1: Install vitest and write failing tests**

```bash
npm install -D vitest
```

Add to `package.json` scripts: `"test": "vitest run"`.

`src/lib/__tests__/rating.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { ratingPercent, ratingColor } from "@/lib/rating";

describe("ratingPercent", () => {
  it("multiplies by 10 and rounds", () => expect(ratingPercent(7.6)).toBe(76));
  it("returns 0 for undefined", () => expect(ratingPercent(undefined)).toBe(0));
});

describe("ratingColor", () => {
  it("green at 70+", () => expect(ratingColor(7.0)).toBe("#21d07a"));
  it("yellow at 40–69", () => expect(ratingColor(4.0)).toBe("#d2d531"));
  it("red below 40", () => expect(ratingColor(3.9)).toBe("#db2360"));
});
```

`src/lib/__tests__/embed.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { buildEmbedUrl } from "@/lib/embed";

describe("buildEmbedUrl", () => {
  it("videasy movie", () => expect(buildEmbedUrl("videasy", { id: 550, type: "movie" })).toBe("https://player.videasy.net/movie/550"));
  it("videasy tv with season/episode", () => expect(buildEmbedUrl("videasy", { id: 1399, type: "tv", season: 2, episode: 4 })).toBe("https://player.videasy.net/tv/1399/2/4"));
  it("vidfast adds autoplay", () => expect(buildEmbedUrl("vidfast", { id: 550, type: "movie" })).toBe("https://vidfast.pro/movie/550?autoPlay=true"));
  it("vidfast tv autoplay", () => expect(buildEmbedUrl("vidfast", { id: 1399, type: "tv", season: 1, episode: 1 })).toBe("https://vidfast.pro/tv/1399/1/1?autoPlay=true"));
  it("vidsrc uses embed path", () => expect(buildEmbedUrl("vidsrc", { id: 550, type: "movie" })).toBe("https://vidsrc.to/embed/movie/550"));
  it("vidsrc tv", () => expect(buildEmbedUrl("vidsrc", { id: 1399, type: "tv", season: 3, episode: 5 })).toBe("https://vidsrc.to/embed/tv/1399/3/5"));
});
```

`src/lib/__tests__/genres.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { genreBySlug } from "@/lib/genres";

describe("genreBySlug", () => {
  it("maps action", () => expect(genreBySlug("action")?.id).toBe(28));
  it("maps sci-fi", () => expect(genreBySlug("sci-fi")?.id).toBe(878));
  it("returns undefined for unknown", () => expect(genreBySlug("nope")).toBeUndefined());
});
```

- [ ] **Step 2: Run tests — verify they fail**

Run: `npm test` — Expected: FAIL (modules not found).

- [ ] **Step 3: Implement the libs**

`src/lib/types.ts` — the interfaces listed in Produces above, exactly.

`src/lib/rating.ts`:
```ts
export function ratingPercent(v?: number): number {
  return v ? Math.round(v * 10) : 0;
}
export function ratingColor(v?: number): string {
  if (!v) return "#db2360";
  if (v >= 7) return "#21d07a";
  if (v >= 4) return "#d2d531";
  return "#db2360";
}
```

`src/lib/embed.ts`:
```ts
import type { MediaType } from "./types";
export type ServerId = "videasy" | "vidfast" | "vidsrc";

export const SERVERS: { id: ServerId; name: string }[] = [
  { id: "videasy", name: "Videasy" },
  { id: "vidfast", name: "VidFast" },
  { id: "vidsrc", name: "VidSrc" },
];

export function buildEmbedUrl(server: ServerId, opts: { id: number; type: MediaType; season?: number; episode?: number }): string {
  const { id, type, season, episode } = opts;
  const tvSuffix = type === "tv" && season != null && episode != null ? `/${season}/${episode}` : "";
  switch (server) {
    case "videasy":
      return `https://player.videasy.net/${type}/${id}${tvSuffix}`;
    case "vidfast":
      return `https://vidfast.pro/${type}/${id}${tvSuffix}?autoPlay=true`;
    case "vidsrc":
      return `https://vidsrc.to/embed/${type}/${id}${tvSuffix}`;
  }
}
```

`src/lib/servers.ts`:
```ts
import type { MediaItem, MediaType } from "./types";

export function titleOf(m: MediaItem): string {
  return m.title || m.name || "Untitled";
}
export function yearOf(m: MediaItem): string {
  const d = m.release_date || m.first_air_date;
  return d ? new Date(d).getFullYear().toString() : "N/A";
}
export function isMovie(item: { media_type?: string; first_air_date?: string }): boolean {
  return item.media_type === "movie" || !item.first_air_date;
}
export function hrefFor(m: MediaItem): string {
  const type: MediaType = m.media_type === "tv" ? "tv" : isMovie(m) ? "movie" : "tv";
  return `/${type}/${m.id}`;
}
```

`src/lib/genres.ts` — full list from the old `index.html` dropdown (Action 28, Adventure 12, Animation 16, Documentary 99, Comedy 35, Crime 80, Drama 18, Family 10751, Fantasy 14, History 36, Horror 27, Music 10402, Mystery 9648, Romance 10749, Sci-Fi & Fantasy 878, Thriller 53, War 10752, Western 37) plus TV genres (Kids 10762, News 10763, Reality 10764, Soap 10766, Talk 10767) — as `{ slug, name, id }` with kebab-case slugs (`sci-fi-fantasy` for 878) and:
```ts
export function genreBySlug(slug: string) {
  return GENRES.find((g) => g.slug === slug);
}
```

`src/lib/tmdb.ts`:
```ts
const BASE = "https://api.themoviedb.org/3";
export const POSTER_BASE = "https://image.tmdb.org/t/p/w500";
export const BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";

export async function tmdbFetch<T>(path: string, params: Record<string, string> = {}, revalidate = 3600): Promise<T> {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error("TMDB_API_KEY is not set");
  const qs = new URLSearchParams({ ...params, api_key: key });
  const res = await fetch(`${BASE}${path}?${qs}`, { next: { revalidate } });
  if (!res.ok) throw new Error(`TMDB ${res.status} for ${path}`);
  return res.json() as Promise<T>;
}
```

`.env.local`: `TMDB_API_KEY=b8a35fb6e575578bcd764b42561cbd4e` (confirm `.gitignore` covers `.env*`; if it covers all env files, add `!.env.example` and create `.env.example` with an empty `TMDB_API_KEY=`).

- [ ] **Step 4: Run tests — verify pass**

Run: `npm test` — Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: TMDB data layer, genre map, rating and embed URL libs with tests"
```

---

### Task 4: Header, Footer, MediaCard, MediaRow, MediaGrid, Pagination

**Files:**
- Create: `src/components/Header.tsx`, `src/components/Footer.tsx`, `src/components/MediaCard.tsx`, `src/components/MediaRow.tsx`, `src/components/MediaGrid.tsx`, `src/components/Pagination.tsx`, `src/components/NotFound.tsx`, `src/components/ErrorState.tsx`
- Modify: `src/app/layout.tsx` (mount Header/Footer around children)

**Interfaces:**
- Consumes: `MediaItem`, `titleOf`, `yearOf`, `hrefFor`, `ratingPercent`, `ratingColor`, `POSTER_BASE`, `Genre` from Task 3.
- Produces: `<Header />` (nav links Home/Movies/TV Shows + genre dropdown + search box + theme toggle + hide-on-scroll-down), `<Footer />` (links to legal pages + cosmetic newsletter form), `<MediaCard item={MediaItem} />`, `<MediaRow title={string} items={MediaItem[]} />`, `<MediaGrid items={MediaItem[]} />`, `<Pagination basePath={string} page={number} totalPages={number} />`.

- [ ] **Step 1: `MediaCard.tsx`** — Link to `hrefFor(item)`; poster with `loading="lazy"`, rounded, hover scale + gold ring; rating badge bottom-right using `ratingPercent`/`ratingColor` (circular, dark backing); title + year below. Placeholder gradient div when `poster_path` is null.

- [ ] **Step 2: `MediaRow.tsx`** — section title + horizontally scrollable flex (`overflow-x-auto`, snap, hidden scrollbar), arrows optional. `MediaGrid.tsx` — responsive grid `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4`.

- [ ] **Step 3: `Header.tsx`** (client component) — sticky top, translucent surface with blur, `Poppins` branding `🎬 Movie Nest`; nav: Home `/`, Movies `/movies`, TV Shows `/tv`, GENRE dropdown (from `GENRES`, links `/genre/{slug}`); search input that navigates to `/search?q=` on Enter; `ThemeToggle` from Task 2. Hide-on-scroll-down / show-on-scroll-up exactly like the old site (translateY, threshold 100px, 5px delta) via a scroll listener.

- [ ] **Step 4: `Footer.tsx`** — brand blurb, links to `/contact`, `/privacy`, `/terms`, `/dmca`; newsletter input + button showing a client-side success toast (`"Thank you for subscribing!"`) with `isValidEmail` regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` — cosmetic only, no network call.

- [ ] **Step 5: `Pagination.tsx`** — Prev/page numbers (windowed around current, max ~7 buttons)/Next as Links to `{basePath}?page={n}`; disabled state at ends.

- [ ] **Step 6: Mount in layout + verify + commit**

```tsx
<ThemeProvider>
  <Header />
  <main className="min-h-screen">{children}</main>
  <Footer />
</ThemeProvider>
```

Run: `npm run build`; click-test header nav, search box, scroll-hide, footer. Commit: `git add -A && git commit -m "feat: site chrome and media display components"`.

---

### Task 5: Home page (hero + rows)

**Files:**
- Create: `src/components/Hero.tsx`, `src/app/page.tsx`

**Interfaces:**
- Consumes: `tmdbFetch`, `MediaItem`, `MediaRow`, `MediaCard`, `Hero`, `BACKDROP_BASE`, `titleOf`.
- Produces: `/` renders full home page.

- [ ] **Step 1: `Hero.tsx`** — takes `item: MediaItem`; full-viewport-width (≈85vh) backdrop (`BACKDROP_BASE + backdrop_path`) with gradient scrim to background color; title (large, bold), rating badge, year, overview (clamped ~3 lines), and two buttons: **Watch Now** → `/watch/movie/{id}` or `/watch/tv/{id}` (gold filled), **More Info** → `hrefFor(item)` (outlined).

- [ ] **Step 2: `app/page.tsx`** (server component) — fetch in parallel:
  - `tmdbFetch<Paged<MediaItem>>("/trending/all/week")` → hero = first item that has a backdrop; row "Trending This Week" (top 20)
  - `/movie/popular` → "Popular Movies"
  - `/tv/on_the_air` → "Currently Airing TV"
  - `/movie/top_rated` → "Top Rated Movies"
  - `/discover/movie?with_genres=28` → "Action Movies", `with_genres=35` → "Comedy Movies", `with_genres=27` → "Horror Movies"
  All with default 1h revalidate. Render `<Hero />` then the `<MediaRow />`s.

- [ ] **Step 3: Verify + commit**

Run: `npm run dev` → `/` shows hero + all rows with real data. `npm run build` passes. Commit: `git add -A && git commit -m "feat: home page with hero and content rows"`.

---

### Task 6: Browse pages — `/movies`, `/tv`, `/genre/[slug]`, `/country/[code]`

**Files:**
- Create: `src/app/movies/page.tsx`, `src/app/tv/page.tsx`, `src/app/genre/[slug]/page.tsx`, `src/app/country/[code]/page.tsx`, `src/components/BrowsePage.tsx`

**Interfaces:**
- Consumes: `tmdbFetch`, `Paged`, `MediaGrid`, `Pagination`, `genreBySlug`.
- Produces: `<BrowsePage title={string} endpoint={string} extraParams={Record<string,string>} searchParams={...} />` — a shared server component that fetches one page of `endpoint` (with `page` param) and renders heading + grid + pagination.

- [ ] **Step 1: `BrowsePage.tsx`** — server component; reads `page` (default 1, clamped 1–500); fetches `tmdbFetch<Paged<MediaItem>>(endpoint, { ...extraParams, page: String(page) })`; renders `<h1>`, `<MediaGrid>`, `<Pagination basePath />`; on empty results shows a friendly empty state.

- [ ] **Step 2: The four routes** — thin wrappers passing endpoint + title:
  - `/movies` → `/movie/popular`, title "Movies"
  - `/tv` → `/tv/popular`, title "TV Shows"
  - `/genre/[slug]` → `genreBySlug(slug)`; `notFound()` if unknown; endpoint `/discover/movie`, `with_genres={id}`, title = genre name; `generateMetadata` with genre name
  - `/country/[code]` → endpoint `/discover/movie`, `with_origin_country={code.toUpperCase()}`, title = country name (maintain a small `COUNTRIES` name map in `src/lib/genres.ts` for the codes the old site offered: US, GB, IN, KR, JP, FR, DE, ES, IT, CA, AU, CN, MX, BR, NG, TR, TH, PH); `notFound()` for unknown codes

- [ ] **Step 3: Verify + commit**

Click-test all four routes, pagination navigation, unknown genre/country → 404 page. Commit: `git add -A && git commit -m "feat: browse pages for movies, tv, genres, countries"`.

---

### Task 7: Search page `/search`

**Files:**
- Create: `src/app/search/page.tsx`

**Interfaces:**
- Consumes: `tmdbFetch`, `Paged`, `MediaGrid`, `Pagination`, `titleOf`.

- [ ] **Step 1: Implement** — server component reading `q` and `page` from searchParams; `q` empty → prompt state ("Search for movies and TV shows above"); otherwise fetch `/search/multi` with `query` param and **revalidate: 0** (live); filter results to `media_type` movie/tv and items with `poster_path`; heading `Results for “{q}”`; grid + pagination preserving `q` in links (`/search?q={q}&page={n}`).

- [ ] **Step 2: Verify + commit**

Search for a real title, verify results and pagination; empty state; no-results state. Commit: `git add -A && git commit -m "feat: live search page"`.

---

### Task 8: Details pages `/movie/[id]`, `/tv/[id]`

**Files:**
- Create: `src/app/movie/[id]/page.tsx`, `src/app/tv/[id]/page.tsx`, `src/components/DetailsPage.tsx`, `src/components/RelatedGrid.tsx`

**Interfaces:**
- Consumes: `tmdbFetch`, `MediaDetails`, `MediaItem`, `MediaCard`, `BACKDROP_BASE`, `POSTER_BASE`, `ratingPercent`, `ratingColor`.
- Produces: `<DetailsPage id={string} type={"movie"|"tv"} />` shared server component.

- [ ] **Step 1: `DetailsPage.tsx`** — fetch `/{type}/{id}?append_to_response=credits` (1h revalidate); `notFound()` when response lacks `id`. Layout: full-width backdrop banner with scrim; below, poster (left) + info (right): title, rating badge, year, runtime (movie) or seasons count (TV), genres as pills, overview, "Cast: top 5", "Country", "Production: top 3 companies" — mirroring the old movie page fields. Prominent gold **Watch Now** button → `/watch/{type}/{id}`. `generateMetadata`: title `"{title} — Movie Nest"`, description = first 150 chars of overview.

- [ ] **Step 2: `RelatedGrid.tsx`** — fetch `/{type}/{id}/similar`; if `results` empty, fall back to `/{type}/popular`; render "More Like This" `<MediaGrid>` (cards link via `hrefFor`).

- [ ] **Step 3: Both route files** — thin wrappers calling `DetailsPage` with the right `type` + `generateMetadata` delegating to a shared helper.

- [ ] **Step 4: Verify + commit**

Test a movie (e.g. `/movie/550`) and a TV show (`/tv/1399`); invalid ID → 404; fallback-to-popular path (find an item with no similars, e.g. an obscure ID). Commit: `git add -A && git commit -m "feat: details pages with related grid"`.

---

### Task 9: Watch page — player, servers, TV seasons/episodes

**Files:**
- Create: `src/components/Player.tsx`, `src/components/EpisodeList.tsx`, `src/app/watch/movie/[id]/page.tsx`, `src/app/watch/tv/[id]/page.tsx`, `src/app/watch/WatchPage.tsx`

**Interfaces:**
- Consumes: `tmdbFetch`, `MediaDetails`, `EpisodeItem`, `SERVERS`, `buildEmbedUrl`, `RelatedGrid`, `DetailsPage`-style info block.
- Produces: `<Player id type season episode />` (client), `<EpisodeList episodes season showId currentEpisode />` (client), `<WatchPage ... />` (server) used by both watch routes.

- [ ] **Step 1: `Player.tsx` (client)** — props `{ id: number; type: MediaType; season?: number; episode?: number }`. State: active server, initialized from `localStorage.getItem('server')` falling back to `"videasy"`, defaulting to `"videasy"` on first visit; on change, persist and swap iframe `src` via `buildEmbedUrl`. UI: 16:9 container with the iframe (`allowFullScreen`, `referrerPolicy="origin"`), below it a "Servers" row of three buttons (active = gold). Because TV season/episode arrive as props, changing them re-embeds automatically.

- [ ] **Step 2: `EpisodeList.tsx` (client)** — props `{ showId: number; season: number; episodes: EpisodeItem[]; currentEpisode: number }`. Renders grid of episode cards: big episode number, name, active card highlighted (gold border/surface). Clicking navigates with `useRouter().push(`/watch/tv/${showId}?season=${season}&episode=${n}`)` — keeps URL shareable.

- [ ] **Step 3: `WatchPage.tsx` (server)** — props `{ id, type }`. Fetch details (1h revalidate); `notFound()` if missing. For TV: read `season`/`episode` searchParams; resolve default season = `seasons` includes season 1 ? 1 : first sorted `season_number` (sort ascending, keep specials); fetch `/tv/{id}/season/{season}` **live (revalidate 0)**; default episode = first episode or 1. Renders: breadcrumb (Movies/TV Shows › title), `<Player />`, title + year + rating + overview + genres, share buttons (Facebook `https://www.facebook.com/sharer/sharer.php?u={url}` and Twitter/X `https://twitter.com/intent/tweet?url={url}&text={...}`, opening in new tabs), TV: season `<select>` (styled) + `<EpisodeList />`, then related titles where cards link to `/watch/{type}/{id}` (staying in watch context — a `relatedHref` variant of MediaCard or a prop on `RelatedGrid`). `generateMetadata`: `Watch {title} — Movie Nest`.

- [ ] **Step 4: Route files** — `/watch/movie/[id]/page.tsx` and `/watch/tv/[id]/page.tsx` call `WatchPage` with `type`; TV passes through `searchParams`.

- [ ] **Step 5: Verify + commit**

Test `/watch/movie/550` (all three servers load an iframe, switching persists after reload). Test `/watch/tv/1399?season=2&episode=4` (episode list renders, clicking another episode updates URL and player, season dropdown loads a different episode list, player scroll-into-view on episode change). Commit: `git add -A && git commit -m "feat: watch page with server selection and TV episode picker"`.

---

### Task 10: Legal pages (contact, privacy, terms, DMCA)

**Files:**
- Create: `src/app/contact/page.tsx`, `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`, `src/app/dmca/page.tsx`, `src/components/LegalPage.tsx`

**Interfaces:**
- Consumes: content extracted from the old `contact.html`, `privacy-policy.html`, `Terms of Service.html`, `DMCA.html`.
- Produces: `<LegalPage title={string} body={ReactNode} />` — shared prose styling; four routes at the new URLs.

- [ ] **Step 1: Extract content** — read each old HTML file, pull the main textual content (headings, paragraphs, lists, contact info) — keep wording verbatim; discard old markup/styling.

- [ ] **Step 2: Build routes** — each page: `LegalPage` wrapper with a `prose`-style container using the design tokens; `/contact` keeps its email/DMCA pointers as plain links; each page gets `generateMetadata` with its title.

- [ ] **Step 3: Verify + commit**

Compare rendered text against the old pages (wording preserved). Commit: `git add -A && git commit -m "feat: legal and support pages on new design"`.

---

### Task 11: Old-URL redirects, robots, sitemap, SEO polish

**Files:**
- Create: `src/app/movie.html/route.ts`, `src/app/watch.html/route.ts`, `src/app/index.html/route.ts`, `src/app/robots.ts`, `src/app/sitemap.ts`, `public/google5f6c4aa191d3fa27.html`
- Modify: `src/app/not-found.tsx` (branded 404)

**Interfaces:**
- Consumes: route URLs from all previous tasks; `tmdbFetch` for sitemap items.

- [ ] **Step 1: Legacy redirect route handlers** (folders with `.html` in the name are valid App Router routes):

`src/app/movie.html/route.ts`:
```ts
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type") === "tv" ? "tv" : "movie";
  if (!id) return NextResponse.redirect(new URL("/", req.url));
  return NextResponse.redirect(new URL(`/${type}/${id}`, req.url));
}
```

`src/app/watch.html/route.ts` — same, but destination `/watch/{type}/{id}` and, when present, append `?season={s}&episode={e}` from the query.

`src/app/index.html/route.ts` — plain redirect to `/`.

- [ ] **Step 2: `robots.ts`** — allow all, sitemap URL from `process.env.NEXT_PUBLIC_SITE_URL ?? "https://movie-nest.vercel.app"`; `sitemap.ts` — static routes + first page of trending/popular items as `/movie/{id}` and `/tv/{id}` entries (same source lists as the home page).

- [ ] **Step 3: `public/google5f6c4aa191d3fa27.html`** — copy the existing root file's role (serve an empty verification page at that exact path).

- [ ] **Step 4: Branded 404** — friendly "not found" with poster-style art and a link home.

- [ ] **Step 5: Verify + commit**

Test `http://localhost:3000/movie.html?id=550&type=movie` lands on `/movie/550`; `watch.html?id=1399&type=tv&season=2` → `/watch/tv/1399?season=2`; `/robots.txt` and `/sitemap.xml` render. Commit: `git add -A && git commit -m "feat: legacy redirects, robots, sitemap, 404"`.

---

### Task 12: Full-site verification + user click-test gate

**Files:** none created — verification only.

- [ ] **Step 1: Clean build** — `npm run build && npm test` — zero errors.

- [ ] **Step 2: Full click-through checklist** — every route in the spec renders with real data; search live; all three servers; TV season/episode; theme toggle persists; legacy redirects; legal pages; 404s; mobile-width spot check (devtools 375px) for header/grid/player.

- [ ] **Step 3: STOP — present the running site to the user** (`npm run dev` on port 3000) with the checklist results and ask for explicit approval before Task 13. Do not delete anything before this approval.

---

### Task 13: Remove legacy files and finalize (GATED — only after user approval in Task 12)

**Files:**
- Delete: `index.html`, `movie.html`, `watch.html`, `styles.css`, `movie.css`, `watch.css`, `script.js`, `movie.js`, `watch.js`, `sitemap-generator.js`, `sitemap.html`, `sitemap.xml` (regenerated by `app/sitemap.ts` at runtime)
- Keep: `robots.txt` is superseded by `app/robots.ts` — delete the static file; keep `google5f6c4aa191d3fa27.html` at root AND copy in `public/`; keep `CLAUDE.md`, `docs/`, vendored folders
- Rewrite: `README.md` (project overview, `npm run dev`, env var setup, deploy notes); update `CLAUDE.md` to describe the new architecture

- [ ] **Step 1: Delete the files above; run `npm run build` and full click-through again** — nothing broke.

- [ ] **Step 2: Rewrite `README.md`** — what the site is, how to run locally (`npm install`, `npm run dev`, `.env.local` with `TMDB_API_KEY`), how to deploy (Vercel, set `TMDB_API_KEY` env var).

- [ ] **Step 3: Update `CLAUDE.md`** — replace the static-site architecture description with the Next.js structure (routes, `lib/` modules, theme, deploy).

- [ ] **Step 4: Final commit**

```bash
git add -A && git commit -m "feat: complete Next.js redesign; remove legacy static site"
```

---

## Self-Review (performed after writing)

1. **Spec coverage:** routes ✓ (Task 5–11), data layer + caching ✓ (3, 5–9), three servers + TV episodes ✓ (9), theme ✓ (2), legal ✓ (10), SEO/redirects/sitemap ✓ (11), migration/deletion ✓ (12–13), Vitest pure-logic tests ✓ (3). Newsletter cosmetic ✓ (4).
2. **Placeholder scan:** no TBDs; every step has concrete code or a precise instruction.
3. **Type consistency:** `MediaItem`/`MediaDetails`/`EpisodeItem`/`Paged` defined in Task 3 and reused verbatim; `buildEmbedUrl(server, {id, type, season, episode})` signature consistent; `theme` localStorage values match the old site (`dark-mode`/`light-mode`).
