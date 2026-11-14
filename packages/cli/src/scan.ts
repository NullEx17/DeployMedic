import path from "node:path";
import {
  REPORT_VERSION,
  TOOL_NAME,
  sortFindings,
  summarizeFindings,
  type ScanReport,
} from "@deploymedic/core";
import { CHECKS } from "./checks/index.js";
import { createFsContext } from "./fs.js";
import { CLI_VERSION } from "./version.js";

export type ScanOptions = {
  root: string;
  url?: string | null;
  only?: string[];
};

/** Prefer the operator-facing path when relative so shared reports stay portable. */
function displayTargetPath(input: string): string {
  if (path.isAbsolute(input)) return path.resolve(input);
  return input.replace(/\\/g, "/");
}

export async function runScan(options: ScanOptions): Promise<ScanReport> {
  const root = path.resolve(options.root);
  const url = options.url ?? null;
  const ctx = createFsContext(root, url);
  const started = Date.now();

  const selected = options.only?.length
    ? CHECKS.filter((c) => options.only!.includes(c.id))
    : CHECKS;

  const checksRun: string[] = [];
  const checksSkipped: string[] = [];
  const incompleteReasons: string[] = [];
  const findings = [];

  for (const check of selected) {
    const result = await check.run(ctx);
    if (result.skipped) {
      checksSkipped.push(check.id);
      if (result.skipReason) {
        // Skips for missing optional files are normal; only mark incomplete for
        // cases where the operator asked for something we could not do.
        if (check.id === "health-url" && url) {
          incompleteReasons.push(result.skipReason);
        }
      }
      continue;
    }
    checksRun.push(check.id);
    findings.push(...result.findings);
  }

  // Any unknown-severity findings imply incomplete knowledge.
  const hasUnknown = findings.some((f) => f.severity === "unknown");
  if (hasUnknown) {
    incompleteReasons.push(
      "One or more findings have severity unknown — evidence was insufficient for a definitive pass/fail.",
    );
  }

  const sorted = sortFindings(findings);
  const summary = summarizeFindings(sorted);

  return {
    version: REPORT_VERSION,
    tool: TOOL_NAME,
    toolVersion: CLI_VERSION,
    generatedAt: new Date().toISOString(),
    target: { path: displayTargetPath(options.root), url },
    summary,
    findings: sorted,
    meta: {
      incomplete: incompleteReasons.length > 0,
      incompleteReasons: [...new Set(incompleteReasons)],
      checksRun,
      checksSkipped,
      durationMs: Date.now() - started,
    },
  };
}
