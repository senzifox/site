import { profile } from "@/content/profile";
import { projectDetails } from "@/content/projects";
import type { Block, ProjectDetails } from "@/content/types";
import { HttpError } from "@/lib/http";

export const PROJECTS_REVALIDATE_S = 900;

const TIMEOUT_MS = 5_000;

export type Project = {
  slug: string;
  name: string;
  repo: string;
  description: string;
  topics: string[];
  url: string;
  homepage: string | null;
  icon: string | null;
  blocks: Block[];
};

export type ProjectRelease = { tag: string; page: string; asset: string | null };

export type ProjectPage = Project & { release: ProjectRelease | null };

export type GithubRepo = {
  name: string;
  full_name: string;
  description: string | null;
  topics?: string[];
  html_url: string;
  homepage: string | null;
  fork: boolean;
  archived: boolean;
  private: boolean;
  pushed_at: string;
};

export type GithubRelease = {
  tag_name: string;
  html_url: string;
  assets: { name: string; browser_download_url: string }[];
};

export const rawUrl = (repo: string, path: string) =>
  `https://raw.githubusercontent.com/${repo}/HEAD/${path.replace(/^\.?\//, "")}`;

export const toProjects = (
  repos: GithubRepo[],
  topic: string,
  details: Record<string, ProjectDetails> = {},
): Project[] =>
  repos
    .filter((repo) => !repo.fork && !repo.private && repo.topics?.includes(topic))
    .sort((a, b) => b.pushed_at.localeCompare(a.pushed_at))
    .map((repo) => {
      const slug = repo.name.toLowerCase();
      const { icon, blocks = [] } = details[slug] ?? {};
      return {
        slug,
        name: repo.name,
        repo: repo.full_name,
        description: repo.description?.trim() ?? "",
        topics: (repo.topics ?? []).filter((name) => name !== topic),
        url: repo.html_url,
        homepage: repo.homepage?.trim() || null,
        icon: icon ? rawUrl(repo.full_name, icon) : null,
        blocks,
      };
    });

export const toRelease = (release: GithubRelease): ProjectRelease => {
  const asset = release.assets.find(({ name }) => !/sources|javadoc|-dev\b/i.test(name)) ?? release.assets[0];
  return { tag: release.tag_name, page: release.html_url, asset: asset?.browser_download_url ?? null };
};

const githubFetch = async (what: string, url: string) => {
  const token = process.env.GITHUB_TOKEN;
  const response = await fetch(url, {
    next: { revalidate: PROJECTS_REVALIDATE_S },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: {
      "User-Agent": "senzi.dev",
      Accept: "application/vnd.github+json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new HttpError(what, response);
  return response;
};

export const getProjects = async () => {
  const response = await githubFetch(
    "GitHub repos",
    `https://api.github.com/users/${profile.handle}/repos?type=owner&per_page=100`,
  );
  return toProjects(
    response ? ((await response.json()) as GithubRepo[]) : [],
    profile.handle,
    projectDetails,
  );
};

export const getProjectsOrNone = async () => {
  try {
    return await getProjects();
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const findProject = async (slug: string) =>
  (await getProjects()).find((project) => project.slug === slug);

export const getRelease = async (repo: string) => {
  const response = await githubFetch(
    "GitHub release",
    `https://api.github.com/repos/${repo}/releases/latest`,
  );
  return response ? toRelease((await response.json()) as GithubRelease) : null;
};

export const getProjectPage = async (slug: string): Promise<ProjectPage | null> => {
  const project = await findProject(slug);
  if (!project) return null;
  return { ...project, release: await getRelease(project.repo) };
};
