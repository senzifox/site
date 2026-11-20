"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { pageViewUrl, SKIP_KEY, SKIP_TOGGLE_HASH } from "@/lib/stats/pageView";

type PrivacyNavigator = Navigator & { globalPrivacyControl?: boolean };

const readSkip = () => {
  try {
    return localStorage.getItem(SKIP_KEY) === "t";
  } catch {
    return false;
  }
};

const toggleSkip = () => {
  try {
    const skip = !readSkip();
    if (skip) localStorage.setItem(SKIP_KEY, "t");
    else localStorage.removeItem(SKIP_KEY);
    alert(skip ? "stats: this browser is not counted" : "stats: this browser is counted again");
  } catch {}
};

const optedOut = () => {
  const nav = navigator as PrivacyNavigator;
  return nav.doNotTrack === "1" || nav.globalPrivacyControl === true || nav.webdriver || readSkip();
};

const whenVisible = (send: () => void) => {
  if (document.visibilityState === "visible") {
    send();
    return () => {};
  }
  const onChange = () => {
    if (document.visibilityState !== "visible") return;
    document.removeEventListener("visibilitychange", onChange);
    send();
  };
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
};

const sendPageView = (path: string, referrer: string, query: string) => {
  const url = pageViewUrl(
    { path, title: document.title, referrer, query, width: screen.width },
    Math.random().toString(36).slice(2, 7),
  );
  if (!navigator.sendBeacon?.(url)) void fetch(url, { keepalive: true }).catch(() => {});
};

export function PageViews() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    const initial = first.current;
    first.current = false;
    if (process.env.NODE_ENV !== "production") return;
    if (initial && location.hash === SKIP_TOGGLE_HASH) toggleSkip();
    if (optedOut()) return;
    const referrer = initial ? document.referrer : "";
    const query = initial ? location.search : "";
    let frame = 0;
    const stopWaiting = whenVisible(() => {
      frame = requestAnimationFrame(() => sendPageView(pathname, referrer, query));
    });
    return () => {
      stopWaiting();
      cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return null;
}
