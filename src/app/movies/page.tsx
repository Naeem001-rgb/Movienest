import { parsePage, type QueryValue } from "@/lib/params";
import type { Metadata } from "next";
import BrowsePage from "@/components/BrowsePage";

export const metadata: Metadata = {
  title: "Popular Movies — Movie Nest",
  description: "Browse the most popular movies on Movie Nest.",
};

export default async function MoviesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: QueryValue }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = parsePage(pageParam);

  return (
    <BrowsePage title="Popular Movies" endpoint="/movie/popular" basePath="/movies" page={page} />
  );
}
