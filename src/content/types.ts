import type { IconName } from "@/components/Icon/icons";

export type Social = { icon: IconName; label: string; href: string };

export type NowPlayingBlock = {
  type: "nowPlaying";
  label: string;
  idleText: string;
  idleHint?: string;
  href?: string;
};

export type TextBlock = { type: "text"; title?: string; text?: string };

export type CopyBlock = { type: "copy"; icon: IconName; label: string; value: string };

export type LinkBlock = { type: "link"; icon: IconName; label: string; value: string; href: string };

export type Block = NowPlayingBlock | TextBlock | CopyBlock | LinkBlock;

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
