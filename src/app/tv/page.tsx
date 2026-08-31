import type { Metadata } from "next";
import BrowsePage from "@/components/BrowsePage";

export const metadata: Metadata = {
  title: "Popular TV Shows — Movie Nest",
  description: "Browse the most popular TV shows on Movie Nest.",
};

export default async function TvPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.min(Math.max(1, parseInt(pageParam ?? "1", 10) || 1), 500);

  return (
    <BrowsePage
      title="Popular TV Shows"
      endpoint="/tv/popular"
      basePath="/tv"
      page={page}
    />
  );
}
