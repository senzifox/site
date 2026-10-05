import type { TerminalRow } from "./types";

const title: TerminalRow = {
  type: "title",
  user: "лисёнок",
  host: "senzi.dev",
  subtitle: "junior devops · still in moscow, sadly",
};

const links: TerminalRow = {
  type: "links",
  key: "find me",
  handle: "@senzifox",
  services: ["tg", "steam", "github"],
};

const music: TerminalRow = { type: "spotify", key: "music", idleText: "сейчас ничего не играет(" };

const game: TerminalRow = {
  type: "steam",
  key: "game",
  idleText: "ни во что не играю",
  recentText: "недавно в {game}",
};

const push: TerminalRow = { type: "github", key: "push", user: "senzifox", idleText: "давно не пушил" };

export const terminal = {
  main: [
    title,
    links,
    //  { type: "text", key: "text", value: "text" },
    { type: "list", key: "stack", items: ["docker", "nginx", "ci/cd", "linux", "python", "bash", "git"] },
    //  { type: "status", key: "status", text: "открыт к работе (заглушка)", state: "online" },
    { type: "clock", key: "time", timeZone: "Europe/Moscow" },
    music,
    game,
    //  push,
    { type: "uptime", key: "uptime" },
    { type: "deploy", key: "deploy" },
    { type: "blank" },
    { type: "palette" },
  ],

  short: [
    title,
    { type: "blank" },
    { type: "bullet", text: "t.me/senzifox" },
    { type: "bullet", text: "steamcommunity.com/id/senzifox" },
    { type: "bullet", text: "github.com/senzifox" },
    { type: "bullet", text: "больше я не придумал что сюда поместить" },
    { type: "bullet", text: "мб потом" },
    { type: "blank" },
    { type: "palette" },
  ],

  full: [
    title,
    //  { type: "status", key: "status", text: "открыт к работе (заглушка)", state: "online" },
    { type: "clock", key: "time", timeZone: "Europe/Moscow" },
    music,
    game,
    push,
    { type: "blank" },
    { type: "heading", text: "contacts" },
    links,
    { type: "text", key: "mail", value: "fox@senzi.dev" },
    { type: "blank" },
    { type: "heading", text: "system" },
    //  { type: "text", key: "os", value: "заглушка" },
    //  { type: "text", key: "shell", value: "заглушка" },
    { type: "uptime", key: "uptime" },
    { type: "deploy", key: "deploy" },
    { type: "blank" },
    { type: "palette" },
  ],

  about: [
    title,
    { type: "blank" },
    {
      type: "paragraph",
      text: "тут будет абаут ми как только он появится на сайте",
    },
    { type: "blank" },
    links,
    { type: "blank" },
    { type: "palette" },
  ],
} satisfies Record<string, TerminalRow[]>;

export type TerminalVariant = keyof typeof terminal;
