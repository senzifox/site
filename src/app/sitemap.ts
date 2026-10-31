import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { getProjectsOrNone } from "@/lib/github/projects";

export const revalidate = 900;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const projects = await getProjectsOrNone();
  return [
    { url: site.meta.url, lastModified, changeFrequency: "monthly", priority: 1 },
    ...projects.map(({ slug }) => ({
      url: new URL(`/${slug}`, site.meta.url).toString(),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
