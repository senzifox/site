import type { IconName } from "@/components/Icon/icons";

export type Social = { icon: IconName; label: string } & ({ href: string } | { copy: string });

export type SpotifyBlock = {
  type: "spotify";
  label: string;
  idleText: string;
  idleHint?: string;
  href?: string;
};

export type SteamBlock = {
  type: "steam";
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
  | SpotifyBlock
  | SteamBlock
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
    lineAbove?: string[];
    lineBelow?: string;
    socials: Social[];
  };
  blocks: Block[];
  footer?: { text: string };
};

export type TerminalRow =
  | { type: "title"; user: string; host: string; subtitle?: string }
  | { type: "blank" }
  | { type: "palette" }
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "bullet"; text: string }
  | { type: "text"; key: string; value: string }
  | { type: "list"; key: string; items: string[] }
  | { type: "links"; key: string; handle: string; services: string[] }
  | { type: "status"; key: string; text: string; state?: StatusState }
  | { type: "clock"; key: string; timeZone: string }
  | { type: "spotify"; key: string; idleText: string }
  | { type: "steam"; key: string; idleText: string; recentText?: string }
  | { type: "github"; key: string; user: string; idleText: string }
  | { type: "uptime"; key: string }
  | { type: "deploy"; key: string };
