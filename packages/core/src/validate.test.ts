import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { REPORT_VERSION, TOOL_NAME, type ScanReport } from "./schema.js";
import { parseScanReportJson, validateScanReport } from "./validate.js";

const baseReport = (): ScanReport => ({
  version: REPORT_VERSION,
  tool: TOOL_NAME,
  toolVersion: "0.1.0",
  generatedAt: "2026-11-14T18:00:00.000Z",
  target: { path: "/tmp/app", url: null },
  summary: { pass: 1, warning: 0, fail: 0, unknown: 0, total: 1 },
  findings: [
    {
      id: "PKG-001",
      checkId: "package-json",
      severity: "pass",
      service: "node",
      title: "package.json present",
      description: "A package.json was found at the scan root.",
      evidence: "Found /tmp/app/package.json",
      impact: "None.",
      remediation: "No action required.",
    },
  ],
  meta: {
    incomplete: false,
    incompleteReasons: [],
    checksRun: ["package-json"],
    checksSkipped: [],
    durationMs: 12,
  },
});

describe("validateScanReport", () => {
  it("accepts a valid report", () => {
    const result = validateScanReport(baseReport());
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.warnings.length, 0);
  });

  it("rejects wrong version", () => {
    const bad = { ...baseReport(), version: "0.9.0" };
    const result = validateScanReport(bad);
    assert.equal(result.ok, false);
  });

  it("warns when summary mismatches findings", () => {
    const report = baseReport();
    report.summary.fail = 2;
    const result = validateScanReport(report);
    assert.equal(result.ok, true);
    if (result.ok) assert.ok(result.warnings.some((w) => w.includes("summary")));
  });
});

describe("parseScanReportJson", () => {
  it("rejects invalid JSON", () => {
    const result = parseScanReportJson("{not-json");
    assert.equal(result.ok, false);
  });

  it("parses valid JSON", () => {
    const result = parseScanReportJson(JSON.stringify(baseReport()));
    assert.equal(result.ok, true);
  });

  it("rejects oversized JSON payloads before schema walk", () => {
    const huge = "x".repeat(2_097_153);
    const result = parseScanReportJson(huge);
    assert.equal(result.ok, false);
    if (!result.ok) assert.match(result.errors[0] ?? "", /exceeds/);
  });

  it("rejects findings with overlong evidence strings", () => {
    const report = baseReport();
    report.findings[0]!.evidence = "e".repeat(8_001);
    const result = validateScanReport(report);
    assert.equal(result.ok, false);
  });
});
