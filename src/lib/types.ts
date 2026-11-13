export type MediaType = "movie" | "tv";

export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
  overview?: string;
}

export interface CastMember {
  id: number;
  name: string;
  character?: string;
  profile_path?: string | null;
}

export interface MediaDetails extends MediaItem {
  genres?: { id: number; name: string }[];
  credits?: { cast: CastMember[] };
  production_countries?: { name: string }[];
  production_companies?: { name: string }[];
  seasons?: { season_number: number; name: string }[];
  runtime?: number;
  number_of_seasons?: number;
  tagline?: string;
}

export interface EpisodeItem {
  episode_number: number;
  name: string;
  overview?: string;
  still_path?: string | null;
  air_date?: string;
}

export interface Paged<T> {
  page: number;
  total_pages: number;
  results: T[];
}
