export const build = {
  sha: process.env.BUILD_SHA ?? "dev",
  time: process.env.BUILD_TIME ?? new Date().toISOString(),
};

export const commitUrl = (repo: string, sha: string) =>
  /^[0-9a-f]{7,40}$/.test(sha) ? `${repo}/commit/${sha}` : null;
