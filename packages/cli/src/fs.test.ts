import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { createFsContext, resolveContainedPath } from "./fs.js";

describe("resolveContainedPath", () => {
  it("rejects parent-directory traversal", () => {
    const root = path.resolve("/tmp/project");
    assert.equal(resolveContainedPath(root, "../secret.env"), null);
    assert.equal(resolveContainedPath(root, "subdir/../../secret.env"), null);
  });

  it("allows normal relative files", () => {
    const root = path.resolve("/tmp/project");
    const resolved = resolveContainedPath(root, "package.json");
    assert.equal(resolved, path.resolve(root, "package.json"));
  });
});

describe("createFsContext read confinement", () => {
  it("does not read files outside the scan root via ../", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "dm-fs-"));
    const secretName = `${path.basename(root)}-secret.env`;
    const outside = path.join(root, "..", secretName);
    await writeFile(outside, "API_KEY=should-not-leak\n");
    await writeFile(path.join(root, "package.json"), '{"name":"x"}\n');

    const ctx = createFsContext(root, null);
    const leaked = await ctx.readText(`../${secretName}`);
    assert.equal(leaked, null);

    const ok = await ctx.readText("package.json");
    assert.match(ok ?? "", /"name"/);
  });
});
