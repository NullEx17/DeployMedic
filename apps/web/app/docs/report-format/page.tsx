import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Report format",
};

export default function ReportFormatPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Report format</h1>
        <p className="mt-3 text-fg-muted">
          DeployMedic emits a versioned JSON document. The viewer and{" "}
          <code className="font-mono text-fg">deploymedic report</code> validate
          against the same schema in <code className="font-mono text-fg">@deploymedic/core</code>.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Top-level fields</h2>
        <Field
          name="version"
          detail='Always "1.0.0" for this release. Unknown versions are rejected.'
        />
        <Field name="tool" detail='Always "deploymedic".' />
        <Field name="toolVersion" detail="CLI semver that produced the report." />
        <Field
          name="generatedAt"
          detail="ISO-8601 timestamp with offset (UTC from the CLI)."
        />
        <Field
          name="target.path"
          detail="Absolute path that was scanned."
        />
        <Field
          name="target.url"
          detail="Optional URL passed to --url, or null."
        />
        <Field
          name="summary"
          detail="Counts: pass, warning, fail, unknown, total."
        />
        <Field name="findings" detail="Array of finding objects." />
        <Field
          name="meta"
          detail="incomplete flag, incompleteReasons, checksRun, checksSkipped, durationMs."
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Finding object</h2>
        <pre className="overflow-x-auto rounded-[var(--radius-md)] border border-border bg-bg-elevated p-4 font-mono text-[12px] leading-6">
{`{
  "id": "LCK-001",
  "checkId": "lockfile",
  "severity": "fail",
  "service": "node",
  "title": "No lockfile found",
  "description": "…",
  "evidence": "…",
  "impact": "…",
  "remediation": "…",
  "docsPath": "/docs/checks#lockfile"
}`}
        </pre>
        <p className="text-sm text-fg-muted">
          Severity is one of <code className="font-mono text-fg">pass</code>,{" "}
          <code className="font-mono text-fg">warning</code>,{" "}
          <code className="font-mono text-fg">fail</code>,{" "}
          <code className="font-mono text-fg">unknown</code>. Unknown means the
          check ran but evidence was inconclusive — the report is marked incomplete.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Trust boundary</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-fg-muted">
          <li>Treat report JSON as untrusted input in the viewer.</li>
          <li>The viewer parses and validates; it does not evaluate code from the file.</li>
          <li>Do not paste secrets into evidence fields when authoring custom reports.</li>
        </ul>
      </section>
    </div>
  );
}

function Field({ name, detail }: { name: string; detail: string }) {
  return (
    <div className="border-b border-border py-3 last:border-b-0">
      <p className="font-mono text-[13px] text-accent">{name}</p>
      <p className="mt-1 text-sm text-fg-muted">{detail}</p>
    </div>
  );
}
