import { Fragment } from "react";
import type { Block } from "@/content/types";
import { NowPlaying } from "./NowPlaying/NowPlaying";
import { TextBlock } from "./TextBlock/TextBlock";
import { CopyBlock, LinkBlock } from "./ValueBlock/ValueBlock";

function renderBlock(block: Block) {
  switch (block.type) {
    case "nowPlaying":
      return <NowPlaying {...block} />;
    case "text":
      return <TextBlock {...block} />;
    case "copy":
      return <CopyBlock {...block} />;
    case "link":
      return <LinkBlock {...block} />;
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
