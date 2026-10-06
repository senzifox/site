"use client";

import { useEffect } from "react";
import { pointer, subscribePointer } from "@/lib/pointer";
import { cardClass } from "./Card";

export function CardGlow() {
  useEffect(() => {
    const cards = document.getElementsByClassName(cardClass);
    return subscribePointer(() => {
      const list = [...cards] as HTMLElement[];
      const rects = list.map((card) => card.getBoundingClientRect());
      for (const [i, card] of list.entries()) {
        card.style.setProperty("--glow-on", pointer.active ? "1" : "0");
        if (!pointer.active) continue;
        card.style.setProperty("--glow-x", `${pointer.x - rects[i].left}px`);
        card.style.setProperty("--glow-y", `${pointer.y - rects[i].top}px`);
      }
    });
  }, []);

  return null;
}
