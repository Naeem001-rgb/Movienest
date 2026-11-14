"use client";

import { useEffect, useRef, type CSSProperties } from "react";

const STRIP_COLORS = [
  "var(--watch-border-red)",
  "var(--accent-bright)",
  "var(--watch-border-green)",
  "#2dbfc4",
  "var(--watch-border-blue)",
  "#bd6bea",
];

export default function WatchDetailsBorder() {
  const borderRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const border = borderRef.current;
    if (!border) return;

    let inView = false;
    const update = () => {
      border.dataset.running = String(inView && document.visibilityState === "visible");
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    });

    observer.observe(border);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return (
    <svg
      ref={borderRef}
      aria-hidden="true"
      focusable="false"
      data-running="false"
      className="watch-details-border"
    >
      <rect className="watch-border-track" />
      {STRIP_COLORS.map((color, index) => (
        <rect
          key={color}
          pathLength={100}
          className="watch-border-strip"
          stroke={color}
          style={
            {
              "--strip-offset": `${-index * 2.5}px`,
              opacity: 1 - index * 0.1,
            } as CSSProperties
          }
        />
      ))}
    </svg>
  );
}
