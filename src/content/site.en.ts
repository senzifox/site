import { profile } from "./profile";
import type { Site } from "./types";

export const site: Site = {
  meta: {
    title: "senzi, seemingly alive",
    description: "a very cool website by a beginner internet user senzifox",
    url: "https://senzi.dev",
    locale: "en_US",
    keywords: [
      "senzi",
      "senzifox",
      "devops",
      "junior devops",
      "moscow",
      "fox",
      "senzifox dev",
      "senzi.dev",
      "senzi dev",
      "senzi fox",
      "senzi fox dev",
    ],
  },

  header: {
    name: "senzi",
    lineAbove: ["this is", "$ whoami", "beautiful", "introducing", "hello, i'm"],
    lineBelow: "junior devops · still in moscow, sadly",
    socials: [
      { icon: "telegram", label: "telegram", href: profile.links.telegram },
      { icon: "steam", label: "steam", href: profile.links.steam },
      { icon: "github", label: "github", href: profile.links.github },
      { icon: "spotify", label: "spotify", href: profile.links.spotify },
      { icon: "discord", label: "discord", copy: profile.handle },
    ],
  },

  blocks: [
    {
      type: "text",
      title: "something will be here someday :3",
      text: "",
    },
    {
      type: "spotify",
      label: "now playing",
      idleText: "nothing is playing right now(",
      idleHint: "but you can check out my profile",
      href: profile.links.spotify,
    },
    {
      type: "steam",
      label: "playing now",
      idleText: "not playing anything right now",
      idleHint: "but you can check out my profile",
      recentHint: "recently in {game}",
      href: profile.links.steam,
    },
    {
      type: "projects",
      label: "projects",
    },
    {
      type: "list",
      label: "what i know, or try to, my stack basically",
      items: profile.stack,
    },
    {
      type: "copy",
      icon: "mail",
      label: "business offers go here, but telegram is better",
      value: profile.mail,
    },
  ],
  footer: {
    text: "senzifox ©",
    links: [
      { label: "source", href: profile.links.repo },
      { label: "background", href: "https://pin.it/1IUBoonZC" },
    ],
    build: "build",
  },
  notFound: "no such page(",
};
