import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Keep static rendering and third-party player redirects working. This
          // policy blocks plugins, injected base URLs, off-site forms and framing.
          {
            key: "Content-Security-Policy",
            value: "base-uri 'self'; object-src 'none'; form-action 'self'; frame-ancestors 'self'",
          },
        ],
      },
    ];
  },
  // Hide the dev-only Route/Bundle indicator (bottom-left popover) — not site UI.
  devIndicators: false,
  async redirects() {
    return [
      // Legacy static-site URLs without query strings → new routes.
      // movie.html / watch.html WITH ?id=&type= are handled by route
      // handlers in src/app/*.html/route.ts, so they're not listed here.
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/privacy-policy.html", destination: "/privacy", permanent: true },
      { source: "/Terms%20of%20Service.html", destination: "/terms", permanent: true },
      { source: "/DMCA.html", destination: "/dmca", permanent: true },
      { source: "/contact.html", destination: "/contact", permanent: true },
      { source: "/sitemap.html", destination: "/sitemap.xml", permanent: true },
    ];
  },
};

export default nextConfig;
