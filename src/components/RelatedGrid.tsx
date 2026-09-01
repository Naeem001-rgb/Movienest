import MediaGrid from "@/components/MediaGrid";
import { tmdbFetch, isNotFound } from "@/lib/tmdb";
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
  let items: MediaItem[] = [];

  try {
    const data = await tmdbFetch<Paged<MediaItem>>(`/${type}/${id}/similar`);
    items = data.results.filter((i) => i.poster_path);
  } catch (err) {
    if (!isNotFound(err)) throw err;
  }

  // Fall back to popular when a title has no similar results (or none listed).
  if (items.length === 0) {
    const data = await tmdbFetch<Paged<MediaItem>>(`/${type}/popular`);
    items = data.results.filter((i) => i.poster_path);
  }

  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pt-16 pb-12 sm:px-6">
      <h2 className="mb-6 text-2xl font-bold text-text">More Like This</h2>
      <MediaGrid items={items.slice(0, 12)} linkToWatch={linkToWatch} />
    </section>
  );
}
