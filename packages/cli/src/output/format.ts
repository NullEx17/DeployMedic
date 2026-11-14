import type { Finding, ScanReport, Severity } from "@deploymedic/core";
import { createPalette, type Palette } from "./color.js";

const STATUS: Record<Severity, string> = {
  fail: "FAIL",
  warning: "WARN",
  pass: "PASS",
  unknown: "????",
};

function paintStatus(p: Palette, severity: Severity): string {
  const label = STATUS[severity];
  switch (severity) {
    case "fail":
      return p.fail(label);
    case "warning":
      return p.warning(label);
    case "pass":
      return p.pass(label);
    case "unknown":
      return p.unknown(label);
  }
}

function groupByService(findings: Finding[]): Map<string, Finding[]> {
  const map = new Map<string, Finding[]>();
  for (const finding of findings) {
    const list = map.get(finding.service) ?? [];
    list.push(finding);
    map.set(finding.service, list);
  }
  return map;
}

export function formatReportText(report: ScanReport, colorEnabled: boolean): string {
  const p = createPalette(colorEnabled);
  const lines: string[] = [];

  lines.push(p.bold(p.teal("DeployMedic")) + p.dim(` v${report.toolVersion}`));
  lines.push(
    p.dim(
      `target ${report.target.path}${report.target.url ? ` · url ${report.target.url}` : ""}`,
    ),
  );
  lines.push("");

  const { summary } = report;
  lines.push(
    [
      `${p.fail(`${summary.fail} fail`)}`,
      `${p.warning(`${summary.warning} warning`)}`,
      `${p.pass(`${summary.pass} pass`)}`,
      `${p.unknown(`${summary.unknown} unknown`)}`,
      p.dim(`(${summary.total} findings)`),
    ].join("  "),
  );

  if (report.meta.incomplete) {
    lines.push("");
    lines.push(p.warning("Incomplete scan"));
    for (const reason of report.meta.incompleteReasons) {
      lines.push(p.dim(`  • ${reason}`));
    }
  }

  lines.push("");

  const actionable = report.findings.filter((f) => f.severity !== "pass");
  const passes = report.findings.filter((f) => f.severity === "pass");
  const grouped = groupByService(actionable.length ? actionable : report.findings);

  for (const [service, findings] of grouped) {
    lines.push(p.bold(service));
    for (const finding of findings) {
      lines.push(
        `  ${paintStatus(p, finding.severity)}  ${p.dim(finding.id)}  ${finding.title}`,
      );
      if (finding.severity !== "pass") {
        lines.push(p.dim(`         evidence    ${collapse(finding.evidence)}`));
        lines.push(p.dim(`         remediate   ${collapse(finding.remediation)}`));
      }
    }
    lines.push("");
  }

  if (actionable.length && passes.length) {
    lines.push(p.dim(`${passes.length} passing check(s) omitted. Use --json for the full report.`));
    lines.push("");
  }

  if (report.meta.checksSkipped.length) {
    lines.push(
      p.dim(`skipped: ${report.meta.checksSkipped.join(", ")}`),
    );
  }
  if (report.meta.durationMs !== undefined) {
    lines.push(p.dim(`finished in ${report.meta.durationMs}ms`));
  }

  return lines.join("\n").trimEnd() + "\n";
}

function collapse(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function formatReportJson(report: ScanReport): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}

export function exitCodeForReport(report: ScanReport): number {
  if (report.summary.fail > 0) return 1;
  return 0;
}
