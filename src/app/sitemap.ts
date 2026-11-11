import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { getProjectsOrNone, projectLangs, projectPath } from "@/lib/github/projects";
import { wikiLangs, wikiPath } from "@/lib/github/wiki";

export const revalidate = 900;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const projects = await getProjectsOrNone();
  return [
    { url: site.meta.url, lastModified, changeFrequency: "monthly", priority: 1 },
    ...projects.flatMap((project) =>
      projectLangs(project).map((lang) => ({
        url: new URL(projectPath(project.slug, lang), site.meta.url).toString(),
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ),
    ...projects.flatMap((project) =>
      wikiLangs(project).map((lang) => ({
        url: new URL(wikiPath(project.slug, lang), site.meta.url).toString(),
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ),
  ];
}
