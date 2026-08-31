import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DetailsPage from "@/components/DetailsPage";
import RelatedGrid from "@/components/RelatedGrid";
import { tmdbFetch, isNotFound } from "@/lib/tmdb";
import { titleOf } from "@/lib/servers";
import type { MediaDetails } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const details = await tmdbFetch<MediaDetails>(`/movie/${id}`, { append_to_response: "credits" });
    return {
      title: `${titleOf(details)} — Movie Nest`,
      description: details.overview?.slice(0, 150),
    };
  } catch {
    return { title: "Movie — Movie Nest" };
  }
}

export default async function MovieDetailsRoute({ params }: Props) {
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

  return (
    <>
      <DetailsPage details={details} type="movie" />
      <RelatedGrid id={details.id} type="movie" />
    </>
  );
}
