import MediaCard from "./MediaCard";
import type { MediaItem } from "@/lib/types";

export default function MediaRow({ title, items }: { title: string; items: MediaItem[] }) {
  const posters = items.filter((i) => i.poster_path);
  if (posters.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="mb-4 text-xl font-semibold text-text sm:text-2xl">{title}</h2>
      <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {posters.map((item) => (
          <div key={`${item.media_type ?? ""}-${item.id}`} className="w-[150px] shrink-0 snap-start sm:w-[170px]">
            <MediaCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}
