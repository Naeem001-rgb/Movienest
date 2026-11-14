"use client";

import { useEffect, useRef } from "react";

export default function WatchDetailsBorder() {
  const borderRef = useRef<HTMLSpanElement>(null);

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
    <span
      ref={borderRef}
      aria-hidden="true"
      data-running="false"
      className="watch-details-border"
    />
  );
}
