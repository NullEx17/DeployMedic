import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileJson2, ShieldCheck, Terminal } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { InstallCommand, SetupCommands } from "@/components/install-command";
import { TerminalDemo } from "@/components/terminal-demo";
import { ExampleReportPreview } from "@/components/example-report-preview";
import { checksCatalog } from "@/lib/checks-catalog";
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TAGLINE,
  absoluteUrl,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute: `${SITE_NAME} — ${SITE_TAGLINE}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [...SITE_KEYWORDS],
  alternates: { canonical: "/" },
  openGraph: {
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: absoluteUrl("/"),
  },
};

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 dm-grid-bg opacity-40" aria-hidden />
        <div className="relative mx-auto grid max-w-[var(--page-max)] gap-10 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:pb-20 lg:pt-20">
          <div className="flex flex-col justify-center">
            <div className="mb-6">
              <BrandLogo height={40} priority />
            </div>
            <h1 className="max-w-[18ch] text-[2.35rem] font-semibold leading-[1.08] tracking-tight text-fg sm:text-5xl">
              Diagnose broken deployments with evidence.
            </h1>
            <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-fg-muted sm:text-lg">
              Local-first deployment diagnostics for Docker, Node.js, env files,
              and Compose. Scan on your machine, get a structured JSON report, and
              review findings in a browser viewer that never uploads your data.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/docs"
                className="inline-flex h-9 items-center gap-2 rounded-[var(--radius-md)] bg-accent px-3.5 text-sm font-medium text-accent-fg transition-[filter] hover:brightness-110"
              >
                Read the docs
                <ArrowRight size={14} aria-hidden />
              </Link>
              <Link
                href="/viewer"
                className="inline-flex h-9 items-center gap-2 rounded-[var(--radius-md)] border border-border bg-bg-elevated px-3.5 text-sm font-medium text-fg transition-colors hover:border-border-strong hover:bg-bg-muted"
              >
                Open report viewer
              </Link>
              <Link
                href="/docs/cli"
                className="inline-flex h-9 items-center px-2 text-sm text-fg-muted hover:text-fg"
              >
                CLI reference
              </Link>
            </div>
          </div>
          <TerminalDemo />
        </div>
      </section>

      <section className="border-b border-border bg-bg-elevated">
        <div className="mx-auto max-w-[var(--page-max)] px-4 py-12 sm:px-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-faint">
            Install
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Build the CLI from this repository
          </h2>
          <p className="mt-2 max-w-[60ch] text-sm text-fg-muted">
            Requires Node.js 20+. The CLI is not published to npm yet — build it
            locally, then scan a project root. Use{" "}
            <code className="font-mono text-fg">--json</code> or{" "}
            <code className="font-mono text-fg">--output</code> to save a report
            for the viewer.
          </p>
          <div className="mt-6 max-w-2xl">
            <SetupCommands />
          </div>
          <p className="mt-4 text-sm text-fg-muted">Scan after build:</p>
          <div className="mt-2 max-w-2xl">
            <InstallCommand />
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-[var(--page-max)] px-4 py-14 sm:px-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-faint">
            How it works
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Three surfaces. One report format.
          </h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Terminal,
                title: "1. Scan locally",
                body: "The CLI inspects files at a project root — package manifests, lockfiles, Docker, env templates, port binding, and an optional URL probe.",
              },
              {
                icon: FileJson2,
                title: "2. Emit a report",
                body: "Findings include severity, evidence, impact, and remediation in a versioned JSON schema. Plain text and NO_COLOR modes for terminals and CI.",
              },
              {
                icon: ShieldCheck,
                title: "3. Review offline",
                body: "Drop the JSON into the report viewer. Parsing and validation run entirely in your browser. Nothing is uploaded.",
              },
            ].map((step) => (
              <li
                key={step.title}
                className="border border-border bg-bg-elevated p-5"
              >
                <step.icon
                  className="mb-4 text-accent"
                  size={18}
                  strokeWidth={1.75}
                  aria-hidden
                />
                <h3 className="text-base font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b border-border bg-bg-elevated">
        <div className="mx-auto max-w-[var(--page-max)] px-4 py-14 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-faint">
                Example report
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Interactive preview of a real fixture
              </h2>
              <p className="mt-2 max-w-[60ch] text-sm text-fg-muted">
                Generated by scanning{" "}
                <code className="font-mono text-fg">fixtures/sample-broken</code>
                . Open it fully in the viewer, or import your own JSON.
              </p>
            </div>
            <Link
              href="/viewer?example=broken"
              className="inline-flex h-9 items-center gap-2 self-start rounded-[var(--radius-md)] border border-border bg-bg px-3.5 text-sm font-medium text-fg hover:bg-bg-muted"
            >
              Open in viewer
              <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
          <div className="mt-8">
            <ExampleReportPreview />
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-[var(--page-max)] px-4 py-14 sm:px-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-faint">
            Supported checks
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            What DeployMedic actually inspects
          </h2>
          <p className="mt-2 max-w-[62ch] text-sm text-fg-muted">
            Only implemented checks are listed. Skipped checks (missing optional
            files, no <code className="font-mono">--url</code>) are recorded in
            the report metadata — never invented as passes.
          </p>
          <div className="mt-8 overflow-x-auto rounded-[var(--radius-md)] border border-border">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead className="bg-bg-muted text-fg-muted">
                <tr>
                  <th className="border-b border-border px-4 py-2.5 font-mono text-[11px] font-medium uppercase tracking-wide">
                    Check
                  </th>
                  <th className="border-b border-border px-4 py-2.5 font-mono text-[11px] font-medium uppercase tracking-wide">
                    Service
                  </th>
                  <th className="border-b border-border px-4 py-2.5 font-mono text-[11px] font-medium uppercase tracking-wide">
                    Looks at
                  </th>
                </tr>
              </thead>
              <tbody>
                {checksCatalog.map((check) => (
                  <tr key={check.id} className="align-top">
                    <td className="border-b border-border px-4 py-3 font-mono text-accent">
                      {check.id}
                    </td>
                    <td className="border-b border-border px-4 py-3 text-fg-muted">
                      {check.service}
                    </td>
                    <td className="border-b border-border px-4 py-3 text-fg-muted">
                      {check.summary}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-8 grid gap-4 border border-border bg-bg-elevated p-5 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold">Clear limitations</h3>
              <ul className="mt-3 list-disc space-y-2 pl-4 text-sm text-fg-muted">
                <li>Does not execute your application or run builds.</li>
                <li>Does not read cloud provider dashboards or remote secrets.</li>
                <li>
                  Static file checks can miss issues outside scanned entry paths.
                </li>
                <li>
                  URL probes only run when you pass{" "}
                  <code className="font-mono text-fg">--url</code>.
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Security model</h3>
              <ul className="mt-3 list-disc space-y-2 pl-4 text-sm text-fg-muted">
                <li>The report viewer never uploads JSON.</li>
                <li>Embedded report content is not executed.</li>
                <li>
                  Local <code className="font-mono text-fg">.env</code> key names
                  may appear as evidence; values are not printed by the CLI.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-bg-elevated">
        <div className="mx-auto max-w-[var(--page-max)] px-4 py-14 sm:px-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-faint">
            About
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Built for developers who need proof, not guesswork
          </h2>
          <p className="mt-3 max-w-[65ch] text-sm leading-relaxed text-fg-muted">
            DeployMedic is an open-source, local-first deployment diagnostic tool.
            It catches common ship-breakers — missing lockfiles, unsafe{" "}
            <code className="font-mono text-fg">.env</code> gitignore gaps,
            Dockerfile and Compose readiness gaps, and hardcoded ports — then
            explains each finding with evidence and remediation.
          </p>
          <Link
            href="/about"
            className="mt-5 inline-flex h-9 items-center gap-2 text-sm font-medium text-accent hover:underline"
          >
            More about DeployMedic
            <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-[var(--page-max)] px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            Start with evidence, not guesswork.
          </h2>
          <p className="mt-3 max-w-[50ch] text-fg-muted">
            Scan a project, open the JSON in the viewer, fix what the evidence
            supports.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/docs/cli"
              className="inline-flex h-9 items-center rounded-[var(--radius-md)] bg-accent px-3.5 text-sm font-medium text-accent-fg hover:brightness-110"
            >
              CLI reference
            </Link>
            <Link
              href="/viewer"
              className="inline-flex h-9 items-center rounded-[var(--radius-md)] border border-border bg-bg-elevated px-3.5 text-sm font-medium hover:bg-bg-muted"
            >
              Report viewer
            </Link>
            <Link
              href="/about"
              className="inline-flex h-9 items-center px-2 text-sm text-fg-muted hover:text-fg"
            >
              About
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
