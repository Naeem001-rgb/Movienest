"use client";
import { useRouter } from "next/navigation";
import { STILL_BASE } from "@/lib/tmdb";

function formatAirDate(airDate?: string): string | null {
  if (!airDate) return null;
  const d = new Date(airDate);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function EpisodeList({
  showId,
  season,
  episodes,
  currentEpisode,
}: {
  showId: number;
  season: number;
  episodes: {
    episode_number: number;
    name: string;
    overview?: string;
    still_path?: string | null;
    air_date?: string;
  }[];
  currentEpisode: number;
}) {
  const router = useRouter();

  const select = (episodeNumber: number) => {
    router.push(`/watch/tv/${showId}?season=${season}&episode=${episodeNumber}`);
    // Scroll the player into view after navigation settles.
    requestAnimationFrame(() => {
      document.getElementById("player-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  if (episodes.length === 0) {
    return <p className="py-6 text-center text-text-secondary">No episodes found for this season.</p>;
  }

  return (
    // Grid columns are counted on the cards, not the row, so the layout holds
    // from phones (1–2 across) up to desktop (3 across) with roomy thumbnails.
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {episodes.map((ep) => {
        const active = ep.episode_number === currentEpisode;
        const airDate = formatAirDate(ep.air_date);
        return (
          <button
            key={ep.episode_number}
            onClick={() => select(ep.episode_number)}
            aria-pressed={active}
            aria-label={`Play episode ${ep.episode_number}: ${ep.name}`}
            className={`group overflow-hidden rounded-xl border text-left transition duration-200 ${
              active
                ? "border-accent bg-surface-2 shadow-[var(--shadow)]"
                : "border-border bg-surface hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-[var(--shadow)]"
            }`}
          >
            {/* Still — 16:9, number badge, play affordance on hover. overflow-hidden
                keeps the zoom inside the rounded corners. */}
            <div className="relative aspect-video w-full overflow-hidden bg-surface-2">
              {ep.still_path ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={`${STILL_BASE}${ep.still_path}`}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-3xl font-extrabold text-text-secondary/30">
                    {ep.episode_number}
                  </span>
                </div>
              )}
              <span
                className={`absolute left-2 top-2 flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-xs font-bold ${
                  active ? "bg-accent text-accent-contrast" : "bg-background/80 text-text backdrop-blur-sm"
                }`}
              >
                {ep.episode_number}
              </span>
              {/* Play chip — sits over the still, brightens on hover. */}
              <span
                className={`absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full text-sm transition ${
                  active
                    ? "bg-accent text-accent-contrast"
                    : "bg-background/70 text-text opacity-80 backdrop-blur-sm group-hover:bg-accent group-hover:text-accent-contrast group-hover:opacity-100"
                }`}
                aria-hidden="true"
              >
                ▶
              </span>
            </div>

            <div className="p-3">
              <div className="flex items-baseline justify-between gap-2">
                <span
                  className={`truncate text-sm font-semibold ${active ? "text-accent" : "text-text"}`}
                  title={ep.name}
                >
                  {ep.name}
                </span>
                {airDate ? (
                  <span className="shrink-0 text-xs text-text-secondary">{airDate}</span>
                ) : null}
              </div>
              {ep.overview ? (
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-secondary">
                  {ep.overview}
                </p>
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  );
}
