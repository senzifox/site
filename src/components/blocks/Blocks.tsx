import { Fragment } from "react";
import type { Block } from "@/content/types";
import { ClockBlock } from "./ClockBlock/ClockBlock";
import { CodeBlock } from "./CodeBlock/CodeBlock";
import { ListBlock } from "./ListBlock/ListBlock";
import { SpotifyBlock } from "./SpotifyBlock/SpotifyBlock";
import { StatusBlock } from "./StatusBlock/StatusBlock";
import { SteamBlock } from "./SteamBlock/SteamBlock";
import { TextBlock } from "./TextBlock/TextBlock";
import { CopyBlock, LinkBlock } from "./ValueBlock/ValueBlock";

function renderBlock(block: Block) {
  switch (block.type) {
    case "spotify":
      return <SpotifyBlock {...block} />;
    case "steam":
      return <SteamBlock {...block} />;
    case "text":
      return <TextBlock {...block} />;
    case "copy":
      return <CopyBlock {...block} />;
    case "link":
      return <LinkBlock {...block} />;
    case "list":
      return <ListBlock {...block} />;
    case "code":
      return <CodeBlock {...block} />;
    case "status":
      return <StatusBlock {...block} />;
    case "clock":
      return <ClockBlock {...block} />;
    default:
      return block satisfies never;
  }
}

export function Blocks({ blocks }: { blocks: Block[] }) {
  return blocks.map((block, index) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: blocks are a static list from site.ts
    <Fragment key={index}>{renderBlock(block)}</Fragment>
  ));
}
