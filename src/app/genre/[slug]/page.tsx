import { parsePage, type QueryValue } from "@/lib/params";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BrowsePage from "@/components/BrowsePage";
import { genreBySlug } from "@/lib/genres";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const genre = genreBySlug(slug);
  return {
    title: genre
      ? `${genre.name} ${genre.type === "tv" ? "TV Shows" : "Movies"} — Movie Nest`
      : "Genre — Movie Nest",
    description: genre
      ? `Browse ${genre.name} ${genre.type === "tv" ? "TV shows" : "movies"} on Movie Nest.`
      : undefined,
  };
}

export default async function GenrePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: QueryValue }>;
}) {
  const [{ slug }, { page: pageParam }] = await Promise.all([params, searchParams]);
  const genre = genreBySlug(slug);
  if (!genre) notFound();

  const page = parsePage(pageParam);

  return (
    <BrowsePage
      title={`${genre.name} ${genre.type === "tv" ? "TV Shows" : "Movies"}`}
      endpoint={`/discover/${genre.type}`}
      extraParams={{ with_genres: String(genre.id) }}
      basePath={`/genre/${genre.slug}`}
      page={page}
    />
  );
}
