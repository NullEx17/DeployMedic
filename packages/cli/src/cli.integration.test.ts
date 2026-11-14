import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, writeFile, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { createFsContext, MAX_READ_BYTES } from "./fs.js";
import { runScan } from "./scan.js";

const bin = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../dist/bin.js",
);

function runCli(args: string[], cwd?: string) {
  return spawnSync(process.execPath, [bin, ...args], {
    encoding: "utf8",
    cwd,
    env: { ...process.env, NO_COLOR: "1" },
  });
}

describe("CLI integration", () => {
  it("exits 1 for broken fixture and 0 for healthy fixture", () => {
    const broken = runCli([
      "scan",
      "fixtures/sample-broken",
      "--color",
      "never",
    ], path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../.."));
    assert.equal(broken.status, 1, broken.stderr || broken.stdout);

    const healthy = runCli([
      "scan",
      "fixtures/sample-healthy",
      "--color",
      "never",
    ], path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../.."));
    assert.equal(healthy.status, 0, healthy.stderr || healthy.stdout);
  });

  it("emits JSON with --json and rejects file:// --url with exit 2", () => {
    const root = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "../../..",
    );
    const json = runCli(
      ["scan", "fixtures/sample-healthy", "--json", "--color", "never"],
      root,
    );
    assert.equal(json.status, 0);
    const parsed = JSON.parse(json.stdout);
    assert.equal(parsed.tool, "deploymedic");
    assert.ok(Array.isArray(parsed.findings));

    const badUrl = runCli(
      [
        "scan",
        "fixtures/sample-healthy",
        "--only",
        "health-url",
        "--url",
        "file:///etc/passwd",
      ],
      root,
    );
    assert.equal(badUrl.status, 2);
    assert.match(badUrl.stderr, /Invalid --url|scheme/i);
  });

  it("report command exits 2 on malformed JSON", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "dm-cli-"));
    const file = path.join(dir, "bad.json");
    await writeFile(file, "{not-json");
    const result = runCli(["report", file, "--color", "never"]);
    assert.equal(result.status, 2);
  });
});

describe("security edge scans", () => {
  it("does not read oversized files", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "dm-big-"));
    const big = Buffer.alloc(MAX_READ_BYTES + 16, 0x61);
    await writeFile(path.join(root, "Dockerfile"), big);
    const ctx = createFsContext(root, null);
    assert.equal(await ctx.readText("Dockerfile"), null);
  });

  it("refuses symlink escape when the platform allows symlinks", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "dm-link-"));
    const outside = path.join(root, "..", `${path.basename(root)}-secret.env`);
    await writeFile(outside, "SECRET=1\n");
    try {
      await symlink(outside, path.join(root, ".env"));
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === "EPERM" || err.code === "EACCES") {
        // Windows without symlink privilege — skip without failing the suite.
        return;
      }
      throw error;
    }
    const ctx = createFsContext(root, null);
    assert.equal(await ctx.readText(".env"), null);
  });

  it("compose fixtures: healthy, broken healthchecks, malformed root", async () => {
    const healthy = await mkdtemp(path.join(tmpdir(), "dm-cmp-h-"));
    await writeFile(
      path.join(healthy, "compose.yml"),
      `services:
  api:
    image: node:20
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
  worker:
    image: node:20
    healthcheck:
      test: ["CMD", "true"]
`,
    );
    const healthyReport = await runScan({ root: healthy, only: ["compose"] });
    assert.equal(healthyReport.summary.fail, 0);
    assert.ok(
      healthyReport.findings.some(
        (f) => f.id === "CMP-002" && f.severity === "pass",
      ),
    );

    const broken = await mkdtemp(path.join(tmpdir(), "dm-cmp-b-"));
    await writeFile(
      path.join(broken, "docker-compose.yml"),
      `services:
  api:
    image: node:20
  db:
    image: postgres:16
`,
    );
    const brokenReport = await runScan({ root: broken, only: ["compose"] });
    assert.ok(
      brokenReport.findings.some(
        (f) => f.id === "CMP-002" && f.severity === "warning",
      ),
    );

    const malformed = await mkdtemp(path.join(tmpdir(), "dm-cmp-m-"));
    await writeFile(path.join(malformed, "compose.yaml"), "null\n");
    const malformedReport = await runScan({
      root: malformed,
      only: ["compose"],
    });
    assert.ok(malformedReport.summary.fail >= 1);

    const multi = await mkdtemp(path.join(tmpdir(), "dm-cmp-multi-"));
    await mkdir(path.join(multi, "proxy"), { recursive: true });
    await writeFile(
      path.join(multi, "docker-compose.yml"),
      `services:
  proxy:
    image: nginx:1.27
    ports:
      - "80:80"
  api:
    image: node:20
    environment:
      PORT: "3000"
`,
    );
    const multiReport = await runScan({ root: multi, only: ["compose"] });
    assert.ok(
      multiReport.findings.some((f) =>
        f.evidence.includes("proxy") || f.evidence.includes("api"),
      ),
    );
  });
});
