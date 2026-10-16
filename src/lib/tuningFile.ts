import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { mergeTuning, type Tuning } from "@/lib/tuning";

const FILE = "src/lib/tuningDefaults.ts";
const PRECISION = 6;

const round = (_: string, value: unknown) =>
  typeof value === "number" ? Number(value.toFixed(PRECISION)) : value;

export const formatDefaults = (values: Tuning) =>
  execFileSync(join(process.cwd(), "node_modules/.bin/biome"), ["format", `--stdin-file-path=${FILE}`], {
    input: `export const defaults = ${JSON.stringify(values, round)};\n`,
  }).toString();

export const writeDefaults = (source: unknown) => {
  const text = formatDefaults(mergeTuning(source));
  const path = join(process.cwd(), FILE);
  if (readFileSync(path, "utf8") === text) return false;
  writeFileSync(path, text);
  return true;
};
