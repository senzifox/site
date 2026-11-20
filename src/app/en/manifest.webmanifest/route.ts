import { siteManifest } from "@/lib/manifest";

export const dynamic = "force-static";

export function GET() {
  return Response.json(siteManifest("en"), { headers: { "Content-Type": "application/manifest+json" } });
}
