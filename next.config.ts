import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Legacy static-site URLs → new routes, so old links keep working.
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/movie.html", destination: "/", permanent: false },
      { source: "/watch.html", destination: "/", permanent: false },
      { source: "/privacy-policy.html", destination: "/privacy", permanent: true },
      { source: "/Terms%20of%20Service.html", destination: "/terms", permanent: true },
      { source: "/DMCA.html", destination: "/dmca", permanent: true },
      { source: "/contact.html", destination: "/contact", permanent: true },
      { source: "/sitemap.html", destination: "/sitemap.xml", permanent: true },
    ];
  },
  async rewrites() {
    // Query-string variants (movie.html?id=…&type=…) are handled by route
    // handlers in src/app/*.html/route.ts; plain .html hits go through
    // redirects above. Static legacy SEO files are served from public/.
    return [];
  },
};

export default nextConfig;
