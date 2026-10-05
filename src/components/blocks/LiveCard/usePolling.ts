"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type Snapshot<T> = { data: T; receivedAt: number };

export function usePolling<T>(url: string, intervalMs: number, fallback: T) {
  const [snapshot, setSnapshot] = useState<Snapshot<T> | null>(null);
  const inFlight = useRef<AbortController | null>(null);

  const reload = useCallback(async () => {
    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;
    try {
      const response = await fetch(url, { cache: "no-store", signal: controller.signal });
      if (!response.ok) throw new Error(`${url} ${response.status}`);
      const data = (await response.json()) as T;
      if (!controller.signal.aborted) setSnapshot({ data, receivedAt: Date.now() });
    } catch {
      if (!controller.signal.aborted)
        setSnapshot((current) => current ?? { data: fallback, receivedAt: Date.now() });
    }
  }, [url, fallback]);

  useEffect(() => {
    const reloadIfVisible = () => document.hidden || reload();
    reload();
    const poll = setInterval(reloadIfVisible, intervalMs);
    document.addEventListener("visibilitychange", reloadIfVisible);
    return () => {
      clearInterval(poll);
      document.removeEventListener("visibilitychange", reloadIfVisible);
      inFlight.current?.abort();
    };
  }, [reload, intervalMs]);

  return { snapshot, reload };
}
