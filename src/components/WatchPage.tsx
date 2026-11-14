import Link from "next/link";
import { Suspense } from "react";
import Player from "@/components/Player";
import EpisodeList from "@/components/EpisodeList";
import SeasonPicker from "@/components/SeasonPicker";
import RelatedGrid from "@/components/RelatedGrid";
import CastPortrait from "@/components/CastPortrait";
import WatchDetailsBorder from "@/components/WatchDetailsBorder";
import { titleOf, yearOf } from "@/lib/servers";
import { ratingPercent, ratingColor } from "@/lib/rating";
import type { EpisodeItem, MediaDetails, MediaType } from "@/lib/types";

export default function WatchPage({
  details,
  type,
  season,
  episode,
  seasons,
  episodes,
}: {
  details: MediaDetails;
  type: MediaType;
  season?: number;
  episode?: number;
  seasons?: { season_number: number; name: string }[];
  episodes?: EpisodeItem[];
}) {
  const title = titleOf(details);
  const genreNames = details.genres?.map((g) => g.name).join(", ");
  const cast = details.credits?.cast?.slice(0, 5) ?? [];

  return (
    <div className="overflow-x-clip pb-8">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-text-secondary">
          <Link href={type === "tv" ? "/tv" : "/movies"} className="transition hover:text-accent">
            {type === "tv" ? "TV Shows" : "Movies"}
          </Link>
          <span className="mx-2">›</span>
          <span className="text-text">{title}</span>
          {season != null && episode != null ? (
            <span className="text-text-secondary">
              {" "}
              · S{season} E{episode}
            </span>
          ) : null}
        </nav>

        {/* Player */}
        <div id="player-section">
          <Player
            media={{
              id: details.id,
              type,
              title,
              posterPath: details.poster_path ?? null,
              season,
              episode,
              episodeTitle: episodes?.find((item) => item.episode_number === episode)?.name,
            }}
          />
        </div>

        {/* TV season + episodes */}
        {type === "tv" && seasons && seasons.length > 0 ? (
          <section className="mt-10">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-text">Episodes</h2>
              <SeasonPicker showId={details.id} seasons={seasons} currentSeason={season!} />
            </div>
            <EpisodeList
              showId={details.id}
              season={season!}
              episodes={episodes ?? []}
              currentEpisode={episode!}
            />
          </section>
        ) : null}

        {/* Title info */}
        <section className="watch-details-panel mt-10 rounded-2xl bg-surface p-5 shadow-[var(--shadow)] sm:p-6 lg:p-8">
          <WatchDetailsBorder />
          <div
            className={`grid gap-6 ${cast.length > 0 ? "lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-8" : ""}`}
          >
            <div className="min-w-0">
              <h1 className="text-balance text-3xl font-extrabold text-text">{title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                <span className="font-bold" style={{ color: ratingColor(details.vote_average) }}>
                  ● {ratingPercent(details.vote_average)}%
                </span>
                <span>{yearOf(details)}</span>
                {genreNames ? <span>{genreNames}</span> : null}
              </div>
              <p className="mt-4 max-w-prose text-sm leading-relaxed text-text-secondary sm:text-base">
                {details.overview || "No overview available."}
              </p>
            </div>
            {cast.length > 0 ? (
              <aside
                aria-labelledby="watch-cast-heading"
                className="border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0"
              >
                <h2 id="watch-cast-heading" className="mb-4 text-base font-semibold text-text">
                  Cast
                </h2>
                <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-1">
                  {cast.map((member) => (
                    <li key={member.id} className="flex items-center gap-3">
                      <CastPortrait name={member.name} profilePath={member.profile_path} />
                      <div className="min-w-0 wrap-anywhere">
                        <p className="text-sm font-semibold leading-snug text-text">
                          {member.name}
                        </p>
                        {member.character ? (
                          <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">
                            {member.character}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </aside>
            ) : null}
          </div>
        </section>
      </div>

      {/* Related — stays in the watch context */}
      <Suspense fallback={null}>
        <RelatedGrid id={details.id} type={type} linkToWatch />
      </Suspense>
    </div>
  );
}
