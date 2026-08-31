import Link from "next/link";
import { titleOf, yearOf, hrefFor, isMovie } from "@/lib/servers";
import { ratingPercent, ratingColor } from "@/lib/rating";
import { BACKDROP_BASE } from "@/lib/tmdb";
import type { MediaItem } from "@/lib/types";

export default function Hero({ item }: { item: MediaItem }) {
  const type = item.media_type === "tv" || !isMovie(item) ? "tv" : "movie";

  return (
    <section className="relative mb-10 h-[70vh] min-h-[480px] w-full overflow-hidden">
      {item.backdrop_path ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={`${BACKDROP_BASE}${item.backdrop_path}`}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-surface-2" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-16 sm:px-6">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">
          #1 Trending {type === "tv" ? "TV Show" : "Movie"} This Week
        </p>
        <h1 className="max-w-3xl text-4xl font-extrabold leading-tight text-text sm:text-5xl lg:text-6xl">
          {titleOf(item)}
        </h1>
        <div className="mt-3 flex items-center gap-3 text-sm text-text-secondary">
          <span
            className="font-bold"
            style={{ color: ratingColor(item.vote_average) }}
          >
            ● {ratingPercent(item.vote_average)}%
          </span>
          <span>{yearOf(item)}</span>
          {item.overview && (
            <span className="hidden sm:inline">· {item.overview.slice(0, 60)}…</span>
          )}
        </div>
        {item.overview && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base line-clamp-3">
            {item.overview}
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/watch/${type}/${item.id}`}
            className="rounded-full bg-accent px-7 py-3 text-sm font-bold text-accent-contrast shadow-[var(--shadow)] transition hover:opacity-90"
          >
            ▶ Watch Now
          </Link>
          <Link
            href={hrefFor(item)}
            className="rounded-full border border-border bg-surface/60 px-7 py-3 text-sm font-semibold text-text backdrop-blur transition hover:border-accent hover:text-accent"
          >
            More Info
          </Link>
        </div>
      </div>
    </section>
  );
}
