export type DateMode = "countdown" | "since" | "date";

export type DateLook = "tiles" | "big";

type Moment = { year?: number; month: number; day: number; hour: number; minute: number };

export type DateState = {
  target: number;
  ms: number;
  done: boolean;
  progress?: { value: number; year: number };
};

export type Duration = { days: number; hours: number; minutes: number; seconds: number };

const DAY_MS = 86_400_000;
const MOMENT = /^(?:(\d{4})-)?(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/;

export const parseMoment = (value: string): Moment | null => {
  const match = MOMENT.exec(value.trim());
  if (!match) return null;
  const [, year, month, day, hour = "0", minute = "0"] = match;
  const moment = {
    year: year ? Number(year) : undefined,
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
  };
  const valid =
    moment.month >= 1 &&
    moment.month <= 12 &&
    moment.day >= 1 &&
    moment.day <= 31 &&
    moment.hour <= 23 &&
    moment.minute <= 59;
  return valid ? moment : null;
};

const zoneParts = (timeZone: string, at: number) =>
  Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    })
      .formatToParts(at)
      .map(({ type, value }) => [type, Number(value)]),
  );

const zoneOffset = (timeZone: string, at: number) => {
  const p = zoneParts(timeZone, at);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(at / 1000) * 1000;
};

const zonedTime = ({ month, day, hour, minute }: Moment, year: number, timeZone: string) => {
  const wall = Date.UTC(year, month - 1, day, hour, minute);
  const guess = wall - zoneOffset(timeZone, wall);
  return wall - zoneOffset(timeZone, guess);
};

const zoneYear = (timeZone: string, at: number) => zoneParts(timeZone, at).year;

const yearlyState = (moment: Moment, timeZone: string, mode: DateMode, now: number): DateState => {
  const year = zoneYear(timeZone, now);
  const current = zonedTime(moment, year, timeZone);

  if (mode === "since") {
    const target = now >= current ? current : zonedTime(moment, year - 1, timeZone);
    return { target, ms: now - target, done: false };
  }

  const celebrating = mode === "countdown" && now >= current && now < current + DAY_MS;
  if (celebrating) return { target: current, ms: 0, done: true };

  const [start, target] =
    now < current
      ? [zonedTime(moment, year - 1, timeZone), current]
      : [current, zonedTime(moment, year + 1, timeZone)];
  const value = (now - start) / (target - start);
  return { target, ms: target - now, done: false, progress: { value, year: zoneYear(timeZone, start) } };
};

export const dateState = (value: string, timeZone: string, mode: DateMode, now: number): DateState | null => {
  const moment = parseMoment(value);
  if (!moment) return null;

  try {
    if (moment.year === undefined) return yearlyState(moment, timeZone, mode, now);

    const target = zonedTime(moment, moment.year, timeZone);
    if (mode === "since") return { target, ms: Math.max(0, now - target), done: false };
    return { target, ms: Math.abs(target - now), done: mode === "countdown" && now >= target };
  } catch {
    return null;
  }
};

export const splitDuration = (ms: number): Duration => {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3_600),
    minutes: Math.floor((total % 3_600) / 60),
    seconds: total % 60,
  };
};

const rules = new Intl.PluralRules("ru-RU");

export const plural = (count: number, [one, few, many]: readonly [string, string, string]) => {
  const form = rules.select(count);
  return form === "one" ? one : form === "few" ? few : many;
};

export const formatPercent = (value: number) => `${(Math.min(1, Math.max(0, value)) * 100).toFixed(1)}%`;

export const formatLongDate = (timeZone: string, at: number) =>
  new Intl.DateTimeFormat("ru-RU", { timeZone, day: "numeric", month: "long", year: "numeric" }).format(at);

export const formatInDays = (target: number, now: number) =>
  new Intl.RelativeTimeFormat("ru", { numeric: "auto" }).format(Math.trunc((target - now) / DAY_MS), "day");
