"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/lib/theme";
import { GENRES } from "@/lib/genres";

export default function Header() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const headerRef = useRef<HTMLElement>(null);

  // Hide header on scroll down, show on scroll up (matches the legacy site).
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    let lastScrollTop = 0;
    const scrollThreshold = 100;

    const onScroll = () => {
      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (Math.abs(currentScrollTop - lastScrollTop) < 5) return;
      if (currentScrollTop > scrollThreshold) {
        if (currentScrollTop > lastScrollTop) {
          header.style.transform = "translateY(-100%)";
          header.style.opacity = "0";
        } else {
          header.style.transform = "translateY(0)";
          header.style.opacity = "1";
        }
      } else {
        header.style.transform = "translateY(0)";
        header.style.opacity = "1";
      }
      lastScrollTop = currentScrollTop;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg transition-transform duration-300"
    >
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
            <div className="invisible absolute left-0 top-full z-50 w-56 rounded-xl border border-border bg-surface p-2 opacity-0 shadow-[var(--shadow)] transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="grid max-h-80 grid-cols-1 gap-0.5 overflow-y-auto">
                {GENRES.map((g) => (
                  <Link
                    key={g.slug}
                    href={`/genre/${g.slug}`}
                    className="rounded-lg px-3 py-1.5 text-sm text-text-secondary transition hover:bg-surface-2 hover:text-accent"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>

        <form onSubmit={submitSearch} className="ml-auto hidden flex-1 max-w-xs sm:block" role="search">
          <label htmlFor="site-search" className="sr-only">
            Search movies and TV shows
          </label>
          <input
            id="site-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies & shows…"
            className="w-full rounded-full border border-border bg-surface px-4 py-2 text-sm text-text placeholder:text-text-secondary focus:border-accent focus:outline-none"
          />
        </form>

        <div className="ml-auto sm:ml-0">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
