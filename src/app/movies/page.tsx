import type { Metadata } from "next";
import BrowsePage from "@/components/BrowsePage";

export const metadata: Metadata = {
  title: "Popular Movies — Movie Nest",
  description: "Browse the most popular movies on Movie Nest.",
};

export default async function MoviesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.min(Math.max(1, parseInt(pageParam ?? "1", 10) || 1), 500);

  return (
    <BrowsePage
      title="Popular Movies"
      endpoint="/movie/popular"
      basePath="/movies"
      page={page}
    />
  );
}
