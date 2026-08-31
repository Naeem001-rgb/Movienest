"use client";
import { useRouter } from "next/navigation";

export default function SeasonPicker({
  showId,
  seasons,
  currentSeason,
}: {
  showId: number;
  seasons: { season_number: number; name: string }[];
  currentSeason: number;
}) {
  const router = useRouter();

  const change = (season: number) => {
    router.push(`/watch/tv/${showId}?season=${season}&episode=1`);
  };

  return (
    <label className="inline-flex items-center gap-2 text-sm font-semibold text-text">
      Season
      <select
        value={currentSeason}
        onChange={(e) => change(Number(e.target.value))}
        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text focus:border-accent focus:outline-none"
      >
        {seasons.map((s) => (
          <option key={s.season_number} value={s.season_number}>
            {s.name}
          </option>
        ))}
      </select>
    </label>
  );
}
