# AGENTS.md

Movie Nest uses Next.js App Router, TypeScript, and Tailwind CSS v4, deployed on Vercel.
See README.md for setup and product behavior. Use Node.js 22.12 or later.

## Commands

```bash
npm run dev           # development server on :3000
npm run build         # production build, including TypeScript checks
npm run start         # serve the production build
npm test              # Vitest library tests
npm run lint
npm run typecheck     # generate Next route types, then check TypeScript
npm run format:check
```

## Project rules

- Keep TMDB access in server-only `src/lib/tmdb.ts`. Store `TMDB_API_KEY` in ignored
  `.env.local`; never put credentials or credential-bearing URLs in code, docs, or logs.
  Catalog requests default to one-hour revalidation, with React request caching and a
  ten-second timeout. Search and season episode requests use `revalidate: 0`.
- Handle TMDB 404s with `isNotFound(err)` and `notFound()`. Keep the property marker:
  cross-chunk `instanceof` checks fail. When a route handles an expected fetch error,
  await that fetch inside the route; its `try/catch` cannot catch later async-child
  render failures. Optional `RelatedGrid` failures stay isolated in its own handler
  and `Suspense` boundary.
- Use `src/lib/params.ts` for IDs and query values, including repeated parameters,
  pagination bounds, and selection from actual available TV seasons/episodes. TV
  season/episode state belongs in the URL. Preserve legacy redirects, legal wording,
  security headers, metadata, Google verification, and sitemap fallback/deduplication.
- Use `buildEmbedUrl` in `src/lib/embed.ts` for VidFast, VidSrc, and MultiEmbed;
  their URL formats differ. Mount the iframe only after restoring the matching saved
  provider/checkpoint, falling back to the `server` preference or VidFast. Only
  VidFast supports measured progress and `startAt`; other providers save bookmarks.
- Preserve player-message checks for the active iframe, exact allowed origin, media
  identity, and finite valid times. Keep watch-history validation, pending-progress
  flushing, removal/completion handling, cross-tab synchronization, and memory fallback.
  Retain the `movienest:continue-watching:v1` storage schema and saved checkpoints.
- Preserve the pre-hydration dark-theme script and `theme` storage values
  `dark-mode`/`light-mode`. Theme must tolerate blocked storage and sync across tabs.
  Ambient light uses `movienest:ambient-light`; preserve reduced-motion defaults,
  browser-support checks, visibility handling, and fullscreen suspension.
- Reuse `servers.ts`, `rating.ts`, `images.ts`, and CSS design tokens for media links,
  type inference, ratings, and image sizing. Newsletter signup remains cosmetic.
- Keep development skills in CLI directories outside this repository. Do not vendor
  skill repositories or add duplicate product/planning documents. Tests are scoped to
  `src/**/*.test.{ts,tsx}` by `vitest.config.mts`; use the existing library tests for
  logic changes.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
