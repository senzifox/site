"use client";

import { useEffect, useState } from "react";
import { formatAgo, formatDateTime } from "@/lib/format";

const TICK_MS = 60_000;

export function BuildTime({ time, timeZone }: { time: string; timeZone: string }) {
  const exact = formatDateTime(timeZone, new Date(time));
  const [shown, setShown] = useState(exact);

  useEffect(() => {
    const update = () => setShown(formatAgo(time));
    update();
    const timer = setInterval(update, TICK_MS);
    return () => clearInterval(timer);
  }, [time]);

  return (
    <time dateTime={time} title={exact}>
      {shown}
    </time>
  );
}
