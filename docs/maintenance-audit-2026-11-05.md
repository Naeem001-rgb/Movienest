# Movie Nest maintenance audit — 2026-11-05

## Scope

Audited the Movie Nest application, its routes, shared components and libraries, public assets, configuration, and dependency tree. The `impeccable/`, `skills/`, and `taste-skill/` projects are unrelated and were excluded according to AGENTS.md. Existing Continue Watching work was preserved.

All 52 original application modules had consumers or framework entry-point roles. No working route or component was removed merely because it looked old.

## Changes

- Removed five unreferenced Next.js/Vercel scaffold SVGs, the redundant root verification file (the served `public/` copy remains), an unused font weight, unused type fields and props, and the unnecessary application-wide theme context.
- Reduced browser rendering work by keeping header/footer markup and episode lists on the server. Search uses Next.js Form, episode navigation uses links, and scroll work is scheduled once per animation frame. Disabled bulk prefetching for catalog, genre, and pagination links.
- Added responsive poster, backdrop, and episode-image URLs using TMDB's existing CDN. Scoped Tailwind scanning to `src/` so vendored classes cannot inflate the site's stylesheet.
- Enforced the server-only catalog boundary; added request deduplication, request timeouts, and sanitized network failures. Recommendations stream independently and fail without taking down the player. Added a retryable error boundary.
- Centralized query and ID validation, accepted repeated query parameters safely, fixed selection of nonexistent episodes in sparse season lists, routed TV-only genres to the TV API, and removed duplicate sitemap URLs.
- Hardened theme persistence against blocked storage and synchronized changes across tabs. Removed an unnecessary JSON serialization cycle from watch-history updates.
- Updated compatible dependencies, added a scoped security override for the remaining vulnerable tooling dependency, and added formatting/lint/type-check commands. Upgraded Vitest configuration to ESM and excluded unrelated projects from tool scans.

## Local performance measurements

Production builds, Chrome, cache disabled, desktop 1440 × 1000 and mobile 390 × 844, device pixel ratio 1. These are single local laboratory samples using Chrome's transferred-byte counters, not field Core Web Vitals or a promise of a particular load time. Catalog, CDN, cache, and network conditions affect timing.

| Resource               |      Before |     After | Reduction |
| ---------------------- | ----------: | --------: | --------: |
| Desktop image transfer | 2,878,819 B | 791,578 B |     72.5% |
| Mobile image transfer  | 2,951,912 B | 308,997 B |     89.5% |
| Stylesheet transfer    |    13,055 B |   8,290 B |     36.5% |
| Font transfer          |    48,934 B |  42,186 B |     13.8% |
| Preloaded font files   |           6 |         5 | 1 removed |

The main win is image bandwidth. JavaScript transfer increased slightly (145,641 B to 149,552 B) with the new form and recovery behavior, and responsive image metadata increases HTML size. Both measured viewports had zero observed layout shift. Desktop and mobile screenshots retained the existing design.

## Security and verification

- Dependency audit: 16 findings initially (1 critical, 5 high, 10 moderate); zero known findings after updates and the scoped override. The production-only audit is also clean.
- Next.js 16.4.5, React 19.3.1, Tailwind 4.3.4, TypeScript 6.0.3, Vitest 5.1.0. ESLint 9 and Node 22 types retain compatibility with the current lint plugins and tested LTS runtime.
- 51 library tests pass, including new request-boundary and malformed-input cases. Lint, formatting, TypeScript, and the production build pass.
- Browser checks cover search, repeated parameters, TV genres, pagination, episode/season navigation, provider switching, Continue Watching save/resume/removal/Undo, theme persistence and tab synchronization, blocked storage, not-found UI, and catalog failure/retry.
- HTTP smoke checks cover browsing, details, watch pages, legal pages, robots, sitemap, verification, and legacy redirects. Invalid movie, TV, genre, and country routes return HTTP 404. Security headers and unique sitemap URLs were checked.
- Compiled browser bundles contained neither the TMDB client nor `TMDB_API_KEY`; the actual configured key was absent from inspected public output. No credential value was printed during verification.

Playback integration was exercised with controlled iframe event fixtures. Live third-party seeking and the security of remote player scripts are outside the verified scope. The application adds baseline CSP directives but does not claim a strict script CSP or protection against all future or unreported vulnerabilities.
