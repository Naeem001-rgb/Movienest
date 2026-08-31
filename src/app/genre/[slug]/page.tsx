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
    title: genre ? `${genre.name} Movies — Movie Nest` : "Genre — Movie Nest",
    description: genre ? `Browse ${genre.name} movies on Movie Nest.` : undefined,
  };
}

export default async function GenrePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ slug }, { page: pageParam }] = await Promise.all([params, searchParams]);
  const genre = genreBySlug(slug);
  if (!genre) notFound();

  const page = Math.min(Math.max(1, parseInt(pageParam ?? "1", 10) || 1), 500);

  return (
    <BrowsePage
      title={`${genre.name} Movies`}
      endpoint="/discover/movie"
      extraParams={{ with_genres: String(genre.id) }}
      basePath={`/genre/${genre.slug}`}
      page={page}
    />
  );
}
