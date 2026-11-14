import ignore from "ignore";
import type { CheckContext } from "../types.js";

export type GitignoreFile = {
  /** Directory containing the .gitignore, '' for scan root. Posix-style. */
  dir: string;
  content: string;
};

/** Secret-ish env paths we expect to be ignored in a healthy Node project. */
export const ENV_SECRET_PROBES = [
  ".env",
  ".env.local",
  ".env.development",
  ".env.production",
  ".env.development.local",
  "config/.env",
] as const;

/** Paths that should typically remain trackable. */
export const ENV_EXAMPLE_PROBES = [".env.example", ".env.sample"] as const;

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  ".next",
  "coverage",
  ".turbo",
  ".vercel",
  "build",
  "out",
]);

function toPosix(p: string): string {
  return p.replace(/\\/g, "/").replace(/^\.\//, "");
}

/**
 * Rewrite a single gitignore pattern so it applies under `dir` when evaluated
 * against scan-root-relative paths (git semantics for nested .gitignore).
 */
export function prefixGitignorePattern(
  dir: string,
  rawLine: string,
): string[] {
  const trimmed = rawLine.trimEnd();
  if (!trimmed || trimmed.startsWith("#")) {
    return trimmed && trimmed.startsWith("#") ? [] : [];
  }

  const negated = trimmed.startsWith("!");
  let pattern = (negated ? trimmed.slice(1) : trimmed).trimStart();
  if (!pattern) return [];

  const bang = negated ? "!" : "";

  if (!dir) {
    return [`${bang}${pattern}`];
  }

  const base = toPosix(dir).replace(/\/$/, "");

  if (pattern.startsWith("/")) {
    return [`${bang}${base}${pattern}`];
  }

  if (pattern.includes("/")) {
    return [`${bang}${base}/${pattern.replace(/^\.\//, "")}`];
  }

  // No slash: matches in any directory beneath this gitignore's directory.
  return [`${bang}${base}/${pattern}`, `${bang}${base}/**/${pattern}`];
}

export function buildRootRelativeIgnore(files: GitignoreFile[]) {
  const ig = ignore();
  const ordered = [...files].sort((a, b) => a.dir.length - b.dir.length);

  for (const file of ordered) {
    for (const raw of file.content.split(/\r?\n/)) {
      for (const pattern of prefixGitignorePattern(file.dir, raw)) {
        ig.add(pattern);
      }
    }
  }

  return ig;
}

export function isIgnoredPath(
  files: GitignoreFile[],
  relativePath: string,
): boolean {
  const posix = toPosix(relativePath);
  if (!posix || posix === ".") return false;
  const ig = buildRootRelativeIgnore(files);
  return ig.ignores(posix);
}

/**
 * Collect root + nested .gitignore files with a bounded directory walk.
 * Never follows paths outside the scan root (relies on CheckContext confinement).
 */
export async function collectGitignoreFiles(
  ctx: CheckContext,
  options?: { maxFiles?: number; maxDirs?: number },
): Promise<GitignoreFile[]> {
  const maxFiles = options?.maxFiles ?? 64;
  const maxDirs = options?.maxDirs ?? 200;
  const found: GitignoreFile[] = [];
  const seen = new Set<string>();

  const rootText = await ctx.readText(".gitignore");
  if (rootText !== null) {
    found.push({ dir: "", content: rootText });
    seen.add("");
  }

  const queue: string[] = [""];
  let dirsVisited = 0;

  while (queue.length > 0 && found.length < maxFiles && dirsVisited < maxDirs) {
    const dir = queue.shift()!;
    dirsVisited += 1;
    const entries = await ctx.listDir(dir === "" ? "." : dir);

    for (const name of entries) {
      if (SKIP_DIRS.has(name)) continue;
      const childRel = dir ? `${dir}/${name}` : name;
      const childPosix = toPosix(childRel);

      if (name === ".gitignore") {
        if (dir === "") continue;
        if (seen.has(dir)) continue;
        const content = await ctx.readText(childRel);
        if (content !== null) {
          found.push({ dir: toPosix(dir), content });
          seen.add(toPosix(dir));
        }
        continue;
      }

      if (await ctx.isDirectory(childRel)) {
        queue.push(childPosix);
      }
    }
  }

  return found;
}

export type EnvIgnoreAssessment = {
  hasGitignore: boolean;
  gitignoreCount: number;
  secretPathsChecked: string[];
  ignoredSecrets: string[];
  trackedSecrets: string[];
  examplesUnignored: string[];
  examplesUnexpectedlyIgnored: string[];
};

export function assessEnvIgnore(files: GitignoreFile[]): EnvIgnoreAssessment {
  const secretPathsChecked = [...ENV_SECRET_PROBES];
  const ignoredSecrets: string[] = [];
  const trackedSecrets: string[] = [];

  for (const probe of secretPathsChecked) {
    if (files.length === 0) {
      trackedSecrets.push(probe);
      continue;
    }
    if (isIgnoredPath(files, probe)) ignoredSecrets.push(probe);
    else trackedSecrets.push(probe);
  }

  const examplesUnignored: string[] = [];
  const examplesUnexpectedlyIgnored: string[] = [];
  for (const probe of ENV_EXAMPLE_PROBES) {
    if (files.length === 0) {
      examplesUnignored.push(probe);
      continue;
    }
    if (isIgnoredPath(files, probe)) examplesUnexpectedlyIgnored.push(probe);
    else examplesUnignored.push(probe);
  }

  return {
    hasGitignore: files.length > 0,
    gitignoreCount: files.length,
    secretPathsChecked,
    ignoredSecrets,
    trackedSecrets,
    examplesUnignored,
    examplesUnexpectedlyIgnored,
  };
}
