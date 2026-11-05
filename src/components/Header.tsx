import Link from "next/link";
import Form from "next/form";
import HeaderShell from "./HeaderShell";
import { MAX_SEARCH_LENGTH } from "@/lib/params";
import { ThemeToggle } from "@/lib/theme";
import { GENRES } from "@/lib/genres";

export default function Header() {
  return (
    <HeaderShell>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="text-2xl" aria-hidden="true">
            🎬
          </span>
          <span className="text-lg font-bold tracking-tight text-text">
            Movie <span className="text-accent">Nest</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface hover:text-text"
          >
            Home
          </Link>
          <Link
            href="/movies"
            className="rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface hover:text-text"
          >
            Movies
          </Link>
          <Link
            href="/tv"
            className="rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface hover:text-text"
          >
            TV Shows
          </Link>

          <div className="group relative">
            <button
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface hover:text-text"
              aria-haspopup="true"
            >
              Genre
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            <div className="invisible absolute left-0 top-full z-50 w-56 rounded-xl border border-border bg-surface p-1.5 opacity-0 shadow-[var(--shadow)] transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              {/* no-scrollbar hides the ugly default scrollbar; overscroll-contain keeps
                  scrolling inside the menu instead of scrolling the page. */}
              <div className="no-scrollbar grid max-h-80 grid-cols-1 gap-0.5 overflow-y-auto overscroll-contain p-0.5">
                {GENRES.map((g) => (
                  <Link
                    key={g.slug}
                    href={`/genre/${g.slug}`}
                    prefetch={false}
                    className="rounded-lg px-3 py-1.5 text-sm text-text-secondary transition hover:bg-surface-2 hover:text-accent focus-visible:bg-surface-2 focus-visible:text-accent"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>

        <Form action="/search" className="ml-auto hidden flex-1 max-w-xs sm:block" role="search">
          <label htmlFor="site-search" className="sr-only">
            Search movies and TV shows
          </label>
          <input
            id="site-search"
            type="search"
            name="q"
            maxLength={MAX_SEARCH_LENGTH}
            required
            placeholder="Search movies & shows…"
            className="w-full rounded-full border border-border bg-surface px-4 py-2 text-sm text-text placeholder:text-text-secondary focus:border-accent focus:outline-none"
          />
        </Form>

        <div className="ml-auto sm:ml-0">
          <ThemeToggle />
        </div>
      </div>
    </HeaderShell>
  );
}
