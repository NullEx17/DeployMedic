"use client";

import { useMemo, useState } from "react";
import { brokenExampleReport } from "@/lib/example-reports";
import { SummaryStrip } from "@/components/report/summary-strip";
import { SeverityBadge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

export function ExampleReportPreview() {
  const actionable = useMemo(
    () =>
      brokenExampleReport.findings.filter((f) => f.severity !== "pass").slice(0, 5),
    [],
  );
  const [active, setActive] = useState(actionable[0]?.id ?? "");
  const selected =
    actionable.find((f) => f.id === active) ?? actionable[0] ?? null;

  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-border bg-bg">
      <div className="border-b border-border bg-bg-elevated px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-[12px] text-fg-muted">
            fixtures/sample-broken · incomplete
          </p>
          <p className="font-mono text-[11px] text-fg-faint">
            interactive preview
          </p>
        </div>
        <div className="mt-3">
          <SummaryStrip summary={brokenExampleReport.summary} />
        </div>
      </div>
      <div className="grid lg:grid-cols-[240px_1fr]">
        <ul
          className="border-b border-border lg:border-b-0 lg:border-r"
          role="listbox"
          aria-label="Example findings"
        >
          {actionable.map((finding) => (
            <li key={finding.id}>
              <button
                type="button"
                role="option"
                aria-selected={finding.id === selected?.id}
                onClick={() => setActive(finding.id)}
                className={cn(
                  "flex w-full flex-col gap-1 border-b border-border px-4 py-3 text-left transition-colors last:border-b-0",
                  finding.id === selected?.id
                    ? "bg-accent-soft"
                    : "hover:bg-bg-muted",
                )}
              >
                <SeverityBadge severity={finding.severity} />
                <span className="text-sm font-medium text-fg">{finding.title}</span>
                <span className="font-mono text-[11px] text-fg-faint">
                  {finding.id}
                </span>
              </button>
            </li>
          ))}
        </ul>
        {selected ? (
          <div className="p-5">
            <h3 className="text-lg font-semibold tracking-tight">
              {selected.title}
            </h3>
            <p className="mt-2 text-sm text-fg-muted">{selected.description}</p>
            <div className="mt-4">
              <p className="font-mono text-[11px] uppercase tracking-wide text-fg-faint">
                Evidence
              </p>
              <p className="mt-1 rounded-[var(--radius-sm)] border border-border bg-bg-muted px-3 py-2 font-mono text-[12px]">
                {selected.evidence}
              </p>
            </div>
            <div className="mt-4">
              <p className="font-mono text-[11px] uppercase tracking-wide text-fg-faint">
                Remediation
              </p>
              <p className="mt-1 text-sm text-fg">{selected.remediation}</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
