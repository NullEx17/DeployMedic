import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { createFsContext } from "../fs.js";
import {
  assessEnvIgnore,
  collectGitignoreFiles,
  isIgnoredPath,
  prefixGitignorePattern,
  type GitignoreFile,
} from "./match.js";

describe("prefixGitignorePattern", () => {
  it("keeps root patterns intact", () => {
    assert.deepEqual(prefixGitignorePattern("", ".env"), [".env"]);
    assert.deepEqual(prefixGitignorePattern("", "!.env.example"), [
      "!.env.example",
    ]);
  });

  it("prefixes nested no-slash patterns for directory scope", () => {
    assert.deepEqual(prefixGitignorePattern("apps/web", ".env"), [
      "apps/web/.env",
      "apps/web/**/.env",
    ]);
  });

  it("prefixes anchored nested patterns", () => {
    assert.deepEqual(prefixGitignorePattern("apps", "/.env"), ["apps/.env"]);
  });
});

describe("isIgnoredPath", () => {
  it("honors negation after a broad ignore", () => {
    const files: GitignoreFile[] = [
      {
        dir: "",
        content: ".env*\n!.env.example\n",
      },
    ];
    assert.equal(isIgnoredPath(files, ".env"), true);
    assert.equal(isIgnoredPath(files, ".env.local"), true);
    assert.equal(isIgnoredPath(files, ".env.example"), false);
  });

  it("applies nested gitignore only under that directory", () => {
    const files: GitignoreFile[] = [
      { dir: "", content: "node_modules\n" },
      { dir: "apps/api", content: ".env\n" },
    ];
    assert.equal(isIgnoredPath(files, "apps/api/.env"), true);
    assert.equal(isIgnoredPath(files, ".env"), false);
  });

  it("matches directory patterns for config/.env via **/.env style root rules", () => {
    const files: GitignoreFile[] = [{ dir: "", content: "**/.env\n.env\n" }];
    assert.equal(isIgnoredPath(files, "config/.env"), true);
    assert.equal(isIgnoredPath(files, ".env"), true);
  });
});

describe("collectGitignoreFiles + assessEnvIgnore", () => {
  it("discovers nested gitignore and assesses env probes", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "dm-gi-"));
    await writeFile(path.join(root, ".gitignore"), "node_modules\n");
    await mkdir(path.join(root, "apps", "api"), { recursive: true });
    await writeFile(path.join(root, "apps", "api", ".gitignore"), ".env\n.env.*\n");

    const ctx = createFsContext(root, null);
    const files = await collectGitignoreFiles(ctx);
    assert.ok(files.some((f) => f.dir === ""));
    assert.ok(files.some((f) => f.dir === "apps/api"));

    assert.equal(isIgnoredPath(files, "apps/api/.env"), true);
    assert.equal(isIgnoredPath(files, ".env"), false);

    const assessment = assessEnvIgnore([
      { dir: "", content: ".env\n.env.*\n!.env.example\n" },
    ]);
    assert.ok(assessment.ignoredSecrets.includes(".env"));
    assert.ok(assessment.ignoredSecrets.includes(".env.local"));
    assert.ok(assessment.examplesUnignored.includes(".env.example"));
  });
});
