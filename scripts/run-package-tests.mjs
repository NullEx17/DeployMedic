import { readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

// Cross-platform: Linux CI does not expand nested test globs in npm scripts.
function collectTests(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      collectTests(full, out);
    } else if (entry.name.endsWith(".test.ts")) {
      out.push(full);
    }
  }
  return out;
}

const srcDir = resolve(process.cwd(), process.argv[2] ?? "src");
const files = collectTests(srcDir).sort();

if (files.length === 0) {
  console.error(`No *.test.ts files found under ${srcDir}`);
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  ["--import", "tsx", "--test", ...files],
  { stdio: "inherit" },
);

process.exit(result.status ?? 1);
