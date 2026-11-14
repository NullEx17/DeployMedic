import type { Summary } from "@deploymedic/core";
import { cn } from "@/lib/cn";

const CELLS: {
  key: keyof Pick<Summary, "fail" | "warning" | "pass" | "unknown">;
  label: string;
  className: string;
}[] = [
  { key: "fail", label: "Fail", className: "text-sev-fail" },
  { key: "warning", label: "Warning", className: "text-sev-warning" },
  { key: "pass", label: "Pass", className: "text-sev-pass" },
  { key: "unknown", label: "Unknown", className: "text-sev-unknown" },
];

export function SummaryStrip({
  summary,
  className,
}: {
  summary: Summary;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-md)] border border-border bg-border sm:grid-cols-4",
        className,
      )}
      role="group"
      aria-label="Finding counts by severity"
    >
      {CELLS.map((cell) => (
        <div
          key={cell.key}
          className="bg-bg-elevated px-4 py-3"
        >
          <p className="font-mono text-[11px] uppercase tracking-wide text-fg-faint">
            {cell.label}
          </p>
          <p className={cn("mt-1 text-2xl font-semibold tabular-nums", cell.className)}>
            {summary[cell.key]}
          </p>
        </div>
      ))}
    </div>
  );
}
