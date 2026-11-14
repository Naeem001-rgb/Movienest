"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import AmbientPlayer from "@/components/AmbientPlayer";
import { SERVERS, buildEmbedUrl, type ServerId } from "@/lib/embed";
import { parsePlayerProgress, supportsProgress } from "@/lib/player-progress";
import {
  createWatchEntry,
  formatWatchTime,
  isFinished,
  parseWatchHistory,
  resumeServerFor,
  sameEpisode,
  watchKey,
  type WatchEntry,
  type WatchMedia,
} from "@/lib/watch-history";
import {
  deleteWatchEntry,
  getHistorySnapshot,
  getServerHistorySnapshot,
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
  let server: ServerId = saved?.server ?? "vidfast";
  if (!saved) {
    try {
      const preferred = localStorage.getItem(SERVER_STORAGE_KEY);
      server = SERVERS.find((s) => s.id === preferred)?.id ?? "vidfast";
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
  const snapshot = useSyncExternalStore(
    subscribeToWatchHistory,
    getHistorySnapshot,
    getServerHistorySnapshot,
  );
  const checkpoint = parseWatchHistory(snapshot).find((entry) => sameEpisode(entry, media));
  const resumeServer = checkpoint ? resumeServerFor(checkpoint) : "vidfast";
  const resumeServerName = SERVERS.find((item) => item.id === resumeServer)?.name;

  useEffect(() => {
    if (media.type === "tv" && (media.season == null || media.episode == null)) return;
    const previous = readWatchHistory().find((entry) => sameEpisode(entry, media));
    let entry: WatchEntry = createWatchEntry(media, server, previous);
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
        progressServer: server,
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
      <AmbientPlayer
        controls={
          <div
            role="group"
            aria-label="Playback providers"
            className="flex flex-wrap items-center gap-2"
          >
            {SERVERS.map((s) => (
              <button
                key={s.id}
                onClick={() => switchServer(s.id)}
                aria-pressed={server === s.id}
                className={`min-h-11 rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  server === s.id
                    ? "bg-accent text-accent-contrast"
                    : "border border-border bg-background text-text-secondary hover:border-accent hover:text-accent"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        }
      >
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
      </AmbientPlayer>
      {!supportsProgress(server) ? (
        <div className="mt-3 text-sm text-text-secondary">
          {checkpoint && checkpoint.position > 0 ? (
            <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>
                Last saved position:{" "}
                <span className="font-medium tabular-nums text-text">
                  {formatWatchTime(checkpoint.position)}
                </span>
              </span>
              <button
                type="button"
                onClick={() => switchServer(resumeServer)}
                className="min-h-11 rounded-full border border-border px-4 py-2 font-semibold text-text transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Resume on {resumeServerName}
              </button>
            </div>
          ) : null}
          <details>
            <summary className="w-fit cursor-pointer rounded py-2 underline-offset-4 hover:text-text hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
              About Continue Watching
            </summary>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed">
              Movie Nest remembers your {media.type === "tv" ? "show and episode" : "movie"} in this
              browser. {SERVERS.find((item) => item.id === server)?.name} doesn’t share playback
              time with Movie Nest, so automatic time tracking is unavailable on this server.
              {checkpoint && checkpoint.position > 0
                ? " Your last recorded position is kept when you switch servers."
                : ""}
            </p>
          </details>
        </div>
      ) : null}
    </div>
  );
}
