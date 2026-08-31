export interface Genre {
  slug: string;
  name: string;
  id: number;
}

// Movie genres (TMDB genre IDs) — from the original site's GENRE dropdown.
const MOVIE_GENRES: Genre[] = [
  { slug: "action", name: "Action", id: 28 },
  { slug: "adventure", name: "Adventure", id: 12 },
  { slug: "animation", name: "Animation", id: 16 },
  { slug: "comedy", name: "Comedy", id: 35 },
  { slug: "crime", name: "Crime", id: 80 },
  { slug: "documentary", name: "Documentary", id: 99 },
  { slug: "drama", name: "Drama", id: 18 },
  { slug: "family", name: "Family", id: 10751 },
  { slug: "fantasy", name: "Fantasy", id: 14 },
  { slug: "history", name: "History", id: 36 },
  { slug: "horror", name: "Horror", id: 27 },
  { slug: "music", name: "Music", id: 10402 },
  { slug: "mystery", name: "Mystery", id: 9648 },
  { slug: "romance", name: "Romance", id: 10749 },
  { slug: "sci-fi", name: "Sci-Fi & Fantasy", id: 878 },
  { slug: "thriller", name: "Thriller", id: 53 },
  { slug: "war", name: "War", id: 10752 },
  { slug: "western", name: "Western", id: 37 },
];

// TV genres (TMDB genre IDs) — also offered by the original dropdown.
const TV_GENRES: Genre[] = [
  { slug: "kids", name: "Kids", id: 10762 },
  { slug: "news", name: "News", id: 10763 },
  { slug: "reality", name: "Reality", id: 10764 },
  { slug: "soap", name: "Soap", id: 10766 },
  { slug: "talk", name: "Talk", id: 10767 },
];

export const GENRES: Genre[] = [...MOVIE_GENRES, ...TV_GENRES];

export function genreBySlug(slug: string): Genre | undefined {
  return GENRES.find((g) => g.slug === slug);
}

// Countries offered by the original COUNTRIES dropdown (ISO 3166-1 codes).
export const COUNTRIES: { code: string; name: string }[] = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "IN", name: "India" },
  { code: "KR", name: "South Korea" },
  { code: "JP", name: "Japan" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "CN", name: "China" },
  { code: "MX", name: "Mexico" },
  { code: "BR", name: "Brazil" },
  { code: "NG", name: "Nigeria" },
  { code: "TR", name: "Turkey" },
  { code: "TH", name: "Thailand" },
  { code: "PH", name: "Philippines" },
];

export function countryByCode(code: string): { code: string; name: string } | undefined {
  const upper = code.toUpperCase();
  return COUNTRIES.find((c) => c.code === upper);
}
