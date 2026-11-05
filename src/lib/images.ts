// TMDB's CDN already resizes these images. Keep image helpers safe to import
// in the browser, separate from the private, server-only catalog client.
const IMAGE_BASE = "https://image.tmdb.org/t/p";
const WIDTHS = {
  poster: [185, 342, 500, 780],
  backdrop: [300, 780, 1280],
  still: [185, 300, 780],
} as const;

export const ROW_POSTER_SIZES = "(min-width: 1024px) 240px, (min-width: 640px) 220px, 180px";
export const GRID_POSTER_SIZES =
  "(min-width: 1280px) 234px, (min-width: 1024px) calc((100vw - 96px) / 4), (min-width: 640px) calc((100vw - 80px) / 3), calc((100vw - 48px) / 2)";

export function tmdbImage(path: string, kind: keyof typeof WIDTHS) {
  const widths = WIDTHS[kind];
  return {
    src: `${IMAGE_BASE}/w${kind === "poster" ? 500 : widths[widths.length - 1]}${path}`,
    srcSet: widths.map((width) => `${IMAGE_BASE}/w${width}${path} ${width}w`).join(", "),
  };
}
