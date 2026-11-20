import { Fragment } from "react";
import type { Block, Lang } from "@/content/types";
import { ClockBlock } from "./ClockBlock/ClockBlock";
import { CodeBlock } from "./CodeBlock/CodeBlock";
import { DateBlock } from "./DateBlock/DateBlock";
import { ListBlock } from "./ListBlock/ListBlock";
import { ProjectsBlock } from "./ProjectsBlock/ProjectsBlock";
import { SpotifyBlock } from "./SpotifyBlock/SpotifyBlock";
import { StatusBlock } from "./StatusBlock/StatusBlock";
import { SteamBlock } from "./SteamBlock/SteamBlock";
import { TextBlock } from "./TextBlock/TextBlock";
import { CopyBlock, LinkBlock } from "./ValueBlock/ValueBlock";

function renderBlock(block: Block, lang: Lang) {
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
      return <ClockBlock {...block} lang={lang} />;
    case "date":
      return <DateBlock {...block} lang={lang} />;
    case "projects":
      return <ProjectsBlock {...block} lang={lang} />;
    default:
      return block satisfies never;
  }
}

export function Blocks({ blocks, lang }: { blocks: Block[]; lang: Lang }) {
  return blocks.map((block, index) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: blocks are static lists from content
    <Fragment key={index}>{renderBlock(block, lang)}</Fragment>
  ));
}
