import {
  mkdtempSync,
  rmSync,
  writeFileSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function run(cmd, args, cwd) {
  const result = spawnSync(cmd, args, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, NODE_TLS_REJECT_UNAUTHORIZED: "0" },
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    console.error(result.stdout);
    console.error(result.stderr);
    throw new Error(`${cmd} ${args.join(" ")} failed with ${result.status}`);
  }
  return result.stdout;
}

console.log("Building publishable packages…");
run("npm", ["run", "build:core"], root);
run("npm", ["run", "build:cli"], root);

console.log("\n=== npm pack --dry-run @deploymedic/core ===");
console.log(run("npm", ["pack", "--dry-run", "-w", "@deploymedic/core"], root));

console.log("\n=== npm pack --dry-run @deploymedic/cli ===");
console.log(run("npm", ["pack", "--dry-run", "-w", "@deploymedic/cli"], root));

const staging = mkdtempSync(path.join(tmpdir(), "dm-pack-"));
const installDir = mkdtempSync(path.join(tmpdir(), "dm-install-"));

try {
  console.log("\nPacking tarballs into", staging);
  run("npm", ["pack", "-w", "@deploymedic/core", "--pack-destination", staging], root);
  run("npm", ["pack", "-w", "@deploymedic/cli", "--pack-destination", staging], root);

  const tarballs = readdirSync(staging)
    .filter((f) => f.endsWith(".tgz"))
    .map((f) => path.join(staging, f));
  if (tarballs.length < 2) {
    throw new Error(`Expected 2 tarballs, found ${tarballs.length}`);
  }

  run("npm", ["init", "-y"], installDir);
  const pkgPath = path.join(installDir, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  pkg.type = "module";
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

  console.log("Installing", tarballs.map((t) => path.basename(t)).join(", "));
  run("npm", ["install", ...tarballs], installDir);

  const bin = path.join(
    installDir,
    "node_modules",
    "@deploymedic",
    "cli",
    "dist",
    "bin.js",
  );
  const sample = path.join(root, "fixtures", "sample-healthy");
  const scan = spawnSync(
    process.execPath,
    [bin, "scan", sample, "--color", "never"],
    {
      encoding: "utf8",
      env: { ...process.env, NO_COLOR: "1" },
    },
  );
  console.log(scan.stdout.split(/\r?\n/).slice(0, 8).join("\n"));
  if (scan.status !== 0) {
    console.error(scan.stderr);
    throw new Error(`tarball CLI scan failed with ${scan.status}`);
  }
  console.log("\nTarball CLI scan OK (exit 0)");
} finally {
  rmSync(staging, { recursive: true, force: true });
  rmSync(installDir, { recursive: true, force: true });
}

console.log("verify-pack completed successfully");
