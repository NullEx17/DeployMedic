import type { Finding } from "@deploymedic/core";
import type { Check } from "../types.js";

function parseEnvKeys(text: string): string[] {
  const keys: string[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    keys.push(line.slice(0, eq).trim());
  }
  return keys;
}

export const envExampleCheck: Check = {
  id: "env-example",
  service: "environment",
  description: "Checks for .env.example and compares keys to a local .env if present",
  async run(ctx) {
    const findings: Finding[] = [];
    const exampleNames = [".env.example", ".env.sample", ".env.template"];
    let exampleText: string | null = null;
    let exampleName = "";

    for (const name of exampleNames) {
      const text = await ctx.readText(name);
      if (text) {
        exampleText = text;
        exampleName = name;
        break;
      }
    }

    if (!exampleText) {
      findings.push({
        id: "ENV-001",
        checkId: "env-example",
        severity: "warning",
        service: "environment",
        title: "No environment template file",
        description:
          "No .env.example (or .env.sample / .env.template) was found. New environments lack a documented variable contract.",
        evidence: `Checked ${exampleNames.join(", ")} — none present.`,
        impact:
          "Deploy hosts may miss required variables; onboarding requires tribal knowledge.",
        remediation:
          "Commit an .env.example listing required keys with empty or placeholder values (never real secrets).",
        docsPath: "/docs/checks#env-example",
      });
      return { checkId: "env-example", findings };
    }

    const exampleKeys = parseEnvKeys(exampleText);
    findings.push({
      id: "ENV-001",
      checkId: "env-example",
      severity: "pass",
      service: "environment",
      title: "Environment template present",
      description: `Found ${exampleName} documenting expected variables.`,
      evidence: `${exampleName} defines ${exampleKeys.length} key(s): ${exampleKeys.slice(0, 12).join(", ")}${exampleKeys.length > 12 ? ", …" : ""}`,
      impact: "None.",
      remediation: "No action required.",
      docsPath: "/docs/checks#env-example",
    });

    const envText = await ctx.readText(".env");
    if (!envText) {
      findings.push({
        id: "ENV-002",
        checkId: "env-example",
        severity: "unknown",
        service: "environment",
        title: "Local .env not found for comparison",
        description:
          "A template exists, but no local .env was available to compare keys. DeployMedic does not invent missing values.",
        evidence: ".env not present at scan root (expected for CI or fresh clones).",
        impact:
          "Cannot verify whether this machine's environment matches the documented contract.",
        remediation:
          "Copy .env.example to .env and fill values locally, or set the same keys on your host.",
        docsPath: "/docs/checks#env-example",
      });
      return { checkId: "env-example", findings };
    }

    const envKeys = new Set(parseEnvKeys(envText));
    const missing = exampleKeys.filter((k) => !envKeys.has(k));

    if (missing.length > 0) {
      findings.push({
        id: "ENV-002",
        checkId: "env-example",
        severity: "fail",
        service: "environment",
        title: "Local .env missing keys from template",
        description:
          "Keys documented in the environment template are absent from the local .env.",
        evidence: `Missing keys: ${missing.join(", ")}`,
        impact:
          "Processes that read these variables may crash or behave incorrectly at runtime.",
        remediation: `Add the missing keys to .env (and to your deploy host): ${missing.join(", ")}`,
        docsPath: "/docs/checks#env-example",
      });
    } else {
      findings.push({
        id: "ENV-002",
        checkId: "env-example",
        severity: "pass",
        service: "environment",
        title: "Local .env covers template keys",
        description: "Every key in the environment template is present in .env.",
        evidence: `Compared ${exampleKeys.length} template key(s) against .env — none missing.`,
        impact: "None.",
        remediation: "No action required.",
        docsPath: "/docs/checks#env-example",
      });
    }

    return { checkId: "env-example", findings };
  },
};
