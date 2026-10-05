import type { Terminal, TerminalRow } from "./types";

const role: TerminalRow = { type: "text", key: "role", value: "jr devops · moscow" };

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
  recentText: "недавно: {game}",
};

const push: TerminalRow = { type: "github", key: "push", user: "senzifox", idleText: "давно не пушил" };

export const terminal: Terminal = {
  main: [
    { type: "title" },
    role,
    links,
    { type: "list", key: "stack", items: ["docker", "nginx", "ci/cd", "linux"] },
    { type: "clock", key: "time", timeZone: "Europe/Moscow" },
    music,
    game,
    push,
    { type: "uptime", key: "uptime" },
    { type: "deploy", key: "deploy" },
    { type: "blank" },
    { type: "palette" },
  ],

  short: [
    { type: "title" },
    { type: "paragraph", text: "jr devops · moscow" },
    { type: "blank" },
    { type: "bullet", text: "t.me/senzifox" },
    { type: "bullet", text: "steamcommunity.com/id/senzifox" },
    { type: "bullet", text: "github.com/senzifox" },
    { type: "blank" },
    { type: "palette" },
  ],

  full: [
    { type: "title" },
    role,
    { type: "clock", key: "time", timeZone: "Europe/Moscow" },
    music,
    game,
    push,
    { type: "blank" },
    { type: "heading", text: "contacts" },
    links,
    { type: "blank" },
    { type: "heading", text: "system" },
    { type: "uptime", key: "uptime" },
    { type: "deploy", key: "deploy" },
    { type: "blank" },
    { type: "palette" },
  ],

  about: [
    { type: "title" },
    { type: "paragraph", text: "jr devops · moscow" },
    { type: "blank" },
    {
      type: "paragraph",
      text: "вот он ВЕЛИКий сайт на который зайдёт три человека, зато гештальт закрыл, а так... потихонечку живу, чёта пытаюсь в айти, по планам не сдохнуть, а так, в целом, всё ок, спасибо что зашёл, я тебя люблю",
    },
    { type: "blank" },
    links,
    { type: "blank" },
    { type: "palette" },
  ],
};
