export const formatTime = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

export const stripWhitespace = (value: string) => value.replace(/\s/g, "");

export const formatUptime = (seconds: number) => {
  const total = Math.max(0, Math.floor(seconds / 60));
  const parts = [
    [Math.floor(total / 1440), "d"],
    [Math.floor((total % 1440) / 60), "h"],
    [total % 60, "m"],
  ] as const;
  const first = parts.findIndex(([value]) => value > 0);
  return first === -1
    ? "0m"
    : parts
        .slice(first)
        .map(([value, unit]) => `${value}${unit}`)
        .join(" ");
};

const UNITS = [
  ["year", 31_536_000],
  ["month", 2_592_000],
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
] as const;

export const formatAgo = (date: Date | string, now = new Date()) => {
  const seconds = Math.max(0, (now.getTime() - new Date(date).getTime()) / 1000);
  const unit = UNITS.find(([, size]) => seconds >= size);
  if (!unit) return "только что";
  return new Intl.RelativeTimeFormat("ru", { numeric: "auto" }).format(
    -Math.floor(seconds / unit[1]),
    unit[0],
  );
};
