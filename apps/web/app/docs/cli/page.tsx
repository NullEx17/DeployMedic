import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CLI reference",
};

export default function CliDocsPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">CLI reference</h1>
        <p className="mt-3 text-fg-muted">
          The CLI is the source of truth for diagnostics. Terminal formatting is
          for humans; JSON is for tools and the report viewer.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Commands</h2>
        <DocTable
          rows={[
            ["deploymedic scan [path]", "Scan a project root (default: .)."],
            ["deploymedic report <file>", "Pretty-print a saved JSON report."],
            ["deploymedic checks", "List implemented check ids."],
            ["deploymedic --version", "Print CLI version."],
          ]}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">scan flags</h2>
        <DocTable
          rows={[
            ["--url <url>", "Optional http(s) GET probe only (10s timeout). Other schemes are rejected."],
            ["--json", "Write the full report JSON to stdout."],
            ["--output <file>", "Write the JSON report to a file."],
            ["--only <ids>", "Comma-separated check ids to run."],
            ["--color <mode>", "auto | always | never (default: auto)."],
          ]}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Exit codes</h2>
        <DocTable
          rows={[
            ["0", "Scan completed with zero fail findings."],
            ["1", "One or more fail findings."],
            ["2", "Invalid arguments or invalid report input."],
          ]}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Color & CI</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-fg-muted">
          <li>
            Color is disabled when stdout is not a TTY, when{" "}
            <code className="font-mono text-fg">NO_COLOR</code> is set, or when{" "}
            <code className="font-mono text-fg">FORCE_COLOR=0</code>.
          </li>
          <li>
            Use <code className="font-mono text-fg">--color never</code> or{" "}
            <code className="font-mono text-fg">--json</code> in CI logs.
          </li>
          <li>
            There are no fake progress bars or decorative spinners — output
            appears when the scan finishes.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Examples</h2>
        <pre className="overflow-x-auto rounded-[var(--radius-md)] border border-border bg-bg-elevated p-4 font-mono text-[13px] leading-6">
{`# After building the CLI from this repo:
# node packages/cli/dist/bin.js  (or: npm run deploymedic -- …)

# Human-readable scan
node packages/cli/dist/bin.js scan ./apps/api

# Save JSON for the viewer
node packages/cli/dist/bin.js scan ./apps/api --output report.json

# Probe a live health endpoint
node packages/cli/dist/bin.js scan ./apps/api --url https://api.example.com/healthz

# Re-print a saved report without color
# Windows PowerShell: $env:NO_COLOR=1
NO_COLOR=1 node packages/cli/dist/bin.js report report.json`}
        </pre>
      </section>
    </div>
  );
}

function DocTable({ rows }: { rows: [string, string][] }) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-md)] border border-border">
      <table className="w-full min-w-[480px] text-left text-sm">
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k} className="border-b border-border last:border-b-0">
              <th className="whitespace-nowrap bg-bg-muted px-3 py-2.5 align-top font-mono text-[12px] font-medium text-fg">
                {k}
              </th>
              <td className="px-3 py-2.5 text-fg-muted">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
