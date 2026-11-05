"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { SERVERS, buildEmbedUrl, type ServerId } from "@/lib/embed";
import { parsePlayerProgress, supportsProgress } from "@/lib/player-progress";
import {
  isFinished,
  sameEpisode,
  watchKey,
  type WatchEntry,
  type WatchMedia,
} from "@/lib/watch-history";
import {
  deleteWatchEntry,
  readWatchHistory,
  saveWatchEntry,
  subscribeToWatchHistory,
} from "@/lib/watch-history-store";

const SERVER_STORAGE_KEY = "server";
const subscribeToHydration = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export default function Player({ media }: { media: WatchMedia }) {
  const ready = useSyncExternalStore(subscribeToHydration, clientReady, serverReady);
  // Restore the server and timestamp before mounting an iframe, so an initial
  // player at zero cannot start playing or overwrite the saved checkpoint.
  return ready ? (
    <PlayerSession key={`${watchKey(media)}:${media.season}:${media.episode}`} media={media} />
  ) : (
    <div
      className="flex aspect-video w-full items-center justify-center rounded-xl border border-border bg-black text-sm text-white/70"
      role="status"
    >
      Loading player…
    </div>
  );
}

function initialSelection(media: WatchMedia) {
  const saved = readWatchHistory().find((entry) => sameEpisode(entry, media));
  let server: ServerId = saved?.server ?? "videasy";
  if (!saved) {
    try {
      const preferred = localStorage.getItem(SERVER_STORAGE_KEY);
      server = SERVERS.find((s) => s.id === preferred)?.id ?? "videasy";
    } catch {
      /* Playback works with storage disabled. */
    }
  }
  return { server, startAt: saved?.position ?? 0 };
}

function PlayerSession({ media }: { media: WatchMedia }) {
  const [selection, setSelection] = useState(() => initialSelection(media));
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const flushRef = useRef(() => {});
  const { server } = selection;
  const src = buildEmbedUrl(server, { ...media, startAt: selection.startAt });

  useEffect(() => {
    if (media.type === "tv" && (media.season == null || media.episode == null)) return;
    const previous = readWatchHistory().find((entry) => sameEpisode(entry, media));
    let entry: WatchEntry = {
      ...media,
      server,
      position: supportsProgress(server) ? (previous?.position ?? 0) : 0,
      duration: supportsProgress(server) ? (previous?.duration ?? 0) : 0,
      updatedAt: Date.now(),
    };
    // A bookmark still works when a provider cannot report its playback position.
    saveWatchEntry(entry);
    let stopped = false;
    let pending = false;
    let lastSaved = 0;

    const flush = () => {
      if (!pending || stopped) return;
      pending = false;
      saveWatchEntry(entry);
      lastSaved = Date.now();
    };
    flushRef.current = flush;
    const onMessage = (event: MessageEvent) => {
      if (stopped || event.source !== iframeRef.current?.contentWindow) return;
      const progress = parsePlayerProgress(server, event.origin, event.data, media);
      if (!progress || (progress.position === 0 && !progress.ended)) return;
      entry = {
        ...entry,
        position: progress.position,
        duration: progress.duration,
        updatedAt: Date.now(),
      };
      if (progress.ended || isFinished(progress.position, progress.duration)) {
        stopped = true;
        pending = false;
        deleteWatchEntry(media);
        return;
      }
      pending = true;
      if (Date.now() - lastSaved >= 5000) flush();
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    // Removing a title in another tab must not be undone by this open player.
    const unsubscribe = subscribeToWatchHistory(() => {
      const current = readWatchHistory().find((item) => watchKey(item) === watchKey(media));
      if (!current || !sameEpisode(current, media)) {
        stopped = true;
        pending = false;
      }
    });
    window.addEventListener("message", onMessage);
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      flush();
      flushRef.current = () => {};
      unsubscribe();
      window.removeEventListener("message", onMessage);
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [media, server]);

  const switchServer = (next: ServerId) => {
    if (next === server) return;
    flushRef.current();
    const saved = readWatchHistory().find((entry) => sameEpisode(entry, media));
    setSelection({ server: next, startAt: saved?.position ?? 0 });
    try {
      localStorage.setItem(SERVER_STORAGE_KEY, next);
    } catch {
      /* Optional preference. */
    }
  };

  return (
    <div>
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-black shadow-[var(--shadow)]">
        <iframe
          ref={iframeRef}
          key={src}
          src={src}
          title={`Watch ${media.title}`}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          referrerPolicy="origin"
          className="absolute inset-0 h-full w-full"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-semibold text-text-secondary">Servers:</span>
        {SERVERS.map((s) => (
          <button
            key={s.id}
            onClick={() => switchServer(s.id)}
            aria-pressed={server === s.id}
            className={`min-h-11 rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              server === s.id
                ? "bg-accent text-accent-contrast"
                : "border border-border text-text-secondary hover:border-accent hover:text-accent"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>
      {!supportsProgress(server) ? (
        <p className="mt-3 text-xs leading-relaxed text-text-secondary">
          This server saves the title and episode only. Choose Videasy or VidFast to resume at your
          saved time when available.
        </p>
      ) : null}
    </div>
  );
}
