import Link from "next/link";
import Player from "@/components/Player";
import EpisodeList from "@/components/EpisodeList";
import SeasonPicker from "@/components/SeasonPicker";
import RelatedGrid from "@/components/RelatedGrid";
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
  const cast = details.credits?.cast?.slice(0, 5).map((a) => a.name).join(", ");

  return (
    <div className="pb-8">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-text-secondary">
          <Link href={type === "tv" ? "/tv" : "/movies"} className="transition hover:text-accent">
            {type === "tv" ? "TV Shows" : "Movies"}
          </Link>
          <span className="mx-2">›</span>
          <span className="text-text">{title}</span>
          {season != null && episode != null ? (
            <span className="text-text-secondary"> · S{season} E{episode}</span>
          ) : null}
        </nav>

        {/* Player */}
        <div id="player-section">
          <Player id={details.id} type={type} season={season} episode={episode} />
        </div>

        {/* TV season + episodes */}
        {type === "tv" && seasons && seasons.length > 0 ? (
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
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
        <section className="mt-10">
          <h1 className="text-3xl font-extrabold text-text">{title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
            <span className="font-bold" style={{ color: ratingColor(details.vote_average) }}>
              ● {ratingPercent(details.vote_average)}%
            </span>
            <span>{yearOf(details)}</span>
            {genreNames ? <span>{genreNames}</span> : null}
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-text-secondary sm:text-base">
            {details.overview || "No overview available."}
          </p>
          {cast ? (
            <p className="mt-4 text-sm text-text-secondary">
              <span className="font-semibold text-text">Cast: </span>
              {cast}
            </p>
          ) : null}
        </section>
      </div>

      {/* Related — stays in the watch context */}
      <RelatedGrid id={details.id} type={type} linkToWatch />
    </div>
  );
}
