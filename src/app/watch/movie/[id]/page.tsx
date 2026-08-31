import type { Metadata } from "next";
import { notFound } from "next/navigation";
import WatchPage from "@/components/WatchPage";
import { tmdbFetch, isNotFound } from "@/lib/tmdb";
import { titleOf } from "@/lib/servers";
import type { MediaDetails } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const details = await tmdbFetch<MediaDetails>(`/movie/${id}`);
    return { title: `Watch ${titleOf(details)} — Movie Nest` };
  } catch {
    return { title: "Watch — Movie Nest" };
  }
}

export default async function WatchMovieRoute({ params }: Props) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  let details: MediaDetails;
  try {
    details = await tmdbFetch<MediaDetails>(`/movie/${id}`, {
      append_to_response: "credits",
    });
  } catch (err) {
    if (isNotFound(err)) notFound();
    throw err;
  }

  return <WatchPage details={details} type="movie" />;
}
