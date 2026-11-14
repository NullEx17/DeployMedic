"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MAX_REPORT_JSON_BYTES,
  parseScanReportJson,
  sortFindings,
  summarizeFindings,
  type Finding,
  type ScanReport,
  type Severity,
} from "@deploymedic/core";
import { AlertTriangle, FileUp, Search, X } from "lucide-react";
import { FindingCard } from "@/components/report/finding-card";
import { SummaryStrip } from "@/components/report/summary-strip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import {
  brokenExampleReport,
  healthyExampleReport,
} from "@/lib/example-reports";

type ViewerState =
  | { status: "empty" }
  | { status: "error"; message: string; details?: string[] }
  | {
      status: "ready";
      report: ScanReport;
      warnings: string[];
      sourceLabel: string;
    };

const SEVERITIES: Array<Severity | "all"> = [
  "all",
  "fail",
  "warning",
  "unknown",
  "pass",
];

function normalizeReport(
  report: ScanReport,
  warnings: string[],
  sourceLabel: string,
): Extract<ViewerState, { status: "ready" }> {
  const normalized: ScanReport = {
    ...report,
    summary: summarizeFindings(report.findings),
    findings: sortFindings(report.findings),
  };
  return {
    status: "ready",
    report: normalized,
    warnings,
    sourceLabel,
  };
}

function stateFromExample(
  initialExample?: "broken" | "healthy" | null,
): ViewerState {
  if (initialExample === "broken") {
    return normalizeReport(
      brokenExampleReport,
      [],
      "Example: fixtures/sample-broken",
    );
  }
  if (initialExample === "healthy") {
    return normalizeReport(
      healthyExampleReport,
      [],
      "Example: fixtures/sample-healthy",
    );
  }
  return { status: "empty" };
}

