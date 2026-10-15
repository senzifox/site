import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import potrace from "potrace";
import sharp from "sharp";
import { theme } from "../src/content/theme.ts";

const root = join(import.meta.dirname, "..");
const sourceDir = join(root, "assets/avatar");
const silhouetteOut = join(root, "src/components/Avatar/silhouette.ts");
const appDir = join(root, "src/app");
const HEAD_VIEWBOX = "190 40 900 900";
const PHOTO_SIZE = 660;
const SPARK_MAX_AREA = 100;

const PHOTO_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];
const MASK_EXTENSIONS = ["svg", "png"];

const findOptional = (name: string, extensions: string[]) =>
  extensions.map((ext) => join(sourceDir, `${name}.${ext}`)).find(existsSync);

const findSource = (name: string, extensions: string[]) => {
  const match = findOptional(name, extensions);
  if (!match) throw new Error(`missing ${name}.{${extensions.join(",")}} in ${sourceDir}`);
  return match;
};

const photoName = (index: number) => (index === 0 ? "avatar.webp" : `avatar-${index + 1}.webp`);

const roundNumbers = (path: string) =>
  path.replace(/-?\d+\.\d+/g, (n) => String(Math.round(Number(n) * 10) / 10));

const extractPaths = (svg: string) => {
  const paths = [...svg.matchAll(/\sd="([^"]+)"/g)].map((m) => m[1]);
  if (paths.length === 0) throw new Error("no paths found in mask");
  return roundNumbers(paths.join(" ").replace(/\s+/g, " ").trim());
};

const boundingArea = (subpath: string) => {
  const numbers = (subpath.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
  const xs = numbers.filter((_, i) => i % 2 === 0);
  const ys = numbers.filter((_, i) => i % 2 === 1);
  return (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));
};

const splitSparks = (d: string) => {
  const subpaths = d.split(/(?=M)/).map((s) => s.trim());
  const isSpark = (s: string) => boundingArea(s) <= SPARK_MAX_AREA;
  return {
    d: subpaths.filter((s) => !isSpark(s)).join(" "),
    sparks: subpaths.filter(isSpark).join(" "),
  };
};

const traceAlpha = async (maskPath: string) => {
  const { width, height } = await sharp(maskPath).metadata();
  if (!width || width !== height) throw new Error("mask must be square");
  const bitmap = await sharp(maskPath)
    .ensureAlpha()
    .extractChannel(3)
    .threshold(128)
    .negate()
    .png()
    .toBuffer();
  const svg = await new Promise<string>((resolve, reject) =>
    potrace.trace(
      bitmap,
      { turdSize: 0, optTolerance: 0.4, threshold: 128, blackOnWhite: true },
      (error, out) => (error ? reject(error) : resolve(out)),
    ),
  );
  return { size: width, ...splitSparks(extractPaths(svg)) };
};

const readSvgMask = async (maskPath: string) => {
  const svg = await readFile(maskPath, "utf8");
  const viewBox = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  if (!viewBox || viewBox[1] !== viewBox[2]) throw new Error('mask.svg needs a square viewBox="0 0 N N"');
  return { size: Number(viewBox[1]), ...splitSparks(extractPaths(svg)) };
};

const loadAvatar = async (suffix: string, index: number) => {
  const photoPath = findSource(`photo${suffix}`, PHOTO_EXTENSIONS);
  const maskPath = findSource(`mask${suffix}`, MASK_EXTENSIONS);
  const silhouette = maskPath.endsWith(".svg") ? await readSvgMask(maskPath) : await traceAlpha(maskPath);
  const photoMeta = await sharp(photoPath).metadata();
  if (photoMeta.width !== photoMeta.height) throw new Error(`photo${suffix} must be square`);
  const file = join(root, "public", photoName(index));
  await sharp(photoPath).resize(PHOTO_SIZE, PHOTO_SIZE).webp({ quality: 82 }).toFile(file);
  return { photoPath, file, photo: `/${photoName(index)}`, silhouette };
};

const suffixes = [""];
for (let n = 2; findOptional(`photo${n}`, PHOTO_EXTENSIONS); n++) suffixes.push(String(n));

await mkdir(join(root, "public"), { recursive: true });
const avatars: Awaited<ReturnType<typeof loadAvatar>>[] = [];
for (const [index, suffix] of suffixes.entries()) avatars.push(await loadAvatar(suffix, index));
if (avatars.some(({ silhouette }) => silhouette.size !== avatars[0].silhouette.size)) {
  throw new Error("all masks must have the same size");
}

const entries = avatars.map(
  ({ photo, silhouette: { size, d } }) => `  { photo: "${photo}", size: ${size}, d: "${d}" },`,
);
await writeFile(silhouetteOut, `export const avatars = [\n${entries.join("\n")}\n];\n`);

const [{ photoPath, silhouette }] = avatars;

const photoData = `data:image/jpeg;base64,${(await sharp(photoPath).resize(512, 512).jpeg({ quality: 90 }).toBuffer()).toString("base64")}`;

type CutoutOptions = { outline: number; sparks?: boolean; viewBox?: string };

const cutoutSvg = ({ outline: outlineRatio, sparks: withSparks = true, viewBox }: CutoutOptions) => {
  const { size, d, sparks } = silhouette;
  const stroke = size * outlineRatio * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox ?? `0 0 ${size} ${size}`}" width="${size}" height="${size}">
  <defs><clipPath id="c"><path d="${d}" clip-rule="evenodd"/></clipPath></defs>
  <path d="${d}" fill="none" stroke="${theme.accent}" stroke-width="${stroke}" stroke-linejoin="round"/>
  <image href="${photoData}" width="${size}" height="${size}" clip-path="url(#c)"/>
  ${withSparks && sparks ? `<path d="${sparks}" fill="${theme.accent}" stroke="${theme.accent}" stroke-width="${stroke / 2}"/>` : ""}
</svg>`;
};

const renderCutout = (pixels: number, options: CutoutOptions) =>
  sharp(Buffer.from(cutoutSvg(options)), { density: 72 * (pixels / silhouette.size) * 1.2 })
    .resize(pixels, pixels, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ palette: true, compressionLevel: 9 });

const ico = (images: { size: number; png: Buffer }[]) => {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, png }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(png.byteLength, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.byteLength;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...images.map(({ png }) => png)]);
};

await renderCutout(512, { outline: 0.012 }).toFile(join(root, "public/avatar-cutout.png"));
await renderCutout(192, { outline: 0.025 }).toFile(join(appDir, "icon.png"));
await sharp({ create: { width: 180, height: 180, channels: 4, background: theme.background } })
  .composite([{ input: await renderCutout(156, { outline: 0.02 }).toBuffer(), gravity: "south" }])
  .png({ palette: true, compressionLevel: 9 })
  .toFile(join(appDir, "apple-icon.png"));
const icoSizes = await Promise.all(
  [16, 32, 48].map(async (size) => ({
    size,
    png: await renderCutout(size, { outline: 0.03, sparks: false, viewBox: HEAD_VIEWBOX }).toBuffer(),
  })),
);
await writeFile(join(appDir, "favicon.ico"), ico(icoSizes));

for (const { file, photo, silhouette: traced } of avatars) {
  const photoBytes = (await readFile(file)).byteLength;
  const sparkCount = traced.sparks ? traced.sparks.split("M").length - 1 : 0;
  console.log(
    `${photo} ${(photoBytes / 1024).toFixed(1)} KB, silhouette ${(traced.d.length / 1024).toFixed(1)} KB, specks ${sparkCount}`,
  );
}
