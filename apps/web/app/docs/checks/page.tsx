import type { Metadata } from "next";
import { checksCatalog } from "@/lib/checks-catalog";

export const metadata: Metadata = {
  title: "Checks",
};

const DETAILS: Record<
  string,
  { inspects: string; cannot: string }
> = {
  "package-json": {
    inspects: "package.json existence, JSON parse, scripts.start/build, engines.node.",
    cannot: "Does not install dependencies or verify that scripts succeed.",
  },
  lockfile: {
    inspects: "Presence of npm/pnpm/yarn/bun lockfiles; flags multiples.",
    cannot: "Does not verify lockfile integrity or registry reachability.",
  },
  "node-version": {
    inspects: ".nvmrc, .node-version, and engines.node.",
    cannot: "Does not compare against the running Node binary unless you do so yourself.",
  },
  gitignore: {
    inspects:
      "Root and nested .gitignore files with negation and directory-scoped patterns; probes common secret env paths.",
    cannot:
      "Does not scan git history for already-committed secrets; bounded directory walk may skip very deep trees.",
  },
  "env-example": {
    inspects: ".env.example/.sample/.template keys vs local .env key names.",
    cannot: "Does not print secret values; does not know host-side env vars.",
  },
  dockerfile: {
    inspects: "HEALTHCHECK, USER, EXPOSE in Dockerfile / Dockerfile.prod.",
    cannot: "Does not build images or analyze multi-stage graph correctness.",
  },
  compose: {
    inspects: "Compose YAML parse and per-service healthcheck presence.",
    cannot: "Does not start containers or validate image digests.",
  },
  "port-config": {
    inspects: "Common entry files for process.env.PORT vs hardcoded listen().",
    cannot: "May miss frameworks that bind ports in unscanned files.",
  },
  "health-url": {
    inspects: "Optional GET --url with status classification (http/https only).",
    cannot:
      "Does not authenticate; rejects non-http(s) schemes; 4xx may be expected for protected roots.",
  },
};

export default function ChecksDocsPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Checks</h1>
        <p className="mt-3 text-fg-muted">
          Only implemented checks are documented here. If a check is skipped
          (optional file missing, no <code className="font-mono text-fg">--url</code>),
          it appears in <code className="font-mono text-fg">meta.checksSkipped</code> —
          not as a fabricated pass.
        </p>
      </header>

      {checksCatalog.map((check) => {
        const detail = DETAILS[check.id];
        return (
          <section
            key={check.id}
            id={check.id}
            className="scroll-mt-24 space-y-2 border-b border-border pb-8"
          >
            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="font-mono text-lg font-semibold text-accent">
                {check.id}
              </h2>
              <span className="font-mono text-[11px] uppercase tracking-wide text-fg-faint">
                {check.service}
              </span>
            </div>
            <p className="text-sm text-fg-muted">{check.summary}</p>
            {detail ? (
              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                <div className="border border-border bg-bg-elevated p-3">
                  <dt className="font-mono text-[11px] uppercase tracking-wide text-fg-faint">
                    Inspects
                  </dt>
                  <dd className="mt-1 text-fg-muted">{detail.inspects}</dd>
                </div>
                <div className="border border-border bg-bg-elevated p-3">
                  <dt className="font-mono text-[11px] uppercase tracking-wide text-fg-faint">
                    Cannot see
                  </dt>
                  <dd className="mt-1 text-fg-muted">{detail.cannot}</dd>
                </div>
              </dl>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
