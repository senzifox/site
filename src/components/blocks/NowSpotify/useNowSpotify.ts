"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { type NowSpotify, spotifyIdle } from "@/lib/spotify/types";

const POLL_MS = 15_000;
const TICK_MS = 1_000;
const TRACK_END_GRACE_MS = 1_500;

type Snapshot = { data: NowSpotify; receivedAt: number };

export function useNowSpotify() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const inFlight = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;
    try {
      const response = await fetch("/api/now-spotify", { cache: "no-store", signal: controller.signal });
      if (!response.ok) throw new Error(`now-spotify ${response.status}`);
      const data = (await response.json()) as NowSpotify;
      if (controller.signal.aborted) return;
      setSnapshot({ data, receivedAt: Date.now() });
    } catch {
      if (controller.signal.aborted) return;
      setSnapshot((current) => current ?? { data: spotifyIdle, receivedAt: Date.now() });
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

  const track = snapshot?.data.isPlaying ? snapshot.data : null;

  useEffect(() => {
    if (!track || !snapshot) return;
    setNow(Date.now());
    const tick = setInterval(() => setNow(Date.now()), TICK_MS);
    const remaining = track.durationMs - track.progressMs - (Date.now() - snapshot.receivedAt);
    const atEnd =
      remaining > 0 ? setTimeout(() => document.hidden || load(), remaining + TRACK_END_GRACE_MS) : undefined;
    return () => {
      clearInterval(tick);
      clearTimeout(atEnd);
    };
  }, [track, snapshot, load]);

  if (!snapshot) return { status: "loading" as const };
  if (!track) return { status: "idle" as const };

  const progressMs = Math.min(track.durationMs, track.progressMs + Math.max(0, now - snapshot.receivedAt));
  return { status: "playing" as const, track, progressMs };
}
