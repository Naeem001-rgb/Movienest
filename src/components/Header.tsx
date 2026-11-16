"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Form from "next/form";
import { usePathname } from "next/navigation";
import HeaderShell from "./HeaderShell";
import { MAX_SEARCH_LENGTH } from "@/lib/params";
import { ThemeToggle } from "@/lib/theme";
import { GENRES } from "@/lib/genres";

const links = [
  { href: "/", label: "Home" },
  { href: "/movies", label: "Movies" },
  { href: "/tv", label: "TV Shows" },
];

function RollingLabel({ children }: { children: string }) {
  return (
    <span className="nav-label">
      <span className="nav-label-track">
        <span>{children}</span>
        <span aria-hidden="true">{children}</span>
      </span>
    </span>
  );
}

function HeaderSearch({
  id,
  onSearch,
  expandable = false,
}: {
  id: string;
  onSearch: () => void;
  expandable?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isOpen = !expandable || expanded;

  useEffect(() => {
    if (!expandable || !expanded) return;
    inputRef.current?.focus();
    const close = (event: PointerEvent) => {
      if (!formRef.current?.contains(event.target as Node)) setExpanded(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [expandable, expanded]);

  const icon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 4.5 4.5" strokeLinecap="round" />
    </svg>
  );

  return (
    <Form
      ref={formRef}
      action="/search"
      className={`nav-search${expandable ? " nav-search-expandable" : ""}`}
      data-expanded={isOpen}
      role="search"
      onSubmit={() => {
        onSearch();
        setExpanded(false);
        inputRef.current?.blur();
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setExpanded(false);
      }}
      onKeyDown={(event) => {
        if (!expandable || !expanded || event.key !== "Escape") return;
        event.preventDefault();
        event.stopPropagation();
        setExpanded(false);
        triggerRef.current?.focus();
      }}
    >
      <label htmlFor={id} className="sr-only">
        Search movies and TV shows
      </label>
      <button
        ref={triggerRef}
        type={expandable && !expanded ? "button" : "submit"}
        className="nav-search-trigger"
        aria-label={expandable && !expanded ? "Open search" : "Submit search"}
        aria-expanded={expandable ? expanded : undefined}
        aria-controls={expandable ? id : undefined}
        onClick={(event) => {
          if (!expandable || expanded) return;
          event.preventDefault();
          setExpanded(true);
        }}
      >
        {icon}
      </button>
      <input
        ref={inputRef}
        id={id}
        type="search"
        name="q"
        disabled={!isOpen}
        maxLength={MAX_SEARCH_LENGTH}
        required
        placeholder="Search movies & shows…"
        autoComplete="off"
        enterKeyHint="search"
      />
    </Form>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<"genres" | "mobile" | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const genreTrigger = useRef<HTMLButtonElement>(null);
  const mobileTrigger = useRef<HTMLButtonElement>(null);
  const closeMenu = () => setOpenMenu(null);
  const isCurrent = (href: string) =>
    href === "/"
      ? pathname === "/"
      : href === "/movies"
        ? /^\/(movies|movie|watch\/movie)(\/|$)/.test(pathname)
        : /^\/(tv|watch\/tv)(\/|$)/.test(pathname);

  useEffect(() => {
    if (!openMenu) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpenMenu(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpenMenu(null);
      (openMenu === "genres" ? genreTrigger : mobileTrigger).current?.focus();
    };
    const close = () => setOpenMenu(null);
    const desktop = window.matchMedia("(min-width: 1024px)");
    desktop.addEventListener("change", close);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("popstate", close);
    return () => {
      desktop.removeEventListener("change", close);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("popstate", close);
    };
  }, [openMenu]);

  const genreLinks = GENRES.map((genre) => (
    <li key={genre.slug}>
      <Link
        href={`/genre/${genre.slug}`}
        prefetch={false}
        aria-current={pathname === `/genre/${genre.slug}` ? "page" : undefined}
        className="nav-menu-link"
        onClick={closeMenu}
      >
        {genre.name}
      </Link>
    </li>
  ));

  return (
    <HeaderShell>
      <div
        ref={navRef}
        className="site-nav"
        onBlurCapture={(event) => {
          if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget))
            closeMenu();
        }}
      >
        <Link href="/" className="nav-brand" aria-label="Movie Nest home" onClick={closeMenu}>
          <span className="nav-brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <rect x="3" y="4" width="18" height="16" rx="3" />
              <path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" />
              <path d="m10 9 4 3-4 3Z" fill="currentColor" stroke="none" />
            </svg>
          </span>
          <span className="whitespace-nowrap text-base font-semibold tracking-tight">
            Movie <span className="nav-brand-accent">Nest</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="nav-link"
              aria-current={isCurrent(href) ? "page" : undefined}
              onClick={closeMenu}
            >
              <RollingLabel>{label}</RollingLabel>
            </Link>
          ))}
          <div className="relative">
            <button
              ref={genreTrigger}
              type="button"
              className="nav-link"
              aria-expanded={openMenu === "genres"}
              aria-controls="desktop-genres"
              onClick={() => setOpenMenu(openMenu === "genres" ? null : "genres")}
            >
              <RollingLabel>Genre</RollingLabel>
              <svg
                className="nav-chevron"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div
              id="desktop-genres"
              className="nav-menu nav-genres no-scrollbar"
              hidden={openMenu !== "genres"}
            >
              <p className="px-3 pb-2 pt-1 text-sm font-semibold text-text">Browse by genre</p>
              <ul className="nav-genre-grid">{genreLinks}</ul>
            </div>
          </div>
        </nav>
        <div className="ml-auto flex min-w-0 items-center gap-3">
          <div className="hidden min-w-0 sm:block">
            <HeaderSearch id="site-search" onSearch={closeMenu} expandable />
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <ThemeToggle className="nav-icon-button nav-theme-toggle" />
            <button
              ref={mobileTrigger}
              type="button"
              className="nav-icon-button nav-mobile-trigger"
              aria-label={openMenu === "mobile" ? "Close menu" : "Open menu"}
              aria-expanded={openMenu === "mobile"}
              aria-controls="mobile-navigation"
              onClick={() => setOpenMenu(openMenu === "mobile" ? null : "mobile")}
            >
              <svg
                className="nav-menu-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M5 8h14" />
                <path d="M5 16h14" />
              </svg>
            </button>
          </div>
        </div>
        <div
          id="mobile-navigation"
          className="nav-menu nav-mobile no-scrollbar lg:hidden"
          hidden={openMenu !== "mobile"}
        >
          <div className="mb-4 sm:hidden">
            <HeaderSearch id="mobile-site-search" onSearch={closeMenu} />
          </div>
          <nav aria-label="Mobile">
            <ul className="nav-primary-links grid grid-cols-3 gap-1">
              {links.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="nav-menu-link justify-center font-medium"
                    aria-current={isCurrent(href) ? "page" : undefined}
                    onClick={closeMenu}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mb-2 mt-4 border-t border-border px-3 pt-4 text-sm font-semibold text-text">
              Genres
            </div>
            <ul className="nav-genre-grid">{genreLinks}</ul>
          </nav>
        </div>
      </div>
    </HeaderShell>
  );
}
