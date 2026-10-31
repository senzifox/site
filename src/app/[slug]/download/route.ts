import { NextResponse } from "next/server";
import { profile } from "@/content/profile";
import { findProject, getRelease } from "@/lib/github/projects";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const project = await findProject(slug);
    if (!project) return new NextResponse(null, { status: 404 });
    const release = await getRelease(project.repo);
    return NextResponse.redirect(release?.asset ?? `${project.url}/releases`, 302);
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(
      `https://github.com/${profile.handle}/${encodeURIComponent(slug)}/releases/latest`,
      302,
    );
  }
}
