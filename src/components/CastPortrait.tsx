"use client";

import { useState } from "react";
import { tmdbImage } from "@/lib/images";

export default function CastPortrait({
  name,
  profilePath,
}: {
  name: string;
  profilePath?: string | null;
}) {
  const [failedPath, setFailedPath] = useState<string | null>(null);
  const parts = name.trim().split(/\s+/);
  const initials = [parts[0]?.[0], parts.length > 1 ? parts.at(-1)?.[0] : ""]
    .join("")
    .toUpperCase();

  return (
    <span
      aria-hidden="true"
      className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2 ring-1 ring-border"
    >
      <span className="text-sm font-semibold text-text-secondary">{initials}</span>
      {profilePath && failedPath !== profilePath ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          {...tmdbImage(profilePath, "profile")}
          width={48}
          height={48}
          sizes="48px"
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailedPath(profilePath)}
          className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
        />
      ) : null}
    </span>
  );
}
