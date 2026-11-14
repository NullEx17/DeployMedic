import { z } from "zod";

export const REPORT_VERSION = "1.0.0" as const;
export const TOOL_NAME = "deploymedic" as const;

/** Hard caps to keep CLI/viewer validation bounded (DoS resistance). */
export const MAX_FINDINGS = 2_000;
export const MAX_STRING = 8_000;
export const MAX_ID_STRING = 200;
export const MAX_META_LIST = 500;
export const MAX_REPORT_JSON_BYTES = 2_097_152; // 2 MiB

export const SEVERITIES = ["pass", "warning", "fail", "unknown"] as const;
export type Severity = (typeof SEVERITIES)[number];
export const SeveritySchema = z.enum(SEVERITIES);

const BoundedText = z.string().min(1).max(MAX_STRING);
const BoundedId = z.string().min(1).max(MAX_ID_STRING);

export const FindingSchema = z.object({
  id: BoundedId,
  checkId: BoundedId,
  severity: SeveritySchema,
  service: BoundedId,
  title: BoundedText,
  description: BoundedText,
  evidence: BoundedText,
  impact: BoundedText,
  remediation: BoundedText,
  docsPath: z.string().max(MAX_ID_STRING).optional(),
});
export type Finding = z.infer<typeof FindingSchema>;

export const SummarySchema = z.object({
  pass: z.number().int().nonnegative().max(MAX_FINDINGS),
  warning: z.number().int().nonnegative().max(MAX_FINDINGS),
  fail: z.number().int().nonnegative().max(MAX_FINDINGS),
  unknown: z.number().int().nonnegative().max(MAX_FINDINGS),
  total: z.number().int().nonnegative().max(MAX_FINDINGS),
});
export type Summary = z.infer<typeof SummarySchema>;

export const TargetSchema = z.object({
  path: z.string().min(1).max(MAX_STRING),
  url: z
    .url()
    .refine((value) => value.length <= MAX_STRING, {
      error: `URL must be at most ${MAX_STRING} characters`,
    })
    .nullable()
    .optional(),
});
export type Target = z.infer<typeof TargetSchema>;

export const MetaSchema = z.object({
  incomplete: z.boolean(),
  incompleteReasons: z.array(z.string().max(MAX_STRING)).max(MAX_META_LIST),
  checksRun: z.array(BoundedId).max(MAX_META_LIST),
  checksSkipped: z.array(BoundedId).max(MAX_META_LIST),
  durationMs: z.number().nonnegative().optional(),
});
export type Meta = z.infer<typeof MetaSchema>;

export const ScanReportSchema = z.object({
  version: z.literal(REPORT_VERSION),
  tool: z.literal(TOOL_NAME),
  toolVersion: z.string().min(1).max(MAX_ID_STRING),
  generatedAt: z.iso.datetime(),
  target: TargetSchema,
  summary: SummarySchema,
  findings: z.array(FindingSchema).max(MAX_FINDINGS),
  meta: MetaSchema,
});
export type ScanReport = z.infer<typeof ScanReportSchema>;

export const SEVERITY_ORDER: Record<Severity, number> = {
  fail: 0,
  warning: 1,
  unknown: 2,
  pass: 3,
};

export function summarizeFindings(findings: Finding[]): Summary {
  const summary: Summary = {
    pass: 0,
    warning: 0,
    fail: 0,
    unknown: 0,
    total: findings.length,
  };
  for (const finding of findings) {
    summary[finding.severity] += 1;
  }
  return summary;
}

export function sortFindings(findings: Finding[]): Finding[] {
  return [...findings].sort((a, b) => {
    const bySeverity = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
    if (bySeverity !== 0) return bySeverity;
    const byService = a.service.localeCompare(b.service);
    if (byService !== 0) return byService;
    return a.id.localeCompare(b.id);
  });
}
