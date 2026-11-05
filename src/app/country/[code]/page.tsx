import { parsePage, type QueryValue } from "@/lib/params";
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
  searchParams: Promise<{ page?: QueryValue }>;
}) {
  const [{ code }, { page: pageParam }] = await Promise.all([params, searchParams]);
  const country = countryByCode(code);
  if (!country) notFound();

  const page = parsePage(pageParam);

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
