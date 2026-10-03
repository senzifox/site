export type IconSource = string | { icon: string; scale?: number };

export const iconSources = {
  telegram: "simple-icons:telegram",
  steam: "simple-icons:steam",
  github: "simple-icons:github",
  spotify: "simple-icons:spotify",
  mail: "material-symbols:mail-rounded",
  card: "material-symbols:credit-card-rounded",
  usdt: "simple-icons:tether",
  ton: "simple-icons:ton",
  bot: "material-symbols:smart-toy-rounded",
  equalizer: "material-symbols:graphic-eq-rounded",
  copy: "material-symbols:content-copy-rounded",
  check: "material-symbols:check-rounded",
  openInNew: "material-symbols:open-in-new-rounded",
} satisfies Record<string, IconSource>;

export const setScale: Record<string, number> = {
  "simple-icons": 0.82,
};
