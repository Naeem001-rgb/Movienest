import MediaCard from "./MediaCard";
import type { MediaItem } from "@/lib/types";

export default function MediaGrid({
  items,
  linkToWatch = false,
}: {
  items: MediaItem[];
  linkToWatch?: boolean;
}) {
  const posters = items.filter((i) => i.poster_path);

  if (posters.length === 0) {
    return (
      <p className="py-16 text-center text-text-secondary">
        Nothing to show here right now. Try browsing something else.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {posters.map((item) => (
        <MediaCard key={`${item.media_type ?? ""}-${item.id}`} item={item} linkToWatch={linkToWatch} />
      ))}
    </div>
  );
}
