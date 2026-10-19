import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const root = join(import.meta.dirname, "..");
const sourceDir = join(root, "assets/background");
const publicDir = join(root, "public");
const SOURCE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

const source = SOURCE_EXTENSIONS.map((ext) => join(sourceDir, `background.${ext}`)).find(existsSync);
if (!source) throw new Error(`missing background.{${SOURCE_EXTENSIONS.join(",")}} in ${sourceDir}`);

await mkdir(publicDir, { recursive: true });
await sharp(source).avif({ quality: 55 }).toFile(join(publicDir, "background.avif"));
await sharp(source).webp({ quality: 75 }).toFile(join(publicDir, "background.webp"));
