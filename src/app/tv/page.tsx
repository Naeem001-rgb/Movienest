import { parsePage, type QueryValue } from "@/lib/params";
import type { Metadata } from "next";
import BrowsePage from "@/components/BrowsePage";

export const metadata: Metadata = {
  title: "Popular TV Shows — Movie Nest",
  description: "Browse the most popular TV shows on Movie Nest.",
};

export default async function TvPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: QueryValue }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = parsePage(pageParam);

  return <BrowsePage title="Popular TV Shows" endpoint="/tv/popular" basePath="/tv" page={page} />;
}
