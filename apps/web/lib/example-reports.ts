import {
  validateScanReport,
  type ScanReport,
} from "@deploymedic/core";
import brokenJson from "@/data/broken-report.json";
import healthyJson from "@/data/healthy-report.json";

function loadFixture(raw: unknown, displayPath: string): ScanReport {
  const result = validateScanReport(raw);
  if (!result.ok) {
    throw new Error(`Invalid fixture: ${result.errors.join("; ")}`);
  }
  return {
    ...result.report,
    target: {
      ...result.report.target,
      path: displayPath,
    },
  };
}

/** Real CLI output from `deploymedic scan fixtures/sample-broken`. */
export const brokenExampleReport = loadFixture(
  brokenJson,
  "fixtures/sample-broken",
);

/** Real CLI output from `deploymedic scan fixtures/sample-healthy`. */
export const healthyExampleReport = loadFixture(
  healthyJson,
  "fixtures/sample-healthy",
);
