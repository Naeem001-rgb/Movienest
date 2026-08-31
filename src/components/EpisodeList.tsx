"use client";
import { useRouter } from "next/navigation";

export default function EpisodeList({
  showId,
  season,
  episodes,
  currentEpisode,
}: {
  showId: number;
  season: number;
  episodes: { episode_number: number; name: string }[];
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
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {episodes.map((ep) => {
        const active = ep.episode_number === currentEpisode;
        return (
          <button
            key={ep.episode_number}
            onClick={() => select(ep.episode_number)}
            aria-pressed={active}
            className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
              active
                ? "border-accent bg-surface-2"
                : "border-border bg-surface hover:border-accent/60"
            }`}
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                active ? "bg-accent text-accent-contrast" : "bg-surface-2 text-text-secondary"
              }`}
            >
              {ep.episode_number}
            </span>
            <span
              className={`truncate text-sm font-medium ${active ? "text-accent" : "text-text"}`}
              title={ep.name}
            >
              {ep.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
