"use client";

import { useEffect, useState } from "react";
import type { Lang } from "@/content/types";
import { formatAgo, formatDateTime } from "@/lib/format";

const TICK_MS = 60_000;

type Props = { time: string; timeZone: string; lang: Lang };

export function BuildTime({ time, timeZone, lang }: Props) {
  const [shown, setShown] = useState(() => {
    const exact = formatDateTime(timeZone, new Date(time), lang);
    return { text: exact, title: exact };
  });

  useEffect(() => {
    const visitorZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const title = formatDateTime(visitorZone, new Date(time), lang);
    const update = () => setShown({ text: formatAgo(time, new Date(), lang), title });
    update();
    const timer = setInterval(update, TICK_MS);
    return () => clearInterval(timer);
  }, [time, lang]);

  return (
    <time dateTime={time} title={shown.title}>
      {shown.text}
    </time>
  );
}
