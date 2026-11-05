import "server-only";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://movie-nest-application.vercel.app"
).replace(/\/+$/, "");
