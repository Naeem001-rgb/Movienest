import Hero from "@/components/Hero";
import MediaRow from "@/components/MediaRow";
import { tmdbFetch } from "@/lib/tmdb";
import type { MediaItem, Paged } from "@/lib/types";

export const revalidate = 3600;

export default async function HomePage() {
  const [trending, popularMovies, onAir, topRated, action, comedy, horror] = await Promise.all([
    tmdbFetch<Paged<MediaItem>>("/trending/all/week"),
    tmdbFetch<Paged<MediaItem>>("/movie/popular"),
    tmdbFetch<Paged<MediaItem>>("/tv/on_the_air"),
    tmdbFetch<Paged<MediaItem>>("/movie/top_rated"),
    tmdbFetch<Paged<MediaItem>>("/discover/movie", { with_genres: "28" }),
    tmdbFetch<Paged<MediaItem>>("/discover/movie", { with_genres: "35" }),
    tmdbFetch<Paged<MediaItem>>("/discover/movie", { with_genres: "27" }),
  ]);

  const hero = trending.results.find((item) => item.backdrop_path) ?? trending.results[0];

  return (
    <div className="pb-8">
      {hero ? <Hero item={hero} /> : null}

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <MediaRow title="Trending This Week" items={trending.results} />
        <MediaRow title="Popular Movies" items={popularMovies.results} />
        <MediaRow title="Currently Airing TV" items={onAir.results} />
        <MediaRow title="Top Rated Movies" items={topRated.results} />
        <MediaRow title="Action Movies" items={action.results} />
        <MediaRow title="Comedy Movies" items={comedy.results} />
        <MediaRow title="Horror Movies" items={horror.results} />
      </div>
    </div>
  );
}
