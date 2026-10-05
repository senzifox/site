"use client";

import { steamIdle } from "@/lib/steam/types";
import { usePolling } from "../LiveCard/usePolling";

const POLL_MS = 60_000;

export function useSteam() {
  const { snapshot } = usePolling("/api/steam", POLL_MS, steamIdle);
  if (!snapshot) return { status: "loading" as const };
  const { data } = snapshot;
  if (data.isPlaying) return { status: "playing" as const, game: data.game };
  return { status: "idle" as const, recent: data.recent };
}
