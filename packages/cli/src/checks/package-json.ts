import type { Finding } from "@deploymedic/core";
import type { Check } from "../types.js";

type PackageJson = {
  name?: string;
  scripts?: Record<string, string>;
  engines?: { node?: string };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

function parsePackageJson(text: string): PackageJson | null {
  try {
    return JSON.parse(text) as PackageJson;
  } catch {
    return null;
  }
}

export const packageJsonCheck: Check = {
  id: "package-json",
  service: "node",
  description: "Validates package.json presence, scripts, and engines",
  async run(ctx) {
    const findings: Finding[] = [];
    const text = await ctx.readText("package.json");

    if (!text) {
      findings.push({
        id: "PKG-001",
        checkId: "package-json",
        severity: "unknown",
        service: "node",
        title: "No package.json at scan root",
        description:
          "DeployMedic looks for a Node.js package.json at the scan root. None was found.",
        evidence: `Looked for ${ctx.root}/package.json — file not present.`,
        impact:
          "Node-specific checks cannot run. This is expected for non-Node projects.",
        remediation:
          "If this is a Node project, run the scan from the directory that contains package.json.",
        docsPath: "/docs/checks#package-json",
      });
      return { checkId: "package-json", findings };
    }

    const pkg = parsePackageJson(text);
    if (!pkg) {
      findings.push({
        id: "PKG-002",
        checkId: "package-json",
        severity: "fail",
        service: "node",
        title: "package.json is not valid JSON",
        description: "The package.json file could not be parsed as JSON.",
        evidence: "JSON.parse failed on package.json contents.",
        impact: "Install and deploy tooling cannot read scripts or dependencies.",
        remediation: "Fix the JSON syntax in package.json, then re-run the scan.",
        docsPath: "/docs/checks#package-json",
      });
      return { checkId: "package-json", findings };
    }

    findings.push({
      id: "PKG-001",
      checkId: "package-json",
      severity: "pass",
      service: "node",
      title: "package.json present and parseable",
      description: "A valid package.json was found at the scan root.",
      evidence: `Parsed package.json${pkg.name ? ` (name: ${pkg.name})` : ""}.`,
      impact: "None.",
      remediation: "No action required.",
      docsPath: "/docs/checks#package-json",
    });

    const scripts = pkg.scripts ?? {};
    const hasStart = Boolean(scripts.start);
    const hasBuild = Boolean(scripts.build);

    if (!hasStart && !hasBuild) {
      findings.push({
        id: "PKG-003",
        checkId: "package-json",
        severity: "warning",
        service: "node",
        title: "No start or build script",
        description:
          "Many platforms invoke npm start or npm run build. Neither script is defined.",
        evidence: `scripts keys: ${Object.keys(scripts).join(", ") || "(none)"}`,
        impact:
          "Platforms that expect start/build may fail or fall back to unpredictable defaults.",
        remediation:
          'Add a "start" and/or "build" script appropriate for your runtime, or document the custom start command in your platform config.',
        docsPath: "/docs/checks#package-json",
      });
    } else {
      findings.push({
        id: "PKG-003",
        checkId: "package-json",
        severity: "pass",
        service: "node",
        title: "Deploy-oriented scripts present",
        description: hasStart
          ? 'A "start" script is defined.'
          : 'A "build" script is defined (no "start").',
        evidence: `start=${hasStart ? "yes" : "no"}, build=${hasBuild ? "yes" : "no"}`,
        impact: "None.",
        remediation: "No action required.",
        docsPath: "/docs/checks#package-json",
      });
    }

    if (!pkg.engines?.node) {
      findings.push({
        id: "PKG-004",
        checkId: "package-json",
        severity: "warning",
        service: "node",
        title: "engines.node not declared",
        description:
          "No engines.node field was found. Hosts may pick a Node version that does not match local development.",
        evidence: "package.json has no engines.node.",
        impact: "Subtle runtime mismatches between local and production Node versions.",
        remediation:
          'Add "engines": { "node": ">=20" } (or your required range) and pin the same version in your host settings.',
        docsPath: "/docs/checks#package-json",
      });
    } else {
      findings.push({
        id: "PKG-004",
        checkId: "package-json",
        severity: "pass",
        service: "node",
        title: "engines.node declared",
        description: "package.json declares a Node engine range.",
        evidence: `engines.node = ${pkg.engines.node}`,
        impact: "None.",
        remediation: "No action required.",
        docsPath: "/docs/checks#package-json",
      });
    }

    return { checkId: "package-json", findings };
  },
};
