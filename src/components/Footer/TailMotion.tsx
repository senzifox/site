"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { registerAction, tuning } from "@/lib/tuning";

export function TailMotion({ className, children }: { className?: string; children: ReactNode }) {
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
    const release = registerAction("tail.tempo", () => {
      for (const animate of svg.querySelectorAll("animate"))
        animate.setAttribute("dur", `${tuning.tail.seconds}s`);
    });
    return () => {
      query.removeEventListener("change", sync);
      release();
    };
  }, []);

  return (
    <span ref={root} className={className}>
      {children}
    </span>
  );
}
