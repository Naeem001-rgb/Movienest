"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function SeasonPicker({
  showId,
  seasons,
  currentSeason,
}: {
  showId: number;
  seasons: { season_number: number; name: string }[];
  currentSeason: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const change = (season: number) => {
    setOpen(false);
    router.push(`/watch/tv/${showId}?season=${season}&episode=1`);
  };

  const idx = seasons.findIndex((s) => s.season_number === currentSeason);
  const current = seasons[idx];
  const hasPrev = idx > 0;
  const hasNext = idx >= 0 && idx < seasons.length - 1;

  // Close the menu on outside click or Esc.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const arrowBtn =
    "flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text transition enabled:hover:border-accent enabled:hover:text-accent disabled:cursor-not-allowed disabled:opacity-30";

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Previous season"
        disabled={!hasPrev}
        onClick={() => change(seasons[idx - 1].season_number)}
        className={arrowBtn}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      <div ref={rootRef} className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm font-semibold text-text transition hover:border-accent"
        >
          {current?.name ?? `Season ${currentSeason}`}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 text-text-secondary transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {open ? (
          <ul
            role="listbox"
            className="no-scrollbar absolute right-0 top-full z-30 mt-2 max-h-72 w-44 overflow-y-auto rounded-xl border border-border bg-surface p-1.5 shadow-[var(--shadow)]"
          >
            {seasons.map((s) => {
              const active = s.season_number === currentSeason;
              return (
                <li key={s.season_number}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => change(s.season_number)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                      active
                        ? "bg-accent/15 font-semibold text-accent"
                        : "text-text-secondary hover:bg-surface-2 hover:text-text"
                    }`}
                  >
                    {s.name}
                    {active ? <span aria-hidden="true">✓</span> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      <button
        type="button"
        aria-label="Next season"
        disabled={!hasNext}
        onClick={() => change(seasons[idx + 1].season_number)}
        className={arrowBtn}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
