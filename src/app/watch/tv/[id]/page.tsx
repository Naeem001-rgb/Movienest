import type { Metadata } from "next";
import { notFound } from "next/navigation";
import WatchPage from "@/components/WatchPage";
import { tmdbFetch, isNotFound } from "@/lib/tmdb";
import { titleOf } from "@/lib/servers";
import type { EpisodeItem, MediaDetails } from "@/lib/types";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ season?: string; episode?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const details = await tmdbFetch<MediaDetails>(`/tv/${id}`);
    return { title: `Watch ${titleOf(details)} — Movie Nest` };
  } catch {
    return { title: "Watch — Movie Nest" };
  }
}

export default async function WatchTvRoute({ params, searchParams }: Props) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  if (!/^\d+$/.test(id)) notFound();

  let details: MediaDetails;
  try {
    details = await tmdbFetch<MediaDetails>(`/tv/${id}`, {
      append_to_response: "credits",
    });
  } catch (err) {
    if (isNotFound(err)) notFound();
    throw err;
  }

  // Seasons sorted by number; default to season 1 or the first available.
  const seasons = [...(details.seasons ?? [])]
    .filter((s) => s.season_number > 0 || (details.seasons ?? []).length === 1)
    .sort((a, b) => a.season_number - b.season_number)
    .map((s) => ({ season_number: s.season_number, name: s.name }));

  let season: number | undefined;
  let episode: number | undefined;
  let episodes: EpisodeItem[] = [];

  if (seasons.length > 0) {
    const requestedSeason = parseInt(sp.season ?? "", 10);
    const hasSeason1 = seasons.some((s) => s.season_number === 1);
    const fallbackSeason = hasSeason1 ? 1 : seasons[0].season_number;
    season = seasons.some((s) => s.season_number === requestedSeason)
      ? requestedSeason
      : fallbackSeason;

    // Episode list is always live.
    try {
      const seasonData = await tmdbFetch<{ episodes: EpisodeItem[] }>(
        `/tv/${id}/season/${season}`,
        {},
        0
      );
      episodes = seasonData.episodes ?? [];
    } catch (err) {
      if (!isNotFound(err)) throw err;
    }

    const requestedEpisode = parseInt(sp.episode ?? "", 10);
    const maxEpisode = episodes.length > 0 ? episodes[episodes.length - 1].episode_number : 0;
    episode =
      Number.isInteger(requestedEpisode) && requestedEpisode >= 1 && requestedEpisode <= maxEpisode
        ? requestedEpisode
        : Math.min(1, maxEpisode) || 1;
  }

  return (
    <WatchPage
      details={details}
      type="tv"
      season={season}
      episode={episode}
      seasons={seasons}
      episodes={episodes}
    />
  );
}
