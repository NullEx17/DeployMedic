import type { Finding } from "@deploymedic/core";
import type { Check } from "../types.js";

const PORT_PATTERNS = [
  /process\.env\.PORT/g,
  /listen\(\s*(\d{2,5})\s*[,)]/g,
  /PORT\s*=\s*(\d{2,5})/g,
];

export const portConfigCheck: Check = {
  id: "port-config",
  service: "runtime",
  description: "Looks for hardcoded ports vs PORT env usage in common entry files",
  async run(ctx) {
    const candidates = [
      "server.js",
      "server.ts",
      "index.js",
      "index.ts",
      "src/index.js",
      "src/index.ts",
      "src/server.js",
      "src/server.ts",
      "app.js",
      "app.ts",
      "src/app.js",
      "src/app.ts",
      "main.go",
      "cmd/server/main.go",
    ];

    const inspected: { file: string; text: string }[] = [];
    for (const file of candidates) {
      const text = await ctx.readText(file);
      if (text) inspected.push({ file, text });
    }

    if (inspected.length === 0) {
      return {
        checkId: "port-config",
        findings: [],
        skipped: true,
        skipReason: "No common entry files found to inspect for port binding",
      };
    }

    const findings: Finding[] = [];
    let usesEnvPort = false;
    const hardcoded: string[] = [];

    for (const { file, text } of inspected) {
      if (/process\.env\.PORT|os\.Getenv\("PORT"\)|env\("PORT"\)|ENV\{PORT\}/.test(text)) {
        usesEnvPort = true;
      }
      for (const match of text.matchAll(/listen\(\s*(\d{2,5})\s*[,)]/g)) {
        hardcoded.push(`${file}: listen(${match[1]})`);
      }
      for (const match of text.matchAll(/:\s*(\d{4,5})\b/g)) {
        const port = match[1] ?? "";
        if (["3000", "8080", "8000", "5000", "4000"].includes(port)) {
          // weak signal only — ignore alone; reserved for evidence when no env
        }
      }
      void PORT_PATTERNS;
    }

    if (usesEnvPort) {
      findings.push({
        id: "PRT-001",
        checkId: "port-config",
        severity: "pass",
        service: "runtime",
        title: "Listens via PORT environment variable",
        description: "Entry files reference PORT from the environment.",
        evidence: `Inspected: ${inspected.map((i) => i.file).join(", ")}`,
        impact: "None.",
        remediation: "No action required.",
        docsPath: "/docs/checks#port-config",
      });
    } else if (hardcoded.length > 0) {
      findings.push({
        id: "PRT-001",
        checkId: "port-config",
        severity: "fail",
        service: "runtime",
        title: "Hardcoded listen port",
        description:
          "The process appears to bind a fixed port instead of reading PORT from the environment.",
        evidence: hardcoded.slice(0, 5).join("; "),
        impact:
          "Hosts that inject PORT (Heroku, Render, many containers) will fail health checks or refuse to bind.",
        remediation:
          "Bind to `process.env.PORT` (or equivalent) and keep a local default only as fallback.",
        docsPath: "/docs/checks#port-config",
      });
    } else {
      findings.push({
        id: "PRT-001",
        checkId: "port-config",
        severity: "unknown",
        service: "runtime",
        title: "Port binding not conclusively detected",
        description:
          "Entry files were found, but DeployMedic could not confirm PORT usage or a hardcoded listen port.",
        evidence: `Inspected: ${inspected.map((i) => i.file).join(", ")}`,
        impact: "Port misconfiguration may still exist outside the scanned entry files.",
        remediation:
          "Confirm your server binds to the platform-provided PORT. Re-run after pointing the scan at the correct root.",
        docsPath: "/docs/checks#port-config",
      });
    }

    return { checkId: "port-config", findings };
  },
};
