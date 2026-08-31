import MediaGrid from "@/components/MediaGrid";
import { tmdbFetch } from "@/lib/tmdb";
import type { MediaItem, Paged, MediaType } from "@/lib/types";

export default async function RelatedGrid({
  id,
  type,
  linkToWatch = false,
}: {
  id: number;
  type: MediaType;
  linkToWatch?: boolean;
}) {
  let data = await tmdbFetch<Paged<MediaItem>>(`/${type}/${id}/similar`);

  // Fall back to popular when a title has no similar results.
  let items = data.results.filter((i) => i.poster_path);
  if (items.length === 0) {
    data = await tmdbFetch<Paged<MediaItem>>(`/${type}/popular`);
    items = data.results.filter((i) => i.poster_path);
  }

  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h2 className="mb-6 text-2xl font-bold text-text">More Like This</h2>
      <MediaGrid items={items.slice(0, 12)} />
    </section>
  );
}
