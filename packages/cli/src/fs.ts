import { open, readdir, realpath, stat } from "node:fs/promises";
import path from "node:path";
import type { CheckContext } from "./types.js";

/** Maximum bytes read from any single project file during a scan. */
export const MAX_READ_BYTES = 1_048_576; // 1 MiB

function isInsideRoot(rootReal: string, candidateReal: string): boolean {
  const rel = path.relative(rootReal, candidateReal);
  return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
}

/**
 * Resolve a user/check-relative path so it cannot escape `root`.
 * Returns null when the path would leave the scan root (before following links).
 */
export function resolveContainedPath(
  root: string,
  relativePath: string,
): string | null {
  if (!relativePath || relativePath === ".") {
    return path.resolve(root);
  }
  if (path.isAbsolute(relativePath)) return null;
  const rootResolved = path.resolve(root);
  const candidate = path.resolve(rootResolved, relativePath);
  const rel = path.relative(rootResolved, candidate);
  if (rel.startsWith("..") || path.isAbsolute(rel)) return null;
  return candidate;
}

async function realRoot(root: string): Promise<string> {
  try {
    return await realpath(root);
  } catch {
    return path.resolve(root);
  }
}

async function resolveRealInside(
  rootResolved: string,
  relativePath: string,
): Promise<string | null> {
  const candidate = resolveContainedPath(rootResolved, relativePath);
  if (!candidate) return null;
  try {
    const rootReal = await realRoot(rootResolved);
    const fileReal = await realpath(candidate);
    if (!isInsideRoot(rootReal, fileReal)) return null;
    return fileReal;
  } catch {
    return null;
  }
}

export function createFsContext(root: string, url: string | null): CheckContext {
  const rootResolved = path.resolve(root);

  return {
    root: rootResolved,
    url,
    async readText(relativePath) {
      const fileReal = await resolveRealInside(rootResolved, relativePath);
      if (!fileReal) return null;

      try {
        const info = await stat(fileReal);
        if (!info.isFile()) return null;
        if (info.size > MAX_READ_BYTES) return null;

        const handle = await open(fileReal, "r");
        try {
          const buf = Buffer.alloc(Number(info.size));
          const { bytesRead } = await handle.read(buf, 0, buf.length, 0);
          return buf.subarray(0, bytesRead).toString("utf8");
        } finally {
          await handle.close();
        }
      } catch {
        return null;
      }
    },
    async exists(relativePath) {
      const fileReal = await resolveRealInside(rootResolved, relativePath);
      if (!fileReal) return false;
      try {
        const info = await stat(fileReal);
        return info.isFile() || info.isDirectory();
      } catch {
        return false;
      }
    },
    async isDirectory(relativePath) {
      const fileReal = await resolveRealInside(rootResolved, relativePath);
      if (!fileReal) return false;
      try {
        const info = await stat(fileReal);
        return info.isDirectory();
      } catch {
        return false;
      }
    },
    async listDir(relativePath) {
      const dirReal = await resolveRealInside(rootResolved, relativePath);
      if (!dirReal) return [];
      try {
        const info = await stat(dirReal);
        if (!info.isDirectory()) return [];
        return await readdir(dirReal);
      } catch {
        return [];
      }
    },
  };
}
