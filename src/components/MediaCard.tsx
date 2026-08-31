import Link from "next/link";
import { titleOf, yearOf, hrefFor, watchHrefFor } from "@/lib/servers";
import { ratingPercent, ratingColor } from "@/lib/rating";
import { POSTER_BASE } from "@/lib/tmdb";
import type { MediaItem } from "@/lib/types";

export default function MediaCard({
  item,
  linkToWatch = false,
}: {
  item: MediaItem;
  linkToWatch?: boolean;
}) {
  const percent = ratingPercent(item.vote_average);

  return (
    <Link
      href={linkToWatch ? watchHrefFor(item) : hrefFor(item)}
      className="group block w-full text-left"
      aria-label={titleOf(item)}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-surface-2 shadow-[var(--shadow)] transition duration-300 group-hover:-translate-y-1 group-hover:ring-2 group-hover:ring-accent">
        {item.poster_path ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={`${POSTER_BASE}${item.poster_path}`}
            alt={titleOf(item)}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface-2 to-surface p-4 text-center">
            <span className="text-sm text-text-secondary">{titleOf(item)}</span>
          </div>
        )}
        {item.vote_average ? (
          <span
            className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full border-2 text-[11px] font-bold text-white"
            style={{
              borderColor: ratingColor(item.vote_average),
              backgroundColor: "rgba(0,0,0,0.65)",
              color: ratingColor(item.vote_average),
            }}
          >
            {percent}
          </span>
        ) : null}
      </div>
      <h3 className="mt-2 truncate text-sm font-medium text-text transition group-hover:text-accent">
        {titleOf(item)}
      </h3>
      <p className="text-xs text-text-secondary">{yearOf(item)}</p>
    </Link>
  );
}
