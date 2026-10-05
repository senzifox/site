"use client";

import { useEffect, useState } from "react";
import { advance, spotifyIdle } from "@/lib/spotify/types";
import { usePolling } from "../LiveCard/usePolling";

const POLL_MS = 15_000;
const TICK_MS = 1_000;
const TRACK_END_GRACE_MS = 1_500;

export function useSpotify() {
  const { snapshot, reload } = usePolling("/api/spotify", POLL_MS, spotifyIdle);
  const [now, setNow] = useState(() => Date.now());
  const playing = snapshot?.data.isPlaying ? snapshot : null;

  useEffect(() => {
    if (!playing?.data.isPlaying) return;
    const track = playing.data;
    setNow(Date.now());
    const tick = setInterval(() => document.hidden || setNow(Date.now()), TICK_MS);
    const remaining = track.durationMs - track.progressMs - (Date.now() - playing.receivedAt);
    const atEnd =
      remaining > 0
        ? setTimeout(() => document.hidden || reload(), remaining + TRACK_END_GRACE_MS)
        : undefined;
    return () => {
      clearInterval(tick);
      clearTimeout(atEnd);
    };
  }, [playing, reload]);

  if (!snapshot) return { status: "loading" as const };
  const track = advance(snapshot.data, now - snapshot.receivedAt);
  if (!track.isPlaying) return { status: "idle" as const };
  return { status: "playing" as const, track };
}
