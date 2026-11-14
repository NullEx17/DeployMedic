import { parse as parseYaml } from "yaml";
import type { Finding } from "@deploymedic/core";
import type { Check } from "../types.js";

type ComposeFile = {
  services?: Record<
    string,
    {
      healthcheck?: unknown;
      ports?: unknown[];
      image?: string;
      build?: unknown;
    }
  >;
};

export const composeCheck: Check = {
  id: "compose",
  service: "container",
  description: "Inspects docker-compose for missing healthchecks",
  async run(ctx) {
    const findings: Finding[] = [];
    const names = [
      "docker-compose.yml",
      "docker-compose.yaml",
      "compose.yml",
      "compose.yaml",
    ];
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
        checkId: "compose",
        findings: [],
        skipped: true,
        skipReason: "No compose file at scan root",
      };
    }

    let parsed: unknown;
    try {
      parsed = parseYaml(text);
    } catch {
      findings.push({
        id: "CMP-001",
        checkId: "compose",
        severity: "fail",
        service: "container",
        title: "Compose file is not valid YAML",
        description: `${name} could not be parsed as YAML.`,
        evidence: "yaml.parse failed.",
        impact: "docker compose up will fail before containers start.",
        remediation: `Fix YAML syntax in ${name}.`,
        docsPath: "/docs/checks#compose",
      });
      return { checkId: "compose", findings };
    }

    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      findings.push({
        id: "CMP-001",
        checkId: "compose",
        severity: "fail",
        service: "container",
        title: "Compose file is not a mapping",
        description: `${name} parsed as YAML but the document root is not an object/mapping.`,
        evidence: `Root type: ${parsed === null ? "null" : Array.isArray(parsed) ? "array" : typeof parsed}`,
        impact: "docker compose cannot interpret this file as a project definition.",
        remediation: `Ensure ${name} starts with a mapping that includes a top-level services key.`,
        docsPath: "/docs/checks#compose",
      });
      return { checkId: "compose", findings };
    }

    const compose = parsed as ComposeFile;
    const rawServices = compose.services;
    if (
      rawServices !== undefined &&
      rawServices !== null &&
      (typeof rawServices !== "object" || Array.isArray(rawServices))
    ) {
      findings.push({
        id: "CMP-001",
        checkId: "compose",
        severity: "fail",
        service: "container",
        title: "Compose services is not a mapping",
        description: `${name} has a services field that is not a YAML mapping.`,
        evidence: `services type: ${Array.isArray(rawServices) ? "array" : typeof rawServices}`,
        impact: "docker compose cannot enumerate services from this file.",
        remediation: "Define services as a mapping of service-name to service-config.",
        docsPath: "/docs/checks#compose",
      });
      return { checkId: "compose", findings };
    }

    const services = (rawServices ?? {}) as NonNullable<ComposeFile["services"]>;
    const serviceNames = Object.keys(services);
    if (serviceNames.length === 0) {
      findings.push({
        id: "CMP-001",
        checkId: "compose",
        severity: "warning",
        service: "container",
        title: "Compose file has no services",
        description: `${name} parsed but defines no services.`,
        evidence: "services key missing or empty.",
        impact: "Compose cannot start an application stack from this file.",
        remediation: "Define at least one service under `services:`.",
        docsPath: "/docs/checks#compose",
      });
      return { checkId: "compose", findings };
    }

    const withoutHealth = serviceNames.filter((s) => !services[s]?.healthcheck);
    findings.push({
      id: "CMP-001",
      checkId: "compose",
      severity: "pass",
      service: "container",
      title: "Compose file parseable",
      description: `Found ${serviceNames.length} service(s) in ${name}.`,
      evidence: `Services: ${serviceNames.join(", ")}`,
      impact: "None.",
      remediation: "No action required.",
      docsPath: "/docs/checks#compose",
    });

    if (withoutHealth.length > 0) {
      findings.push({
        id: "CMP-002",
        checkId: "compose",
        severity: "warning",
        service: "container",
        title: "Services missing healthcheck",
        description:
          "Some services do not declare a healthcheck. Depends_on conditions and load balancers may not wait for readiness.",
        evidence: `No healthcheck on: ${withoutHealth.join(", ")}`,
        impact: "Dependent services may start against an unready upstream.",
        remediation:
          "Add a `healthcheck` block (or platform probe) for each long-running service that accepts traffic.",
        docsPath: "/docs/checks#compose",
      });
    } else {
      findings.push({
        id: "CMP-002",
        checkId: "compose",
        severity: "pass",
        service: "container",
        title: "All services declare healthcheck",
        description: "Every compose service includes a healthcheck.",
        evidence: `Checked ${serviceNames.length} service(s).`,
        impact: "None.",
        remediation: "No action required.",
        docsPath: "/docs/checks#compose",
      });
    }

    return { checkId: "compose", findings };
  },
};
