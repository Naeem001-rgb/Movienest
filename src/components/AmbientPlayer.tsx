"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const STORAGE_KEY = "movienest:ambient-light";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function readPreference() {
  let choice: boolean | null = null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "on" || saved === "off") choice = saved === "on";
  } catch {
    // The switch still works when browser storage is unavailable.
  }
  return { choice, reducedMotion: window.matchMedia(REDUCED_MOTION).matches };
}

export default function AmbientPlayer({
  children,
  controls,
}: {
  children: ReactNode;
  controls: ReactNode;
}) {
  // Player mounts this after hydration, so the saved choice applies immediately.
  const [preference, setPreference] = useState(readPreference);
  const enabled = preference.choice ?? !preference.reducedMotion;
  const viewportRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const motion = window.matchMedia(REDUCED_MOTION);
    const onPreference = () =>
      setPreference((current) => ({ ...current, reducedMotion: motion.matches }));
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) {
        const saved = event.key === null ? null : event.newValue;
        setPreference({
          choice: saved === "on" || saved === "off" ? saved === "on" : null,
          reducedMotion: motion.matches,
        });
      }
    };
    motion.addEventListener("change", onPreference);
    window.addEventListener("storage", onStorage);
    return () => {
      motion.removeEventListener("change", onPreference);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    const light = lightRef.current;
    if (!enabled || !viewport || !light) return;
    if (
      !CSS.supports("backdrop-filter", "blur(1px)") &&
      !CSS.supports("-webkit-backdrop-filter", "blur(1px)")
    )
      return;

    let inView = false;
    const update = () => {
      light.dataset.active = String(
        inView &&
          document.visibilityState === "visible" &&
          !document.fullscreenElement &&
          document.documentElement.classList.contains("dark"),
      );
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    });
    observer.observe(viewport);
    const themeObserver = new MutationObserver(update);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    document.addEventListener("visibilitychange", update);
    document.addEventListener("fullscreenchange", update);
    return () => {
      light.dataset.active = "false";
      observer.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", update);
      document.removeEventListener("fullscreenchange", update);
    };
  }, [enabled]);

  const toggle = () => {
    const next = !enabled;
    setPreference((current) => ({ ...current, choice: next }));
    try {
      localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
    } catch {
      // Persistence is optional; playback and the current choice still work.
    }
  };

  return (
    <>
      <div ref={viewportRef} className="player-viewport">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-black shadow-[var(--shadow)]">
          {children}
        </div>
        <div ref={lightRef} className="player-ambient" data-active="false" aria-hidden="true" />
      </div>
      <div className="relative mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        {controls}
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={toggle}
          title="Ambient light appears in dark mode"
          className="ambient-light-control ml-auto min-h-11 items-center gap-3 rounded-full border border-text-secondary/75 bg-background px-3 py-2 text-xs font-medium text-text-secondary transition-colors hover:bg-surface hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Ambient light
          <span className="text-[0.625rem] dark:hidden">Dark mode only</span>
          <span
            aria-hidden="true"
            className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${enabled ? "bg-accent" : "bg-surface-2 ring-1 ring-border"}`}
          >
            <span
              className={`absolute left-[3px] top-[3px] h-3.5 w-3.5 rounded-full transition-transform motion-reduce:transition-none ${enabled ? "translate-x-4 bg-accent-contrast" : "bg-text-secondary"}`}
            />
          </span>
        </button>
      </div>
    </>
  );
}
