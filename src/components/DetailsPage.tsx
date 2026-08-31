import Link from "next/link";
import { titleOf, yearOf } from "@/lib/servers";
import { ratingPercent, ratingColor } from "@/lib/rating";
import { tmdbFetch, POSTER_BASE, BACKDROP_BASE } from "@/lib/tmdb";
import type { MediaDetails, MediaType } from "@/lib/types";

export default async function DetailsPage({
  id,
  type,
}: {
  id: string;
  type: MediaType;
}) {
  const details = await tmdbFetch<MediaDetails>(
    `/${type}/${id}`,
    { append_to_response: "credits" }
  );
  if (!details.id) throw new Error("Not found");

  const title = titleOf(details);
  const year = yearOf(details);
  const genreNames = details.genres?.map((g) => g.name).join(", ") || "N/A";
  const cast = details.credits?.cast?.slice(0, 5).map((a) => a.name).join(", ");
  const country = details.production_countries?.map((c) => c.name).join(", ") || "N/A";
  const production = details.production_companies?.slice(0, 3).map((c) => c.name).join(", ");

  return (
    <article>
      {/* Backdrop banner */}
      <div className="relative h-[45vh] min-h-[320px] w-full overflow-hidden">
        {details.backdrop_path ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={`${BACKDROP_BASE}${details.backdrop_path}`}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-surface-2" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="-mt-32 flex flex-col gap-8 sm:flex-row sm:items-end">
          {/* Poster */}
          <div className="w-44 shrink-0 sm:w-56">
            {details.poster_path ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={`${POSTER_BASE}${details.poster_path}`}
                alt={title}
                className="w-full rounded-xl shadow-[var(--shadow)]"
              />
            ) : (
              <div className="aspect-[2/3] w-full rounded-xl bg-surface-2" />
            )}
          </div>

          {/* Info */}
          <div className="relative z-10 pb-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
              {type === "tv" ? "TV Show" : "Movie"}
            </p>
            <h1 className="mt-1 text-3xl font-extrabold text-text sm:text-4xl">{title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold"
                style={{ borderColor: ratingColor(details.vote_average), color: ratingColor(details.vote_average) }}
                title="User rating"
              >
                {ratingPercent(details.vote_average)}
              </span>
              <span>{year}</span>
              {type === "movie" && details.runtime ? (
                <span>{details.runtime} min</span>
              ) : null}
              {type === "tv" && details.number_of_seasons ? (
                <span>
                  {details.number_of_seasons} Season{details.number_of_seasons > 1 ? "s" : ""}
                </span>
              ) : null}
              <span>{genreNames}</span>
            </div>

            {details.tagline ? (
              <p className="mt-4 text-sm italic text-accent">{details.tagline}</p>
            ) : null}

            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-text-secondary sm:text-base">
              {details.overview || "No overview available."}
            </p>

            <dl className="mt-6 space-y-2 text-sm">
              {cast ? (
                <div className="flex gap-2">
                  <dt className="shrink-0 font-semibold text-text">Cast:</dt>
                  <dd className="text-text-secondary">{cast}</dd>
                </div>
              ) : null}
              <div className="flex gap-2">
                <dt className="shrink-0 font-semibold text-text">Country:</dt>
                <dd className="text-text-secondary">{country}</dd>
              </div>
              {production ? (
                <div className="flex gap-2">
                  <dt className="shrink-0 font-semibold text-text">Production:</dt>
                  <dd className="text-text-secondary">{production}</dd>
                </div>
              ) : null}
            </dl>

            <Link
              href={`/watch/${type}/${details.id}`}
              className="mt-6 inline-block rounded-full bg-accent px-8 py-3 text-sm font-bold text-accent-contrast shadow-[var(--shadow)] transition hover:opacity-90"
            >
              ▶ Watch Now
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
