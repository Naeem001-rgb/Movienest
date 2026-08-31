"use client";
import { useEffect, useState } from "react";
import { SERVERS, buildEmbedUrl, type ServerId } from "@/lib/embed";
import type { MediaType } from "@/lib/types";

const SERVER_STORAGE_KEY = "server";

export default function Player({
  id,
  type,
  season,
  episode,
}: {
  id: number;
  type: MediaType;
  season?: number;
  episode?: number;
}) {
  const [server, setServer] = useState<ServerId>("videasy");
  const [mounted, setMounted] = useState(false);

  // Restore the visitor's preferred server.
  useEffect(() => {
    const stored = localStorage.getItem(SERVER_STORAGE_KEY) as ServerId | null;
    if (stored && SERVERS.some((s) => s.id === stored)) setServer(stored);
    setMounted(true);
  }, []);

  const switchServer = (next: ServerId) => {
    setServer(next);
    localStorage.setItem(SERVER_STORAGE_KEY, next);
  };

  const src = buildEmbedUrl(server, { id, type, season, episode });

  return (
    <div>
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-black shadow-[var(--shadow)]">
        {mounted ? (
          <iframe
            key={src}
            src={src}
            title="Video player"
            allowFullScreen
            referrerPolicy="origin"
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-text-secondary">
            Loading player…
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-semibold text-text-secondary">Servers:</span>
        {SERVERS.map((s) => (
          <button
            key={s.id}
            onClick={() => switchServer(s.id)}
            aria-pressed={server === s.id}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              server === s.id
                ? "bg-accent text-accent-contrast"
                : "border border-border text-text-secondary hover:border-accent hover:text-accent"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}
