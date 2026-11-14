import assert from "node:assert/strict";
import { mkdtemp, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { runScan } from "./scan.js";

describe("runScan", () => {
  it("flags missing lockfile and unignored env on a broken Node project", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "deploymedic-"));
    await writeFile(
      path.join(root, "package.json"),
      JSON.stringify({ name: "broken-app", scripts: {} }, null, 2),
    );
    await writeFile(path.join(root, ".gitignore"), "node_modules\n");
    await writeFile(
      path.join(root, "Dockerfile"),
      "FROM node:20\nCOPY . .\nCMD [\"node\", \"index.js\"]\n",
    );

    const report = await runScan({ root });
    assert.ok(report.summary.fail >= 1);
    assert.ok(report.findings.some((f) => f.id === "LCK-001" && f.severity === "fail"));
    assert.ok(report.findings.some((f) => f.id === "GIT-001" && f.severity === "fail"));
    assert.equal(report.version, "1.0.0");
    assert.equal(report.tool, "deploymedic");
  });

  it("passes core node checks on a healthy project", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "deploymedic-"));
    await writeFile(
      path.join(root, "package.json"),
      JSON.stringify(
        {
          name: "healthy-app",
          engines: { node: ">=20" },
          scripts: { start: "node server.js", build: "echo ok" },
        },
        null,
        2,
      ),
    );
    await writeFile(path.join(root, "package-lock.json"), "{}\n");
    await writeFile(path.join(root, ".nvmrc"), "20\n");
    await writeFile(path.join(root, ".gitignore"), "node_modules\n.env\n.env.*\n");
    await writeFile(path.join(root, ".env.example"), "PORT=\nDATABASE_URL=\n");
    await writeFile(path.join(root, ".env"), "PORT=3000\nDATABASE_URL=postgres://local\n");
    await writeFile(
      path.join(root, "server.js"),
      'const port = process.env.PORT || 3000;\nconsole.log(port);\n',
    );
    await mkdir(path.join(root, "nested"), { recursive: true });

    const report = await runScan({ root, only: ["package-json", "lockfile", "gitignore", "env-example", "node-version", "port-config"] });
    assert.equal(report.summary.fail, 0);
    assert.ok(report.summary.pass >= 4);
  });
});
