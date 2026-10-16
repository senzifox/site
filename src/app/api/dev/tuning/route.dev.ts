import { writeDefaults } from "@/lib/tuningFile";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") return new Response(null, { status: 404 });
  return Response.json({ written: writeDefaults(await request.json()) });
}
