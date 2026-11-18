import type { MetadataRoute } from "next";
import { tmdbFetch } from "@/lib/tmdb";
import type { MediaItem, Paged } from "@/lib/types";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
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
    changeFrequency: "daily",
    priority: path === "" ? 1 : 0.7,
  }));

  try {
    const [trending, popularMovies, popularTv] = await Promise.all([
      tmdbFetch<Paged<MediaItem>>("/trending/all/week"),
      tmdbFetch<Paged<MediaItem>>("/movie/popular"),
      tmdbFetch<Paged<MediaItem>>("/tv/popular"),
    ]);

    for (const item of trending.results) {
      if (item.media_type !== "movie" && item.media_type !== "tv") continue;
      entries.push({
        url: `${SITE_URL}/${item.media_type}/${item.id}`,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
    for (const item of popularMovies.results) {
      entries.push({
        url: `${SITE_URL}/movie/${item.id}`,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
    for (const item of popularTv.results) {
      entries.push({ url: `${SITE_URL}/tv/${item.id}`, changeFrequency: "weekly", priority: 0.6 });
    }
  } catch {
    // Sitemap still serves static routes if TMDB is unreachable.
  }

  return [...new Map(entries.map((entry) => [entry.url, entry])).values()];
}
