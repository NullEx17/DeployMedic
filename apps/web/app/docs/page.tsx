import type { Metadata } from "next";
import Link from "next/link";
import { InstallCommand, SetupCommands } from "@/components/install-command";

export const metadata: Metadata = {
  title: "Documentation — install, scan, and review reports",
  description:
    "Install DeployMedic, run local deployment scans, emit JSON reports, and review findings offline. CLI setup, quick start, and security model.",
  keywords: [
    "DeployMedic docs",
    "deployment diagnostics install",
    "deploymedic scan",
    "local CLI deployment checker",
  ],
  alternates: { canonical: "/docs" },
  openGraph: {
    title: "DeployMedic documentation",
    description:
      "Install DeployMedic, run scans, and read reports locally without uploading project data.",
    url: "/docs",
  },
};

export default function DocsPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Documentation</h1>
        <p className="mt-3 text-fg-muted">
          DeployMedic is an evidence-first deployment diagnostic: a CLI that scans
          a project directory, a versioned JSON report, and a browser viewer that
          never uploads that report.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Install</h2>
        <p className="text-sm text-fg-muted">
          From a clone of this repository (Node.js 20+). The package is not on
          the public npm registry yet.
        </p>
        <SetupCommands />
        <p className="text-sm text-fg-muted">Then scan a project:</p>
        <InstallCommand command="node packages/cli/dist/bin.js scan ./path/to/app --output report.json" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Quick start</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-fg-muted">
          <li>
            Run{" "}
            <code className="font-mono text-fg">
              node packages/cli/dist/bin.js scan .
            </code>{" "}
            at your project root.
          </li>
          <li>
            Add <code className="font-mono text-fg">--output report.json</code>{" "}
            (or <code className="font-mono text-fg">--json</code>) to capture the
            machine-readable report.
          </li>
          <li>
            Open the{" "}
            <Link href="/viewer" className="text-accent hover:underline">
              report viewer
            </Link>{" "}
            and import the file locally.
          </li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Next</h2>
        <ul className="space-y-2 text-sm">
          <li>
            <Link href="/docs/cli" className="text-accent hover:underline">
              CLI reference
            </Link>{" "}
            — commands, flags, exit codes, color behavior
          </li>
          <li>
            <Link
              href="/docs/report-format"
              className="text-accent hover:underline"
            >
              Report format
            </Link>{" "}
            — JSON schema fields
          </li>
          <li>
            <Link href="/docs/checks" className="text-accent hover:underline">
              Checks
            </Link>{" "}
            — what each check inspects and its limits
          </li>
        </ul>
      </section>
    </div>
  );
}
