import Link from "next/link";
import { titleOf, yearOf } from "@/lib/servers";
import { ratingPercent, ratingColor } from "@/lib/rating";
import { POSTER_BASE, BACKDROP_BASE } from "@/lib/tmdb";
import type { MediaDetails, MediaType } from "@/lib/types";

export default function DetailsPage({
  details,
  type,
}: {
  details: MediaDetails;
  type: MediaType;
}) {
  const title = titleOf(details);
  const year = yearOf(details);
  const genreNames = details.genres?.map((g) => g.name).join(", ") || "N/A";
  const cast = details.credits?.cast?.slice(0, 5).map((a) => a.name).join(", ");
  const country = details.production_countries?.map((c) => c.name).join(", ") || "N/A";
  const production = details.production_companies?.slice(0, 3).map((c) => c.name).join(", ");

  const meta = [
    year,
    type === "movie" && details.runtime ? `${details.runtime} min` : null,
    type === "tv" && details.number_of_seasons
      ? `${details.number_of_seasons} Season${details.number_of_seasons > 1 ? "s" : ""}`
      : null,
    genreNames,
  ].filter(Boolean) as string[];

  return (
    <article>
      {/* Hero. `isolate` + the -z-10 backdrop layer keep the artwork behind the poster
          and copy — a positioned banner would otherwise paint over both. The crop is
          biased above centre so faces survive the wide, short box. */}
      <section className="relative isolate">
        <div className="absolute inset-x-0 top-0 -z-10 h-[240px] overflow-hidden sm:h-[340px] lg:h-[420px]">
          {details.backdrop_path ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={`${BACKDROP_BASE}${details.backdrop_path}`}
              alt=""
              className="h-full w-full object-cover object-[50%_22%]"
            />
          ) : (
            <div className="absolute inset-0 bg-surface-2" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/25" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/75 to-transparent" />
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-10 pt-[150px] sm:px-6 sm:pt-[210px] lg:pt-[260px]">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-10">
            {/* Poster — overlaps the lower part of the backdrop by design */}
            <div className="w-44 shrink-0 sm:w-56 lg:w-64">
              {details.poster_path ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={`${POSTER_BASE}${details.poster_path}`}
                  alt={title}
                  className="aspect-[2/3] h-full w-full rounded-2xl object-cover ring-1 ring-border shadow-[var(--shadow)]"
                />
              ) : (
                <div className="aspect-[2/3] w-full rounded-2xl ring-1 ring-border bg-surface-2 shadow-[var(--shadow)]" />
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                {type === "tv" ? "TV Show" : "Movie"}
              </p>
              <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-text sm:text-4xl lg:text-5xl">
                {title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-text-secondary">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-full border-2 bg-background/60 text-sm font-bold"
                  style={{
                    borderColor: ratingColor(details.vote_average),
                    color: ratingColor(details.vote_average),
                  }}
                  title="User rating"
                >
                  {ratingPercent(details.vote_average)}
                </span>
                {meta.map((bit, i) => (
                  <span key={i} className="flex items-center gap-3">
                    {i > 0 ? (
                      <span aria-hidden="true" className="text-text-secondary/40">
                        •
                      </span>
                    ) : null}
                    {bit}
                  </span>
                ))}
              </div>

              {details.tagline ? (
                <p className="mt-5 text-sm italic text-accent sm:text-base">{details.tagline}</p>
              ) : null}

              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-text-secondary sm:text-base">
                {details.overview || "No overview available."}
              </p>

              <dl className="mt-7 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                {cast ? (
                  <>
                    <dt className="font-semibold text-text">Cast:</dt>
                    <dd className="text-text-secondary">{cast}</dd>
                  </>
                ) : null}
                <dt className="font-semibold text-text">Country:</dt>
                <dd className="text-text-secondary">{country}</dd>
                {production ? (
                  <>
                    <dt className="font-semibold text-text">Production:</dt>
                    <dd className="text-text-secondary">{production}</dd>
                  </>
                ) : null}
              </dl>

              <Link
                href={`/watch/${type}/${details.id}`}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3.5 text-sm font-bold text-accent-contrast shadow-[var(--shadow)] transition hover:opacity-90"
              >
                ▶ Watch Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
