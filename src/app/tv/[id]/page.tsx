import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DetailsPage from "@/components/DetailsPage";
import RelatedGrid from "@/components/RelatedGrid";
import { tmdbFetch } from "@/lib/tmdb";
import { titleOf } from "@/lib/servers";
import type { MediaDetails } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const details = await tmdbFetch<MediaDetails>(`/tv/${id}`, { append_to_response: "credits" });
    const title = titleOf(details);
    return {
      title: `${title} — Movie Nest`,
      description: details.overview?.slice(0, 150),
    };
  } catch {
    return { title: "TV Show — Movie Nest" };
  }
}

export default async function TvDetailsRoute({ params }: Props) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  try {
    return (
      <>
        <DetailsPage id={id} type="tv" />
        <RelatedGrid id={Number(id)} type="tv" />
      </>
    );
  } catch {
    notFound();
  }
}
