import Link from "next/link";
import BackToTop from "./BackToTop";
import Newsletter from "./Newsletter";

const linkGroups = [
  {
    className: "footer-browse",
    label: "Explore Movie Nest",
    links: [
      { href: "/", label: "Home" },
      { href: "/movies", label: "Movies" },
      { href: "/tv", label: "TV Shows" },
      { href: "/search", label: "Search" },
    ],
  },
  {
    className: "footer-genres",
    label: "Popular genres",
    links: [
      { href: "/genre/action", label: "Action" },
      { href: "/genre/comedy", label: "Comedy" },
      { href: "/genre/drama", label: "Drama" },
      { href: "/genre/animation", label: "Animation" },
    ],
  },
  {
    className: "footer-legal",
    label: "Legal",
    links: [
      { href: "/terms", label: "Terms of Service" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/dmca", label: "DMCA" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-panel">
        <div className="footer-brand">
          <Link href="/" className="footer-wordmark" aria-label="Movie Nest home">
            Movie <span>Nest</span>
          </Link>
          <p>Your nest for movies and TV shows.</p>
        </div>

        {linkGroups.map(({ className, label, links }) => (
          <nav key={label} className={`footer-links ${className}`} aria-label={label}>
            <ul>
              {links.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} prefetch={false}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <section className="footer-newsletter" aria-labelledby="footer-newsletter-title">
          <h2 id="footer-newsletter-title">
            Movie Nest
            <br />
            in your mailbox
          </h2>
          <Newsletter />
        </section>

        <div className="footer-contact">
          <a className="footer-email" href="mailto:support@movienest.com">
            support@movienest.com
          </a>
          <p className="footer-copyright">
            © {new Date().getFullYear()} Movie Nest.
            <br />
            All trademarks and media belong to their respective owners.
          </p>
        </div>

        <div className="footer-top">
          <BackToTop />
        </div>
      </div>
    </footer>
  );
}
