import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { mergeTuning, type Tuning } from "@/lib/tuning";

const FILE = "docs/tuning-presets.json";
const MAX_NAME = 60;

export type Presets = Record<string, Tuning>;

const path = () => join(process.cwd(), FILE);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const presetName = (value: unknown) => {
  const name = typeof value === "string" ? value.trim() : "";
  return name && name.length <= MAX_NAME ? name : null;
};

export const parsePresets = (text: string): Presets => {
  const raw: unknown = JSON.parse(text);
  if (!isRecord(raw)) return {};
  return Object.fromEntries(
    Object.entries(raw)
      .filter(([name]) => presetName(name) === name)
      .map(([name, values]) => [name, mergeTuning(values)]),
  );
};

export const readPresets = (): Presets => {
  if (!existsSync(path())) return {};
  try {
    return parsePresets(readFileSync(path(), "utf8"));
  } catch {
    return {};
  }
};

const writePresets = (presets: Presets) => {
  mkdirSync(dirname(path()), { recursive: true });
  writeFileSync(path(), `${JSON.stringify(presets, null, 2)}\n`);
  return presets;
};

export const savePreset = (name: string, values: unknown) =>
  writePresets({ ...readPresets(), [name]: mergeTuning(values) });

export const removePreset = (name: string) => {
  const { [name]: _, ...rest } = readPresets();
  return writePresets(rest);
};
