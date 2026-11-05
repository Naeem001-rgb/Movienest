"use client";
import Link from "next/link";
import { tmdbImage, ROW_POSTER_SIZES } from "@/lib/images";
import { supportsProgress } from "@/lib/player-progress";
import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  formatWatchTime,
  parseWatchHistory,
  watchHistoryHref,
  watchKey,
  type WatchEntry,
} from "@/lib/watch-history";
import {
  deleteWatchEntry,
  getHistorySnapshot,
  getServerHistorySnapshot,
  saveWatchEntry,
  subscribeToWatchHistory,
} from "@/lib/watch-history-store";

export default function ContinueWatching() {
  const snapshot = useSyncExternalStore(
    subscribeToWatchHistory,
    getHistorySnapshot,
    getServerHistorySnapshot,
  );
  const entries = useMemo(() => parseWatchHistory(snapshot), [snapshot]);
  const [removed, setRemoved] = useState<WatchEntry | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  if (entries.length === 0 && !removed) return null;

  const remove = (entry: WatchEntry) => {
    deleteWatchEntry(entry);
    setRemoved(entry);
    headingRef.current?.focus({ preventScroll: true });
  };

  const undo = () => {
    if (!removed) return;
    saveWatchEntry(removed);
    setRemoved(null);
    headingRef.current?.focus({ preventScroll: true });
  };

  return (
    <section className="mb-10" aria-labelledby="continue-watching-heading">
      <div className="mb-4 sm:mb-5">
        <h2
          ref={headingRef}
          id="continue-watching-heading"
          tabIndex={-1}
          className="text-xl font-semibold text-text outline-none sm:text-2xl"
        >
          Continue Watching
        </h2>
        <p className="mt-1 text-xs text-text-secondary sm:text-sm">
          Pick up where you left off. Saved in this browser.
        </p>
      </div>
      {removed ? (
        <div
          className="mb-4 flex flex-wrap items-center gap-x-3 text-sm text-text-secondary"
          role="status"
        >
          <span>Removed {removed.title}.</span>
          <button
            onClick={undo}
            className="min-h-11 rounded px-2 font-semibold text-text underline decoration-accent underline-offset-4 dark:hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
          >
            Undo
          </button>
        </div>
      ) : null}
      {entries.length > 0 ? (
        <ul className="no-scrollbar -mx-4 -mt-3 -mb-1 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pt-6 pb-6 sm:-mx-2 sm:scroll-px-2 sm:px-2">
          {entries.map((entry) => {
            const hasProgress = entry.duration > 0 && entry.position > 0;
            const canResume = hasProgress && supportsProgress(entry.server);
            const episode = entry.type === "tv" ? `S${entry.season} · E${entry.episode}` : "Movie";
            const action = canResume
              ? `Resume at ${formatWatchTime(entry.position)}`
              : "Continue watching";
            return (
              <li
                key={watchKey(entry)}
                className="relative w-[180px] shrink-0 snap-start sm:w-[220px] lg:w-[240px]"
              >
                <Link
                  href={watchHistoryHref(entry)}
                  prefetch={false}
                  aria-label={`${action}: ${entry.title}${entry.type === "tv" ? `, season ${entry.season}, episode ${entry.episode}` : ""}`}
                  className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-surface-2 shadow-[var(--shadow)] transition-transform duration-300 group-hover:-translate-y-1 group-hover:ring-2 group-hover:ring-accent motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
                    {entry.posterPath ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        {...tmdbImage(entry.posterPath, "poster")}
                        sizes={ROW_POSTER_SIZES}
                        width={500}
                        height={750}
                        decoding="async"
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center p-5 text-center text-sm text-text-secondary">
                        {entry.title}
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-black/85 px-3 py-3 text-xs font-semibold text-white">
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5 shrink-0 text-accent"
                        aria-hidden="true"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      <span>
                        {canResume ? `Resume ${formatWatchTime(entry.position)}` : "Continue"}
                      </span>
                    </div>
                    {hasProgress ? (
                      <div
                        role="progressbar"
                        aria-label={`${entry.title} last recorded progress`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round((entry.position / entry.duration) * 100)}
                        aria-valuetext={`${formatWatchTime(entry.position)} of ${formatWatchTime(entry.duration)}`}
                        className="absolute inset-x-0 bottom-0 h-1 bg-white/30"
                      >
                        <div
                          className="h-full bg-accent"
                          style={{ width: `${(entry.position / entry.duration) * 100}%` }}
                        />
                      </div>
                    ) : null}
                  </div>
                  <h3 className="mt-2 truncate text-sm font-medium text-text transition-colors dark:group-hover:text-accent">
                    {entry.title}
                  </h3>
                  <p
                    className="mt-0.5 truncate text-xs text-text-secondary"
                    title={entry.episodeTitle}
                  >
                    {episode}
                    {entry.episodeTitle ? ` · ${entry.episodeTitle}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">
                    {canResume
                      ? `${Math.ceil((entry.duration - entry.position) / 60)} min left`
                      : hasProgress
                        ? `Last saved at ${formatWatchTime(entry.position)}`
                        : "Recently opened"}
                  </p>
                </Link>
                <button
                  type="button"
                  onClick={() => remove(entry)}
                  aria-label={`Remove ${entry.title} from Continue Watching`}
                  title="Remove from Continue Watching"
                  className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-full bg-black/85 text-white transition-colors hover:bg-accent hover:text-accent-contrast focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path d="m6 6 12 12M18 6 6 18" />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
