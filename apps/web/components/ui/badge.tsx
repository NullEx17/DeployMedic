import type { HTMLAttributes } from "react";
import type { Severity } from "@deploymedic/core";
import { cn } from "@/lib/cn";
import { SEVERITY_LABEL, severityClasses } from "@/lib/severity";

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-sm)] border border-border bg-bg-muted px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-wide text-fg-muted",
        className,
      )}
      {...props}
    />
  );
}

export function SeverityBadge({
  severity,
  className,
}: {
  severity: Severity;
  className?: string;
}) {
  const classes = severityClasses(severity);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-sm)] border px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-wide",
        classes.text,
        classes.soft,
        classes.border,
        className,
      )}
    >
      {SEVERITY_LABEL[severity]}
    </span>
  );
}
