import type { Severity } from "@deploymedic/core";

export const SEVERITY_LABEL: Record<Severity, string> = {
  fail: "Fail",
  warning: "Warning",
  pass: "Pass",
  unknown: "Unknown",
};

export function severityClasses(severity: Severity): {
  text: string;
  soft: string;
  border: string;
} {
  switch (severity) {
    case "fail":
      return {
        text: "text-sev-fail",
        soft: "bg-sev-fail-soft",
        border: "border-sev-fail/40",
      };
    case "warning":
      return {
        text: "text-sev-warning",
        soft: "bg-sev-warning-soft",
        border: "border-sev-warning/40",
      };
    case "pass":
      return {
        text: "text-sev-pass",
        soft: "bg-sev-pass-soft",
        border: "border-sev-pass/40",
      };
    case "unknown":
      return {
        text: "text-sev-unknown",
        soft: "bg-sev-unknown-soft",
        border: "border-sev-unknown/40",
      };
  }
}
