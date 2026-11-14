import {
  MAX_REPORT_JSON_BYTES,
  ScanReportSchema,
  type ScanReport,
  summarizeFindings,
} from "./schema.js";

export type ValidationSuccess = {
  ok: true;
  report: ScanReport;
  warnings: string[];
};

export type ValidationFailure = {
  ok: false;
  errors: string[];
};

export type ValidationResult = ValidationSuccess | ValidationFailure;

/**
 * Parse and validate a DeployMedic scan report entirely in-memory.
 * Does not execute embedded content or fetch remote resources.
 */
export function validateScanReport(input: unknown): ValidationResult {
  const parsed = ScanReportSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map((issue) => {
        const path =
          issue.path.length > 0
            ? issue.path.map(String).join(".")
            : "(root)";
        return `${path}: ${issue.message}`;
      }),
    };
  }

  const report = parsed.data;
  const warnings: string[] = [];
  const computed = summarizeFindings(report.findings);

  if (
    computed.pass !== report.summary.pass ||
    computed.warning !== report.summary.warning ||
    computed.fail !== report.summary.fail ||
    computed.unknown !== report.summary.unknown ||
    computed.total !== report.summary.total
  ) {
    warnings.push(
      "summary counts do not match findings; viewer will display recomputed counts",
    );
  }

  if (report.meta.incomplete && report.meta.incompleteReasons.length === 0) {
    warnings.push("report is marked incomplete but lists no incompleteReasons");
  }

  return { ok: true, report, warnings };
}

export function parseScanReportJson(text: string): ValidationResult {
  if (text.length > MAX_REPORT_JSON_BYTES) {
    return {
      ok: false,
      errors: [
        `Report JSON exceeds ${MAX_REPORT_JSON_BYTES} character limit (${text.length} characters).`,
      ],
    };
  }
  let data: unknown;
  try {
    data = JSON.parse(text) as unknown;
  } catch {
    return { ok: false, errors: ["File is not valid JSON."] };
  }
  return validateScanReport(data);
}
