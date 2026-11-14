"use client";

import type { Finding } from "@deploymedic/core";
import { SeverityBadge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/cn";

export function FindingCard({
  finding,
  active,
  onSelect,
  id,
}: {
  finding: Finding;
  active?: boolean;
  onSelect?: () => void;
  id?: string;
}) {
  return (
    <article
      id={id}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.();
        }
      }}
      className={cn(
        "border border-border bg-bg-elevated p-4 transition-colors",
        active ? "border-accent" : "hover:border-border-strong",
        "focus-visible:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]",
      )}
      aria-current={active ? "true" : undefined}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={finding.severity} />
            <span className="font-mono text-[11px] text-fg-faint">{finding.id}</span>
            <span className="font-mono text-[11px] text-fg-faint">
              {finding.service}
            </span>
          </div>
          <h3 className="mt-2 text-base font-semibold tracking-tight text-fg">
            {finding.title}
          </h3>
          <p className="mt-1 text-sm text-fg-muted">{finding.description}</p>
        </div>
      </div>

      <dl className="mt-4 grid gap-3 text-sm">
        <div>
          <dt className="font-mono text-[11px] uppercase tracking-wide text-fg-faint">
            Evidence
          </dt>
          <dd className="mt-1 rounded-[var(--radius-sm)] border border-border bg-bg-muted px-3 py-2 font-mono text-[12px] leading-relaxed text-fg">
            {finding.evidence}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[11px] uppercase tracking-wide text-fg-faint">
            Impact
          </dt>
          <dd className="mt-1 text-fg-muted">{finding.impact}</dd>
        </div>
        <div>
          <div className="flex items-center justify-between gap-2">
            <dt className="font-mono text-[11px] uppercase tracking-wide text-fg-faint">
              Remediation
            </dt>
            <CopyButton value={finding.remediation} label="Copy fix" className="h-7" />
          </div>
          <dd className="mt-1 text-fg">{finding.remediation}</dd>
        </div>
      </dl>
    </article>
  );
}
