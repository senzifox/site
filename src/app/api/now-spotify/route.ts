import { getNowSpotify } from "@/lib/spotify/spotify";

export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "no-store" };

export async function GET() {
  try {
    return Response.json(await getNowSpotify(), { headers });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "unavailable" }, { status: 503, headers });
  }
}
