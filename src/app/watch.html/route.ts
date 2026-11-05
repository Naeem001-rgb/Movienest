import { isMediaId, parseInteger } from "@/lib/params";
import { NextRequest, NextResponse } from "next/server";

export function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type") === "tv" ? "tv" : "movie";
  if (!isMediaId(id)) return NextResponse.redirect(new URL("/", req.url));

  const target = new URL(`/watch/${type}/${id}`, req.url);
  const season = parseInteger(searchParams.get("season") ?? undefined);
  const episode = parseInteger(searchParams.get("episode") ?? undefined);
  if (type === "tv" && season != null) target.searchParams.set("season", String(season));
  if (type === "tv" && episode != null && episode > 0)
    target.searchParams.set("episode", String(episode));

  return NextResponse.redirect(target);
}
