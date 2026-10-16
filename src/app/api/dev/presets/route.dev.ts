import { presetName, readPresets, removePreset, savePreset } from "@/lib/presetsFile";

export const dynamic = "force-dynamic";

const notFound = () => new Response(null, { status: 404 });

const badName = () => Response.json({ error: "bad name" }, { status: 400 });

const isDev = () => process.env.NODE_ENV === "development";

export function GET() {
  if (!isDev()) return notFound();
  return Response.json(readPresets());
}

export async function PUT(request: Request) {
  if (!isDev()) return notFound();
  const { name, values } = (await request.json()) as { name?: unknown; values?: unknown };
  const valid = presetName(name);
  return valid ? Response.json(savePreset(valid, values)) : badName();
}

export function DELETE(request: Request) {
  if (!isDev()) return notFound();
  const valid = presetName(new URL(request.url).searchParams.get("name"));
  return valid ? Response.json(removePreset(valid)) : badName();
}
