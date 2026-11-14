import type { Finding } from "@deploymedic/core";
import type { Check } from "../types.js";

export const nodeVersionCheck: Check = {
  id: "node-version",
  service: "node",
  description: "Looks for pinned Node version files",
  async run(ctx) {
    const findings: Finding[] = [];
    const hasPackageJson = await ctx.exists("package.json");
    if (!hasPackageJson) {
      return {
        checkId: "node-version",
        findings: [],
        skipped: true,
        skipReason: "No package.json at scan root",
      };
    }

    const pins: { file: string; value: string }[] = [];
    for (const file of [".nvmrc", ".node-version"]) {
      const text = await ctx.readText(file);
      if (text?.trim()) pins.push({ file, value: text.trim().split(/\r?\n/)[0] ?? "" });
    }

    const packageText = await ctx.readText("package.json");
    let enginesNode: string | null = null;
    if (packageText) {
      try {
        const pkg = JSON.parse(packageText) as { engines?: { node?: string } };
        enginesNode = pkg.engines?.node ?? null;
      } catch {
        // package-json check owns parse failures
      }
    }

    if (pins.length === 0 && !enginesNode) {
      findings.push({
        id: "NOD-001",
        checkId: "node-version",
        severity: "warning",
        service: "node",
        title: "No Node version pin",
        description:
          "No .nvmrc, .node-version, or engines.node was found to pin the runtime.",
        evidence: "Checked .nvmrc, .node-version, and engines.node — none set.",
        impact: "CI and hosts may use a different Node major than developers.",
        remediation:
          "Add an .nvmrc (or engines.node) matching the version you test against.",
        docsPath: "/docs/checks#node-version",
      });
      return { checkId: "node-version", findings };
    }

    const evidenceParts = [
      ...pins.map((p) => `${p.file}=${p.value}`),
      enginesNode ? `engines.node=${enginesNode}` : null,
    ].filter(Boolean);

    findings.push({
      id: "NOD-001",
      checkId: "node-version",
      severity: "pass",
      service: "node",
      title: "Node version pin found",
      description: "At least one Node version pin is present.",
      evidence: evidenceParts.join("; "),
      impact: "None.",
      remediation: "No action required.",
      docsPath: "/docs/checks#node-version",
    });

    return { checkId: "node-version", findings };
  },
};