export function ReportViewer({
  initialExample,
}: {
  initialExample?: "broken" | "healthy" | null;
}) {
  const [state, setState] = useState<ViewerState>(() =>
    stateFromExample(initialExample),
  );
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState<Severity | "all">("all");
  const [service, setService] = useState<string>("all");
  const [activeId, setActiveId] = useState<string | null>(() => {
    const initial = stateFromExample(initialExample);
    return initial.status === "ready"
      ? (initial.report.findings[0]?.id ?? null)
      : null;
  });
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const loadReport = useCallback(
    (report: ScanReport, warnings: string[], sourceLabel: string) => {
      const ready = normalizeReport(report, warnings, sourceLabel);
      setState(ready);
      setActiveId(ready.report.findings[0]?.id ?? null);
      setQuery("");
      setSeverity("all");
      setService("all");
    },
    [],
  );

  const loadText = useCallback(
    (text: string, sourceLabel: string) => {
      const result = parseScanReportJson(text);
      if (!result.ok) {
        setState({
          status: "error",
          message: "Could not validate this file as a DeployMedic report.",
          details: result.errors,
        });
        return;
      }
      loadReport(result.report, result.warnings, sourceLabel);
    },
    [loadReport],
  );

  async function onFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".json") && file.type && file.type !== "application/json") {
      setState({
        status: "error",
        message: "Please choose a .json DeployMedic report file.",
      });
      return;
    }
    if (file.size > MAX_REPORT_JSON_BYTES) {
      setState({
        status: "error",
        message: `Report file exceeds the ${MAX_REPORT_JSON_BYTES} byte limit (${file.size} bytes).`,
      });
      return;
    }
    const text = await file.text();
    if (text.length > MAX_REPORT_JSON_BYTES) {
      setState({
        status: "error",
        message: `Report JSON exceeds the ${MAX_REPORT_JSON_BYTES} character limit.`,
      });
      return;
    }
    loadText(text, file.name);
  }

  const services = useMemo(() => {
    if (state.status !== "ready") return [] as string[];
    return [...new Set(state.report.findings.map((f) => f.service))].sort();
  }, [state]);

  const filtered: Finding[] = useMemo(() => {
    if (state.status !== "ready") return [];
    const q = query.trim().toLowerCase();
    return state.report.findings.filter((f) => {
      if (severity !== "all" && f.severity !== severity) return false;
      if (service !== "all" && f.service !== service) return false;
      if (!q) return true;
      const hay = [
        f.id,
        f.title,
        f.description,
        f.evidence,
        f.remediation,
        f.service,
        f.checkId,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [state, query, severity, service]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (state.status !== "ready" || filtered.length === 0) return;
      const idx = filtered.findIndex((f) => f.id === activeId);
      if (e.key === "j" || e.key === "ArrowDown") {
        if (document.activeElement?.tagName === "INPUT") return;
        e.preventDefault();
        const next = filtered[Math.min(filtered.length - 1, Math.max(0, idx) + 1)];
        if (next) {
          setActiveId(next.id);
          document.getElementById(`finding-${next.id}`)?.focus();
        }
      }
      if (e.key === "k" || e.key === "ArrowUp") {
        if (document.activeElement?.tagName === "INPUT") return;
        e.preventDefault();
        const prev = filtered[Math.max(0, (idx < 0 ? 1 : idx) - 1)];
        if (prev) {
          setActiveId(prev.id);
          document.getElementById(`finding-${prev.id}`)?.focus();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state, filtered, activeId]);

  return (
    <div className="mx-auto max-w-[var(--page-max)] px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-faint">
            Local-first
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Report viewer
          </h1>
          <p className="mt-2 max-w-[60ch] text-sm text-fg-muted">
            Import a DeployMedic JSON report. Files are parsed in this browser
            only — nothing is uploaded, and report content is never executed.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              loadReport(brokenExampleReport, [], "Example: fixtures/sample-broken")
            }
          >
            Load broken example
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              loadReport(
                healthyExampleReport,
                [],
                "Example: fixtures/sample-healthy",
              )
            }
          >
            Load healthy example
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "mt-8 rounded-[var(--radius-md)] border border-dashed border-border-strong bg-bg-elevated p-8 text-center transition-colors",
          dragging && "border-accent bg-accent-soft",
        )}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void onFiles(e.dataTransfer.files);
        }}
      >
        <FileUp className="mx-auto text-accent" size={22} strokeWidth={1.75} aria-hidden />
        <p className="mt-3 text-sm font-medium text-fg">
          Drop a report JSON file here
        </p>
        <p className="mt-1 text-sm text-fg-muted">
          or choose a file from disk. Validation uses the shared DeployMedic schema.
        </p>
        <div className="mt-4">
          <input
            ref={inputRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(e) => void onFiles(e.target.files)}
          />
          <Button onClick={() => inputRef.current?.click()}>Choose file</Button>
        </div>
      </div>

      {state.status === "error" ? (
        <div
          className="mt-6 border border-sev-fail/40 bg-sev-fail-soft p-4 text-sm"
          role="alert"
        >
          <p className="font-medium text-sev-fail">{state.message}</p>
          {state.details?.length ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 font-mono text-[12px] text-fg-muted">
              {state.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {state.status === "empty" ? (
        <p className="mt-8 text-sm text-fg-faint">
          No report loaded yet. Import a file or use an example above.
        </p>
      ) : null}

      {state.status === "ready" ? (
        <div className="mt-8 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{state.sourceLabel}</Badge>
            <Badge>
              v{state.report.version} · CLI {state.report.toolVersion}
            </Badge>
            <Badge>{state.report.target.path}</Badge>
            {state.report.meta.durationMs !== undefined ? (
              <Badge>{state.report.meta.durationMs}ms</Badge>
            ) : null}
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => setState({ status: "empty" })}
            >
              <X size={14} aria-hidden />
              Clear
            </Button>
          </div>

          {state.report.meta.incomplete ? (
            <div
              className="flex gap-3 border border-sev-warning/40 bg-sev-warning-soft p-4 text-sm"
              role="status"
            >
              <AlertTriangle
                className="mt-0.5 shrink-0 text-sev-warning"
                size={16}
                aria-hidden
              />
              <div>
                <p className="font-medium text-sev-warning">Incomplete scan data</p>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-fg-muted">
                  {state.report.meta.incompleteReasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}

          {state.warnings.length ? (
            <div className="border border-border bg-bg-muted p-3 text-sm text-fg-muted">
              {state.warnings.map((w) => (
                <p key={w}>{w}</p>
              ))}
            </div>
          ) : null}

          <SummaryStrip summary={state.report.summary} />

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search findings</span>
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-faint"
                aria-hidden
              />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search findings ( / or ⌘K )"
                className="h-9 w-full rounded-[var(--radius-md)] border border-border bg-bg-elevated pl-9 pr-3 text-sm text-fg placeholder:text-fg-faint"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <label className="flex items-center gap-2 text-sm text-fg-muted">
                Severity
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as Severity | "all")}
                  className="h-9 rounded-[var(--radius-md)] border border-border bg-bg-elevated px-2 text-sm text-fg"
                >
                  {SEVERITIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm text-fg-muted">
                Service
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="h-9 rounded-[var(--radius-md)] border border-border bg-bg-elevated px-2 text-sm text-fg"
                >
                  <option value="all">all</option>
                  {services.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <p className="text-xs text-fg-faint">
            Keyboard: <kbd className="font-mono">j</kbd>/
            <kbd className="font-mono">k</kbd> move ·{" "}
            <kbd className="font-mono">/</kbd> search · copy remediation per finding
          </p>

          {filtered.length === 0 ? (
            <p className="border border-border bg-bg-elevated p-6 text-sm text-fg-muted">
              No findings match the current filters.
            </p>
          ) : (
            <div className="grid gap-3">
              {filtered.map((finding) => (
                <FindingCard
                  key={finding.id + finding.checkId + finding.title}
                  id={`finding-${finding.id}`}
                  finding={finding}
                  active={activeId === finding.id}
                  onSelect={() => setActiveId(finding.id)}
                />
              ))}
            </div>
          )}

          {state.report.meta.checksSkipped.length ? (
            <p className="text-xs text-fg-faint">
              Skipped checks: {state.report.meta.checksSkipped.join(", ")}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
