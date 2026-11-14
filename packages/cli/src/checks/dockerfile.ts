import type { Finding } from "@deploymedic/core";
import type { Check } from "../types.js";

export const dockerfileCheck: Check = {
  id: "dockerfile",
  service: "container",
  description: "Inspects Dockerfile for common deploy pitfalls",
  async run(ctx) {
    const findings: Finding[] = [];
    const names = ["Dockerfile", "dockerfile", "Dockerfile.prod"];
    let text: string | null = null;
    let name = "";

    for (const candidate of names) {
      const content = await ctx.readText(candidate);
      if (content) {
        text = content;
        name = candidate;
        break;
      }
    }

    if (!text) {
      return {
        checkId: "dockerfile",
        findings: [],
        skipped: true,
        skipReason: "No Dockerfile at scan root",
      };
    }

    const lines = text.split(/\r?\n/);
    const upper = text.toUpperCase();
    const hasHealthcheck = upper.includes("HEALTHCHECK");
    const hasUser = lines.some((l) => /^\s*USER\s+/i.test(l) && !/^\s*USER\s+root\s*$/i.test(l));
    const runsAsRootExplicit = lines.some((l) => /^\s*USER\s+root\s*$/i.test(l));
    const hasExpose = lines.some((l) => /^\s*EXPOSE\s+/i.test(l));

    findings.push({
      id: "DOC-001",
      checkId: "dockerfile",
      severity: "pass",
      service: "container",
      title: "Dockerfile found",
      description: `Inspected ${name} for common deployment pitfalls.`,
      evidence: `${name}: ${lines.filter((l) => l.trim() && !l.trim().startsWith("#")).length} instruction lines.`,
      impact: "None.",
      remediation: "No action required.",
      docsPath: "/docs/checks#dockerfile",
    });

    if (!hasHealthcheck) {
      findings.push({
        id: "DOC-002",
        checkId: "dockerfile",
        severity: "warning",
        service: "container",
        title: "No HEALTHCHECK instruction",
        description:
          "Without HEALTHCHECK (or an equivalent platform health probe), orchestrators may route traffic to an unhealthy container.",
        evidence: `${name} contains no HEALTHCHECK instruction.`,
        impact: "Failed processes can remain in rotation until a manual restart.",
        remediation:
          "Add a HEALTHCHECK that probes your app's readiness endpoint, or configure an equivalent probe on your host.",
        docsPath: "/docs/checks#dockerfile",
      });
    } else {
      findings.push({
        id: "DOC-002",
        checkId: "dockerfile",
        severity: "pass",
        service: "container",
        title: "HEALTHCHECK present",
        description: "Dockerfile declares a HEALTHCHECK instruction.",
        evidence: "Found HEALTHCHECK in Dockerfile.",
        impact: "None.",
        remediation: "No action required.",
        docsPath: "/docs/checks#dockerfile",
      });
    }

    if (runsAsRootExplicit || !hasUser) {
      findings.push({
        id: "DOC-003",
        checkId: "dockerfile",
        severity: "warning",
        service: "container",
        title: runsAsRootExplicit ? "Container runs as root explicitly" : "No non-root USER",
        description:
          "Running the process as root increases blast radius if the container is compromised.",
        evidence: runsAsRootExplicit
          ? "Found USER root."
          : "No USER instruction selecting a non-root user.",
        impact: "Privilege escalation risk inside the container namespace.",
        remediation: "Create a non-root user in the image and add `USER` before the final CMD/ENTRYPOINT.",
        docsPath: "/docs/checks#dockerfile",
      });
    } else {
      findings.push({
        id: "DOC-003",
        checkId: "dockerfile",
        severity: "pass",
        service: "container",
        title: "Non-root USER configured",
        description: "Dockerfile switches to a non-root user.",
        evidence: "Found a non-root USER instruction.",
        impact: "None.",
        remediation: "No action required.",
        docsPath: "/docs/checks#dockerfile",
      });
    }

    if (!hasExpose) {
      findings.push({
        id: "DOC-004",
        checkId: "dockerfile",
        severity: "unknown",
        service: "container",
        title: "No EXPOSE instruction",
        description:
          "EXPOSE is documentation for the published port. Its absence is not always a failure, but platforms may misconfigure port mapping.",
        evidence: `${name} has no EXPOSE line.`,
        impact: "Operators may guess the wrong container port.",
        remediation: "Add `EXPOSE <port>` matching the port your process listens on.",
        docsPath: "/docs/checks#dockerfile",
      });
    }

    return { checkId: "dockerfile", findings };
  },
};
