import type { IconName } from "@/components/Icon/icons";

export type Social = { icon: IconName; label: string; href: string };

export type NowSpotifyBlock = {
  type: "nowSpotify";
  label: string;
  idleText: string;
  idleHint?: string;
  href?: string;
};

export type NowSteamBlock = {
  type: "nowSteam";
  label: string;
  idleText: string;
  idleHint?: string;
  recentHint?: string;
  href?: string;
};

export type TextBlock = { type: "text"; title?: string; text?: string };

export type CopyBlock = { type: "copy"; icon: IconName; label: string; value: string };

export type LinkBlock = { type: "link"; icon: IconName; label: string; value: string; href: string };

export type ListBlock = { type: "list"; label?: string; items: string[] };

export type CodeBlock = { type: "code"; label?: string; lines: string[] };

export type StatusState = "online" | "busy" | "offline";

export type StatusBlock = { type: "status"; label?: string; text: string; state?: StatusState };

export type ClockBlock = { type: "clock"; label?: string; timeZone: string };

export type Block =
  | NowSpotifyBlock
  | NowSteamBlock
  | TextBlock
  | CopyBlock
  | LinkBlock
  | ListBlock
  | CodeBlock
  | StatusBlock
  | ClockBlock;

export type Site = {
  meta: { title: string; description: string; url: string; locale: string; keywords?: string[] };
  header: {
    name: string;
    lineAbove?: string | string[];
    lineBelow?: string;
    socials: Social[];
  };
  blocks: Block[];
  footer?: { text: string; href?: string };
};
