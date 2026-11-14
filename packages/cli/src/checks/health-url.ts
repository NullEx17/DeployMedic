import type { Finding } from "@deploymedic/core";
import type { Check } from "../types.js";
import { validateProbeUrl } from "../url.js";

export const healthUrlCheck: Check = {
  id: "health-url",
  service: "http",
  description: "Probes an optional --url for HTTP reachability",
  async run(ctx) {
    if (!ctx.url) {
      return {
        checkId: "health-url",
        findings: [],
        skipped: true,
        skipReason: "No --url provided",
      };
    }

    const findings: Finding[] = [];
    const validated = validateProbeUrl(ctx.url);
    if (!validated.ok) {
      findings.push({
        id: "HTTP-001",
        checkId: "health-url",
        severity: "fail",
        service: "http",
        title: "URL probe rejected",
        description: "The provided --url failed DeployMedic's probe URL policy.",
        evidence: validated.reason,
        impact: "No HTTP probe was performed.",
        remediation: "Pass an absolute http:// or https:// URL.",
        docsPath: "/docs/checks#health-url",
      });
      return { checkId: "health-url", findings };
    }

    let response: Response;
    const started = Date.now();

    try {
      response = await fetch(validated.url, {
        method: "GET",
        redirect: "follow",
        signal: AbortSignal.timeout(10_000),
        headers: { Accept: "text/plain, application/json, */*" },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      findings.push({
        id: "HTTP-001",
        checkId: "health-url",
        severity: "fail",
        service: "http",
        title: "URL probe failed",
        description: `Could not complete an HTTP GET to the provided URL.`,
        evidence: `GET ${ctx.url} — ${message}`,
        impact: "The deployment endpoint is unreachable from this machine.",
        remediation:
          "Confirm the service is running, the URL is correct, and firewall/DNS allow access.",
        docsPath: "/docs/checks#health-url",
      });
      return { checkId: "health-url", findings };
    }

    const ms = Date.now() - started;
    const status = response.status;

    if (status >= 500) {
      findings.push({
        id: "HTTP-001",
        checkId: "health-url",
        severity: "fail",
        service: "http",
        title: "URL returned a server error",
        description: "The probed URL responded with a 5xx status.",
        evidence: `GET ${ctx.url} → ${status} in ${ms}ms`,
        impact: "Clients hitting this endpoint will fail.",
        remediation:
          "Inspect application logs for the failing request path and fix the underlying error.",
        docsPath: "/docs/checks#health-url",
      });
    } else if (status >= 400) {
      findings.push({
        id: "HTTP-001",
        checkId: "health-url",
        severity: "warning",
        service: "http",
        title: "URL returned a client error",
        description:
          "The probed URL responded with a 4xx status. This may be expected for protected roots.",
        evidence: `GET ${ctx.url} → ${status} in ${ms}ms`,
        impact:
          "If this URL is meant to be a public health endpoint, probes will treat the service as unhealthy.",
        remediation:
          "Point --url at a dedicated health/readiness path that returns 2xx when ready.",
        docsPath: "/docs/checks#health-url",
      });
    } else {
      findings.push({
        id: "HTTP-001",
        checkId: "health-url",
        severity: "pass",
        service: "http",
        title: "URL responded successfully",
        description: "The probed URL returned a successful HTTP status.",
        evidence: `GET ${ctx.url} → ${status} in ${ms}ms`,
        impact: "None.",
        remediation: "No action required.",
        docsPath: "/docs/checks#health-url",
      });
    }

    return { checkId: "health-url", findings };
  },
};
