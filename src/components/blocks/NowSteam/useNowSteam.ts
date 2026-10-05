"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { type NowSteam, steamIdle } from "@/lib/steam/types";

const POLL_MS = 60_000;

export function useNowSteam() {
  const [data, setData] = useState<NowSteam | null>(null);
  const inFlight = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;
    try {
      const response = await fetch("/api/now-steam", { cache: "no-store", signal: controller.signal });
      if (!response.ok) throw new Error(`now-steam ${response.status}`);
      const next = (await response.json()) as NowSteam;
      if (!controller.signal.aborted) setData(next);
    } catch {
      if (!controller.signal.aborted) setData((current) => current ?? steamIdle);
    }
  }, []);

  useEffect(() => {
    const loadIfVisible = () => document.hidden || load();
    load();
    const poll = setInterval(loadIfVisible, POLL_MS);
    document.addEventListener("visibilitychange", loadIfVisible);
    return () => {
      clearInterval(poll);
      document.removeEventListener("visibilitychange", loadIfVisible);
      inFlight.current?.abort();
    };
  }, [load]);

  if (!data) return { status: "loading" as const };
  if (data.isPlaying) return { status: "playing" as const, game: data.game };
  return { status: "idle" as const, recent: data.recent };
}
