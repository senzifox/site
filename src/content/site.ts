import type { Site } from "./types";

export const site: Site = {
  meta: {
    title: "сензи, вроде живой",
    description: "очень крутой сайт начинающего пользователя интернет сети сензифокс",
    url: "https://senzi.dev",
    locale: "ru_RU",
    keywords: [
      "сензи",
      "senzifox",
      "devops",
      "junior devops",
      "москва",
      "senzi",
      "fox",
      "senzifox dev",
      "senzi.dev",
    ],
  },

  header: {
    name: "сензи",
    lineAbove: [
      "this is",
      "прекрасный",
      "$ whoami",
      "beautiful",
      "introducing",
      "hello, i'm",
      "пр, я",
      "знакомьтесь",
    ],
    lineBelow: "junior devops · still in moscow, sadly",
    socials: [
      { icon: "telegram", label: "telegram", href: "https://t.me/senzifox" },
      { icon: "steam", label: "steam", href: "https://steamcommunity.com/id/senzifox" },
      { icon: "github", label: "github", href: "https://github.com/senzifox" },
      {
        icon: "spotify",
        label: "spotify",
        href: "https://open.spotify.com/user/31t4toue4cqdpnzamugmuj5pwkqe?si=7d0fa44dc4d645e5",
      },
      { icon: "discord", label: "discord", copy: "senzifox" },
    ],
  },

  blocks: [
    {
      type: "text",
      title:
        "вот он ВЕЛИКий сайт на который зайдёт три человека, зато гештальт закрыл, а так... потихонечку живу, чёта пытаюсь в айти, по планам не сдохнуть, а так, в целом, всё ок, спасибо что зашёл, я тебя люблю. пЫсЫ. полистай ещё, там есть всякие прикольные штуки, типа того что я слушаю на спотифай и во что играю в стиме прям ща :3",
      text: "",
    },
    {
      type: "nowSpotify",
      label: "сейчас играет",
      idleText: "сейчас ничего не играет(",
      idleHint: "но ты можешь перейти на профиль",
      href: "https://open.spotify.com/user/31t4toue4cqdpnzamugmuj5pwkqe?si=7d0fa44dc4d645e5",
    },
    {
      type: "nowSteam",
      label: "сейчас играю",
      idleText: "сейчас ни во что не играю",
      idleHint: "но ты можешь перейти на профиль",
      recentHint: "недавно в {game}",
      href: "https://steamcommunity.com/id/senzifox",
    },
    {
      type: "list",
      label: "то в чём я разбираюсь, или пытаюсь, стек короче",
      items: ["docker", "nginx", "ci/cd", "linux", "python", "bash", "git"],
    },
    {
      type: "copy",
      icon: "mail",
      label: "сюда можно деловые предложения закинуть, но лучше в телеграмм",
      value: "fox@senzi.dev",
    },
    {
      type: "text",
      title:
        "кстааа, ещё есть версия для терминала в стиле neofetch, попробуй curl senzi.dev, а также у него есть версии, /short, /full, /about, но смысла в них не то чтобы много",
      text: "",
    },
    //  { type: "status", label: "статус", text: "открыт к новым предложениям", state: "online", },
    //  { type: "clock", label: "у меня ща:", timeZone: "Europe/Moscow", },
    //  { type: "code", label: "neofetch", lines: ["тут типа в будущем можно код написать, пока не придумал что сюда"] },
    //  { type: "link", icon: "github", label: "github", value: "senzifox/заглушка", href: "https://github.com/senzifox" },
  ],
  footer: { text: "senzifox © точно, стопроцентов, клянусь не вайбкод" },
};
