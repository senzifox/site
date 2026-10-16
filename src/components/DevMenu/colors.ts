type Swatch = { name: `--${string}`; label: string; triplet?: boolean };

export const swatches: Swatch[] = [
  { name: "--accent", label: "акцент" },
  { name: "--soft", label: "мягкий акцент" },
  { name: "--glow", label: "свечение", triplet: true },
  { name: "--glow2", label: "свечение 2", triplet: true },
  { name: "--bg", label: "фон" },
  { name: "--head", label: "фон шапки", triplet: true },
  { name: "--text-strong", label: "текст яркий" },
  { name: "--text", label: "текст" },
  { name: "--text-muted", label: "текст тусклый" },
  { name: "--icon", label: "иконки" },
  { name: "--online", label: "онлайн" },
];

const originals = new Map(
  swatches.map(({ name }) => [
    name,
    getComputedStyle(document.documentElement).getPropertyValue(name).trim(),
  ]),
);

export const toHex = ({ name, triplet }: Swatch) => {
  const value = originals.get(name) ?? "";
  if (!triplet) return value;
  return `#${value
    .split(/\s+/)
    .map((part) => Number(part).toString(16).padStart(2, "0"))
    .join("")}`;
};

const fromHex = ({ triplet }: Swatch, value: string) =>
  triplet ? [1, 3, 5].map((i) => Number.parseInt(value.slice(i, i + 2), 16)).join(" ") : value.toLowerCase();

export const paintColor = (swatch: Swatch, value: string) => {
  const next = fromHex(swatch, value);
  const style = document.documentElement.style;
  if (next === originals.get(swatch.name)?.toLowerCase()) style.removeProperty(swatch.name);
  else style.setProperty(swatch.name, next);
};

export const COLORS = "цвета";

export const colorKey = ({ name }: Swatch) => name.slice(2);
