import MediaCard from "./MediaCard";
import type { MediaItem } from "@/lib/types";

export default function MediaRow({ title, items }: { title: string; items: MediaItem[] }) {
  const posters = items.filter((i) => i.poster_path);
  if (posters.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="mb-4 text-xl font-semibold text-text sm:mb-5 sm:text-2xl">{title}</h2>
      {/* overflow-x forces overflow-y to auto, so this scroll box clips anything past its
          padding edge. On hover the card grows 6px above its box (4px lift + 2px ring),
          and its always-on 24px-blur shadow paints ~12px (blur/2) past the box edges —
          ~16px above the resting top once lifted. pt-6 (24px) clears all three, and
          pb-6 matches it so the title below isn't sheared either. -mt-3/-mb-1 hand the
          extra 12px/4px of padding back so the title gap and row spacing are unchanged.
          Side padding stays well past the 2px ring (px-4 below sm, sm:px-2 at sm+). */}
      <div className="no-scrollbar -mx-4 -mt-3 -mb-1 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pt-6 pb-6 sm:-mx-2 sm:scroll-px-2 sm:px-2">
        {posters.map((item) => (
          <div key={`${item.media_type ?? ""}-${item.id}`} className="w-[180px] shrink-0 snap-start sm:w-[220px] lg:w-[240px]">
            <MediaCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}
