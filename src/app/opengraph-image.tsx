import { OG_SIZE, ogAlt, renderOg } from "@/lib/og";

export const alt = ogAlt("ru");
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderOg("ru");
}
