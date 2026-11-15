export const SITE_URL = "https://deploymedic.dev";
export const SITE_NAME = "DeployMedic";
export const SITE_TAGLINE = "Evidence-first deployment diagnostics";

export const SITE_DESCRIPTION =
  "DeployMedic is a local-first CLI and offline report viewer that finds Docker, Node.js, env, lockfile, and Compose deployment issues — with evidence, without uploading your code.";

export const SITE_KEYWORDS = [
  "DeployMedic",
  "deployment diagnostics",
  "deployment troubleshooting",
  "broken deployment",
  "Docker deployment checker",
  "Dockerfile HEALTHCHECK",
  "Docker Compose validation",
  "Node.js deploy issues",
  "missing lockfile",
  "env.example checker",
  ".env gitignore",
  "local-first devops",
  "offline report viewer",
  "CI deployment scan",
  "container security basics",
  "PORT environment variable",
  "deployment evidence report",
  "NullEx17",
] as const;

export const SITE_AUTHOR = {
  name: "NullEx17",
  url: "https://nullex17.me/",
  github: "https://github.com/NullEx17",
  repo: "https://github.com/NullEx17/DeployMedic",
} as const;

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http")) return path;
  return new URL(path, SITE_URL).toString();
}
