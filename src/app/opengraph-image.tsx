import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/content/site";
import { theme } from "@/content/theme";

export const alt = site.meta.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const loadFont = async (weight: number, text: string) => {
  const query = new URLSearchParams({ family: `Roboto:wght@${weight}`, text });
  const css = await (await fetch(`https://fonts.googleapis.com/css2?${query}`)).text();
  const source = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
  if (!source) throw new Error(`Roboto ${weight} not found`);
  return (await fetch(source)).arrayBuffer();
};

export default async function OpengraphImage() {
  const { name, lineAbove, lineBelow } = site.header;
  const above = lineAbove?.[0];
  const host = new URL(site.meta.url).host;
  const text = [above, name, lineBelow, host].filter(Boolean).join(" ");
  const avatar = await readFile(join(process.cwd(), "public/avatar-cutout.png"));

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: 56,
        padding: "0 88px",
        background: theme.background,
        backgroundImage:
          "radial-gradient(ellipse 75% 85% at 28% 0%, rgba(195, 88, 23, 0.34), rgba(140, 55, 15, 0.12) 50%, transparent 100%)",
        fontFamily: "Roboto",
      }}
    >
      <img
        src={`data:image/png;base64,${avatar.toString("base64")}`}
        width={500}
        height={500}
        alt=""
        style={{ alignSelf: "flex-end" }}
      />
      <div style={{ display: "flex", flexDirection: "column" }}>
        {above && <div style={{ fontSize: 40, fontWeight: 500, color: theme.soft }}>{above}</div>}
        <div
          style={{ fontSize: 128, fontWeight: 700, color: theme.strong, letterSpacing: -3, lineHeight: 1.05 }}
        >
          {name}
        </div>
        {lineBelow && <div style={{ fontSize: 38, color: theme.muted, marginTop: 8 }}>{lineBelow}</div>}
        <div style={{ fontSize: 30, fontWeight: 500, color: theme.accent, marginTop: 48 }}>{host}</div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Roboto", data: await loadFont(500, text), weight: 500 },
        { name: "Roboto", data: await loadFont(700, text), weight: 700 },
      ],
    },
  );
}
