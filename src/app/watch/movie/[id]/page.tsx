import { isMediaId } from "@/lib/params";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import WatchPage from "@/components/WatchPage";
import { getMediaDetails, isNotFound } from "@/lib/tmdb";
import { titleOf } from "@/lib/servers";
import type { MediaDetails } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const details = await getMediaDetails("movie", id);
    return { title: `Watch ${titleOf(details)} — Movie Nest` };
  } catch {
    return { title: "Watch — Movie Nest" };
  }
}

export default async function WatchMovieRoute({ params }: Props) {
  const { id } = await params;
  if (!isMediaId(id)) notFound();

  let details: MediaDetails;
  try {
    details = await getMediaDetails("movie", id);
  } catch (err) {
    if (isNotFound(err)) notFound();
    throw err;
  }

  return <WatchPage details={details} type="movie" />;
}
