import Link from "next/link";
import Newsletter from "./Newsletter";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden="true">
                🎬
              </span>
              <span className="text-lg font-bold text-text">
                Movie <span className="text-accent">Nest</span>
              </span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-text-secondary">
              Your nest for browsing and streaming movies and TV shows. Discover what&apos;s
              trending, search for classics, and start watching in seconds.
            </p>
          </div>

          <nav aria-label="Legal">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text">Legal</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/contact" className="text-text-secondary transition hover:text-accent">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-text-secondary transition hover:text-accent">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-text-secondary transition hover:text-accent">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/dmca" className="text-text-secondary transition hover:text-accent">
                  DMCA
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text">
              Stay updated
            </h3>
            <p className="mt-3 text-sm text-text-secondary">
              Get notified about new releases and trending titles.
            </p>
            <Newsletter />
          </div>
        </div>

        <p className="mt-10 border-t border-border pt-6 text-center text-xs text-text-secondary">
          © {new Date().getFullYear()} Movie Nest. All trademarks and media belong to their
          respective owners.
        </p>
      </div>
    </footer>
  );
}
