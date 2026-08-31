import { NextRequest, NextResponse } from "next/server";

export function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type") === "tv" ? "tv" : "movie";
  if (!id || !/^\d+$/.test(id)) return NextResponse.redirect(new URL("/", req.url));

  const target = new URL(`/watch/${type}/${id}`, req.url);
  const season = searchParams.get("season");
  const episode = searchParams.get("episode");
  if (season && /^\d+$/.test(season)) target.searchParams.set("season", season);
  if (episode && /^\d+$/.test(episode)) target.searchParams.set("episode", episode);

  return NextResponse.redirect(target);
}
