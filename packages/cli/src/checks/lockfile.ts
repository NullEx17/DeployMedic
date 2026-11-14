import type { Finding } from "@deploymedic/core";
import type { Check } from "../types.js";

const LOCKFILES = [
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "bun.lock",
  "bun.lockb",
] as const;

export const lockfileCheck: Check = {
  id: "lockfile",
  service: "node",
  description: "Ensures a package manager lockfile is committed",
  async run(ctx) {
    const findings: Finding[] = [];
    const hasPackageJson = await ctx.exists("package.json");
    if (!hasPackageJson) {
      return {
        checkId: "lockfile",
        findings: [],
        skipped: true,
        skipReason: "No package.json at scan root",
      };
    }

    const present: string[] = [];
    for (const name of LOCKFILES) {
      if (await ctx.exists(name)) present.push(name);
    }

    if (present.length === 0) {
      findings.push({
        id: "LCK-001",
        checkId: "lockfile",
        severity: "fail",
        service: "node",
        title: "No lockfile found",
        description:
          "A Node project without a lockfile produces non-reproducible installs on deploy hosts.",
        evidence: `Checked for ${LOCKFILES.join(", ")} — none present.`,
        impact: "Production dependency trees can diverge from local installs and break builds.",
        remediation:
          "Commit the lockfile for your package manager (npm, pnpm, yarn, or bun).",
        docsPath: "/docs/checks#lockfile",
      });
    } else if (present.length > 1) {
      findings.push({
        id: "LCK-001",
        checkId: "lockfile",
        severity: "warning",
        service: "node",
        title: "Multiple lockfiles present",
        description:
          "More than one package manager lockfile was found. Hosts may pick the wrong one.",
        evidence: `Found: ${present.join(", ")}`,
        impact: "Install commands may disagree with the lockfile the host selects.",
        remediation:
          "Keep a single lockfile that matches the package manager used in CI and production.",
        docsPath: "/docs/checks#lockfile",
      });
    } else {
      findings.push({
        id: "LCK-001",
        checkId: "lockfile",
        severity: "pass",
        service: "node",
        title: "Lockfile present",
        description: "A single package manager lockfile was found.",
        evidence: `Found ${present[0]}`,
        impact: "None.",
        remediation: "No action required.",
        docsPath: "/docs/checks#lockfile",
      });
    }

    return { checkId: "lockfile", findings };
  },
};
