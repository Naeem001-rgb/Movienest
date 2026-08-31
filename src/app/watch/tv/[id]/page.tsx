import type { Metadata } from "next";
import { notFound } from "next/navigation";
import WatchPage from "@/components/WatchPage";
import { tmdbFetch } from "@/lib/tmdb";
import { titleOf } from "@/lib/servers";
import type { MediaDetails } from "@/lib/types";

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
  try {
    return <WatchPage id={id} type="tv" searchParams={sp} />;
  } catch {
    notFound();
  }
}
