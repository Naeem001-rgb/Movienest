import { parsePage, type QueryValue, searchQuery } from "@/lib/params";
import type { Metadata } from "next";
import MediaGrid from "@/components/MediaGrid";
import Pagination from "@/components/Pagination";
import { tmdbFetch } from "@/lib/tmdb";
import type { MediaItem, Paged } from "@/lib/types";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: QueryValue }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  const query = searchQuery(q);
  return {
    title: query ? `Search: ${query} — Movie Nest` : "Search — Movie Nest",
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: QueryValue; page?: QueryValue }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const query = searchQuery(q);
  const page = parsePage(pageParam);

  if (!query) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-3xl font-bold text-text">Search</h1>
        <p className="mt-3 text-text-secondary">
          Use the search box in the header to find movies and TV shows.
        </p>
      </div>
    );
  }

  // Live results — never cached.
  const data = await tmdbFetch<Paged<MediaItem>>("/search/multi", { query, page: String(page) }, 0);

  const results = data.results.filter(
    (item) => (item.media_type === "movie" || item.media_type === "tv") && item.poster_path,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-3xl font-bold text-text">
        Results for <span className="text-accent">&ldquo;{query}&rdquo;</span>
      </h1>
      {results.length === 0 ? (
        <p className="py-16 text-center text-text-secondary">
          No results found for &ldquo;{query}&rdquo;. Try a different search.
        </p>
      ) : (
        <>
          <MediaGrid items={results} />
          <Pagination
            basePath="/search"
            page={data.page}
            totalPages={data.total_pages}
            extraParams={{ q: query }}
          />
        </>
      )}
    </div>
  );
}
