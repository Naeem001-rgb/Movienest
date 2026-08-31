import type { MetadataRoute } from "next";
import { tmdbFetch } from "@/lib/tmdb";
import type { MediaItem, Paged } from "@/lib/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://movie-nest-application.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    "",
    "/movies",
    "/tv",
    "/search",
    "/contact",
    "/privacy",
    "/terms",
    "/dmca",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: path === "" ? 1 : 0.7,
  }));

  const entries: MetadataRoute.Sitemap = [...staticEntries];

  try {
    const [trending, popularMovies, popularTv] = await Promise.all([
      tmdbFetch<Paged<MediaItem>>("/trending/all/week"),
      tmdbFetch<Paged<MediaItem>>("/movie/popular"),
      tmdbFetch<Paged<MediaItem>>("/tv/popular"),
    ]);

    for (const item of trending.results) {
      const type = item.media_type === "tv" ? "tv" : "movie";
      entries.push({
        url: `${SITE_URL}/${type}/${item.id}`,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
    for (const item of popularMovies.results) {
      entries.push({ url: `${SITE_URL}/movie/${item.id}`, changeFrequency: "weekly", priority: 0.6 });
    }
    for (const item of popularTv.results) {
      entries.push({ url: `${SITE_URL}/tv/${item.id}`, changeFrequency: "weekly", priority: 0.6 });
    }
  } catch {
    // Sitemap still serves static routes if TMDB is unreachable.
  }

  return entries;
}
