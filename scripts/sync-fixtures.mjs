import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bin = path.join(root, "packages/cli/dist/bin.js");

function scan(target, outRel) {
  const result = spawnSync(
    process.execPath,
    [bin, "scan", target, "--json", "--color", "never"],
    { encoding: "utf8", cwd: root },
  );
  if (result.status !== 0 && result.status !== 1) {
    console.error(result.stderr || result.stdout);
    process.exit(result.status ?? 2);
  }
  // Normalize target.path to the relative fixture path (never absolute host paths).
  const report = JSON.parse(result.stdout);
  report.target = { ...report.target, path: target.replace(/\\/g, "/") };
  const out = path.join(root, outRel);
  writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`);
  return out;
}

const broken = scan("fixtures/sample-broken", "fixtures/broken-report.json");
const healthy = scan("fixtures/sample-healthy", "fixtures/healthy-report.json");

for (const dir of ["apps/web/data", "apps/web/public/examples"]) {
  mkdirSync(path.join(root, dir), { recursive: true });
}

for (const file of [broken, healthy]) {
  const base = path.basename(file);
  copyFileSync(file, path.join(root, "apps/web/data", base));
  copyFileSync(file, path.join(root, "apps/web/public/examples", base));
}

console.log("Synced broken + healthy report fixtures to apps/web.");
