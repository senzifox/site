import type { Site } from "./types";

export const site: Site = {
  meta: {
    title: "сензи, вроде живой",
    description: "очень крутой сайт пользователя интернет сети сензи",
    url: "https://senzi.dev",
    locale: "ru_RU",
  },

  header: {
    name: "сензи",
    lineAbove: ["this is", "$ whoami", "introducing", "hello, i'm"],
    lineBelow: "jr devops · moscow",
    socials: [
      { icon: "telegram", label: "telegram", href: "https://t.me/senzifox" },
      { icon: "steam", label: "steam", href: "https://steamcommunity.com/id/senzifox" },
      { icon: "github", label: "github", href: "https://github.com/senzifox" },
    ],
  },

  blocks: [
    {
      type: "text",
      title:
        "вот он ВЕЛИКий сайт на который зайдёт три человека, зато гештальт закрыл, а так... потихонечку живу, чёта пытаюсь в айти, по планам не сдохнуть, а так, в целом, всё ок, спасибо что зашёл, я тебя люблю",
      text: "",
    },
    {
      type: "nowSpotify",
      label: "сейчас играет",
      idleText: "сейчас ничего не играет(",
      idleHint: "но ты можешь перейти на профиль",
      href: "https://open.spotify.com/user/31t4toue4cqdpnzamugmuj5pwkqe?si=7d0fa44dc4d645e5",
    },
  ],

  footer: { text: "© точно, стопроцентов, клянусь не вайбкод" },
};
