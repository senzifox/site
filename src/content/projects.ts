import type { ProjectDetails } from "./types";

export const projectDetails: Record<string, ProjectDetails> = {
  foxyfriends: {
    icon: "src/main/resources/assets/foxyfriends/icon.png",
    wiki: { ru: "wiki/ru.md", en: "wiki/en.md" },
    blocks: [
      {
        type: "text",
        title: "пысы. лисы более дружелюбны чем люди",
      },
      {
        type: "text",
        title: "описание",
        text: "мод добавляет в майнкрафт возможность приручать лис которые будут помогать вам в приключениях",
      },
      {
        type: "list",
        label: "требования",
        items: ["minecraft 26.3", "fabric loader 0.20.1+", "fabric api 0.165.0+"],
      },
      {
        type: "link",
        icon: "modrinth",
        label: "modrinth",
        value: "foxyfriends",
        href: "https://modrinth.com/mod/foxyfriends",
      },
      {
        type: "link",
        icon: "curseforge",
        label: "curseforge",
        value: "foxyfriends",
        href: "https://www.curseforge.com/minecraft/mc-mods/foxyfriends",
      },
    ],
  },
};
