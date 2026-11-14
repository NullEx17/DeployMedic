import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { createFsContext } from "../fs.js";
import { composeCheck } from "./compose.js";

describe("composeCheck", () => {
  it("returns a fail finding instead of throwing when YAML root is null", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "dm-compose-"));
    await writeFile(path.join(root, "docker-compose.yml"), "null\n");
    const result = await composeCheck.run(createFsContext(root, null));
    assert.equal(result.skipped, undefined);
    assert.ok(result.findings.some((f) => f.severity === "fail"));
    assert.ok(
      result.findings.some((f) => /not a mapping/i.test(f.title)),
    );
  });

  it("still parses a normal compose mapping", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "dm-compose-"));
    await writeFile(
      path.join(root, "compose.yml"),
      "services:\n  api:\n    image: node:20\n    healthcheck:\n      test: [\"CMD\", \"true\"]\n",
    );
    const result = await composeCheck.run(createFsContext(root, null));
    assert.ok(result.findings.some((f) => f.id === "CMP-001" && f.severity === "pass"));
    assert.ok(result.findings.some((f) => f.id === "CMP-002" && f.severity === "pass"));
  });
});
