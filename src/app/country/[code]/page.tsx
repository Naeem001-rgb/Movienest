import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BrowsePage from "@/components/BrowsePage";
import { countryByCode } from "@/lib/genres";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const country = countryByCode(code);
  return {
    title: country ? `${country.name} Movies — Movie Nest` : "Country — Movie Nest",
    description: country ? `Browse movies from ${country.name} on Movie Nest.` : undefined,
  };
}

export default async function CountryPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ code }, { page: pageParam }] = await Promise.all([params, searchParams]);
  const country = countryByCode(code);
  if (!country) notFound();

  const page = Math.min(Math.max(1, parseInt(pageParam ?? "1", 10) || 1), 500);

  return (
    <BrowsePage
      title={`${country.name} Movies`}
      endpoint="/discover/movie"
      extraParams={{ with_origin_country: country.code }}
      basePath={`/country/${country.code.toLowerCase()}`}
      page={page}
    />
  );
}
