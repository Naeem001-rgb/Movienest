import { Suspense } from "react";
import { isMediaId } from "@/lib/params";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DetailsPage from "@/components/DetailsPage";
import RelatedGrid from "@/components/RelatedGrid";
import { getMediaDetails, isNotFound } from "@/lib/tmdb";
import { titleOf } from "@/lib/servers";
import type { MediaDetails } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const details = await getMediaDetails("tv", id);
    return {
      title: `${titleOf(details)} — Movie Nest`,
      description: details.overview?.slice(0, 150),
    };
  } catch {
    return { title: "TV Show — Movie Nest" };
  }
}

export default async function TvDetailsRoute({ params }: Props) {
  const { id } = await params;
  if (!isMediaId(id)) notFound();

  let details: MediaDetails;
  try {
    details = await getMediaDetails("tv", id);
  } catch (err) {
    if (isNotFound(err)) notFound();
    throw err;
  }

  return (
    <>
      <DetailsPage details={details} type="tv" />
      <Suspense fallback={null}>
        <RelatedGrid id={details.id} type="tv" />
      </Suspense>
    </>
  );
}
