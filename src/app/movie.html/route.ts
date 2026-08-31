import { NextRequest, NextResponse } from "next/server";

export function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type") === "tv" ? "tv" : "movie";
  if (!id || !/^\d+$/.test(id)) return NextResponse.redirect(new URL("/", req.url));
  return NextResponse.redirect(new URL(`/${type}/${id}`, req.url));
}
