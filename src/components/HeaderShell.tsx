"use client";

import { useEffect, useRef, type ReactNode } from "react";

export default function HeaderShell({ children }: { children: ReactNode }) {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    let previousY = window.scrollY;
    let hidden = false;
    let frame = 0;

    const update = () => {
      frame = 0;
      const currentY = Math.max(0, window.scrollY);
      if (Math.abs(currentY - previousY) < 5) return;
      const nextHidden =
        currentY > 100 && currentY > previousY && !header.contains(document.activeElement);
      if (hidden !== nextHidden) {
        hidden = nextHidden;
        header.style.transform = hidden ? "translateY(-100%)" : "translateY(0)";
        header.style.opacity = hidden ? "0" : "1";
      }
      previousY = currentY;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onFocus = () => {
      hidden = false;
      header.style.transform = "translateY(0)";
      header.style.opacity = "1";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    header.addEventListener("focusin", onFocus);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      header.removeEventListener("focusin", onFocus);
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg transition duration-300 motion-reduce:transition-none"
    >
      {children}
    </header>
  );
}
