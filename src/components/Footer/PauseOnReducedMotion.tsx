"use client";

import { type ReactNode, useEffect, useRef } from "react";

export function PauseOnReducedMotion({ className, children }: { className?: string; children: ReactNode }) {
  const root = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const svg = root.current?.querySelector("svg");
    if (!svg) return;
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (query.matches) {
        svg.pauseAnimations();
        svg.setCurrentTime(0);
      } else {
        svg.unpauseAnimations();
      }
    };
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return (
    <span ref={root} className={className}>
      {children}
    </span>
  );
}
