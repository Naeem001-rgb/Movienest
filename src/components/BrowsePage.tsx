import MediaGrid from "@/components/MediaGrid";
import Pagination from "@/components/Pagination";
import { tmdbFetch } from "@/lib/tmdb";
import type { MediaItem, Paged } from "@/lib/types";

export default async function BrowsePage({
  title,
  endpoint,
  extraParams = {},
  basePath,
  page,
  extraQuery = {},
}: {
  title: string;
  endpoint: string;
  extraParams?: Record<string, string>;
  basePath: string;
  page: number;
  extraQuery?: Record<string, string>;
}) {
  const data = await tmdbFetch<Paged<MediaItem>>(endpoint, {
    ...extraParams,
    page: String(page),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-3xl font-bold text-text">{title}</h1>
      <MediaGrid items={data.results} />
      <Pagination basePath={basePath} page={data.page} totalPages={data.total_pages} extraParams={extraQuery} />
    </div>
  );
}
