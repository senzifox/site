import { site as ru } from "./site";
import { site as en } from "./site.en";
import type { Lang, Site } from "./types";

export const sites: Record<Lang, Site> = { ru, en };
