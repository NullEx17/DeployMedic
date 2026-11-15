import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import {
  SITE_AUTHOR,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TAGLINE,
  absoluteUrl,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "About DeployMedic — local-first deployment diagnostics",
  description: SITE_DESCRIPTION,
  keywords: [...SITE_KEYWORDS],
  alternates: { canonical: "/about" },
  openGraph: {
    title: `About ${SITE_NAME}`,
    description: SITE_DESCRIPTION,
    url: absoluteUrl("/about"),
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `About ${SITE_NAME}`,
    description: SITE_DESCRIPTION,
  },
};

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: `About ${SITE_NAME}`,
  description: SITE_DESCRIPTION,
  url: absoluteUrl("/about"),
  isPartOf: {
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl("/"),
  },
  about: {
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Windows, macOS, Linux",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description: SITE_DESCRIPTION,
    url: absoluteUrl("/"),
    author: {
      "@type": "Person",
      name: SITE_AUTHOR.name,
      url: SITE_AUTHOR.url,
      sameAs: [SITE_AUTHOR.github, SITE_AUTHOR.url],
    },
    codeRepository: SITE_AUTHOR.repo,
    license: "https://opensource.org/licenses/MIT",
  },
  keywords: SITE_KEYWORDS.join(", "),
};

export default function AboutPage() {
  return (
    <>
      <JsonLd data={aboutJsonLd} />

      <article>
        <header className="relative overflow-hidden border-b border-border">
          <div
            className="pointer-events-none absolute inset-0 dm-grid-bg opacity-40"
            aria-hidden
          />
          <div className="relative mx-auto max-w-[var(--page-max)] px-4 pb-14 pt-14 sm:px-6 lg:pb-16 lg:pt-20">
            <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent">
              About
            </p>
            <h1 className="mt-4 max-w-[20ch] text-[2.35rem] font-semibold leading-[1.08] tracking-tight text-fg sm:text-5xl">
              {SITE_NAME}
            </h1>
            <p className="mt-3 font-mono text-sm text-fg-muted">{SITE_TAGLINE}</p>
            <p className="mt-6 max-w-[62ch] text-base leading-relaxed text-fg-muted sm:text-lg">
              DeployMedic helps developers find why a deployment is broken —
              locally, with evidence, before or after it ships. Scan a project on
              your machine, get a structured JSON report, and review findings in a
              browser viewer that never uploads your data.
            </p>
          </div>
        </header>

        <section className="border-b border-border bg-bg-elevated">
          <div className="mx-auto max-w-[var(--page-max)] px-4 py-14 sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight">
              What DeployMedic is for
            </h2>
            <p className="mt-3 max-w-[65ch] text-sm leading-relaxed text-fg-muted">
              Production deploys fail for boring, repeatable reasons: a missing
              lockfile, an ignored{" "}
              <code className="font-mono text-fg">.env</code> rule that isn&apos;t
              there, a Dockerfile without{" "}
              <code className="font-mono text-fg">HEALTHCHECK</code>, Compose
              services without readiness probes, or a process bound to a hardcoded
              port instead of{" "}
              <code className="font-mono text-fg">PORT</code>. DeployMedic inspects
              those surfaces and returns findings you can verify.
            </p>
            <ul className="mt-6 grid gap-3 text-sm text-fg-muted md:grid-cols-2">
              {[
                "Docker and Dockerfile deployment pitfalls",
                "Docker Compose healthcheck and parse issues",
                "Node.js package.json, engines, and lockfiles",
                "Environment templates vs local .env coverage",
                "Gitignore rules for secret files",
                "Optional HTTP URL probes when you ask for them",
              ].map((item) => (
                <li
                  key={item}
                  className="border border-border bg-bg px-4 py-3 text-fg"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="mx-auto max-w-[var(--page-max)] px-4 py-14 sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight">
              Local-first by design
            </h2>
            <p className="mt-3 max-w-[65ch] text-sm leading-relaxed text-fg-muted">
              Trust is the product constraint. The CLI only reads files under the
              scan root you pass. The report viewer parses JSON entirely in your
              browser. Nothing is uploaded to DeployMedic servers — there is no
              cloud account required to diagnose a project.
            </p>
            <dl className="mt-8 grid gap-6 sm:grid-cols-3">
              {[
                {
                  t: "Evidence over opinion",
                  d: "Every finding shows what was inspected and what was found.",
                },
                {
                  t: "Honest scope",
                  d: "Only implemented checks are advertised. Incomplete scans stay labeled incomplete.",
                },
                {
                  t: "Terminal as source of truth",
                  d: "The website demonstrates the CLI. It does not replace it.",
                },
              ].map((item) => (
                <div key={item.t}>
                  <dt className="text-sm font-semibold text-fg">{item.t}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-fg-muted">
                    {item.d}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="border-b border-border bg-bg-elevated">
          <div className="mx-auto max-w-[var(--page-max)] px-4 py-14 sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight">
              Who builds it
            </h2>
            <p className="mt-3 max-w-[65ch] text-sm leading-relaxed text-fg-muted">
              DeployMedic is an open-source project by{" "}
              <a
                href={SITE_AUTHOR.github}
                className="text-fg underline-offset-2 hover:text-accent hover:underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                {SITE_AUTHOR.name}
              </a>
              . Source, issues, and releases live on{" "}
              <a
                href={SITE_AUTHOR.repo}
                className="text-fg underline-offset-2 hover:text-accent hover:underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                GitHub
              </a>
              . Personal site:{" "}
              <a
                href={SITE_AUTHOR.url}
                className="text-fg underline-offset-2 hover:text-accent hover:underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                nullex17.me
              </a>
              . Licensed under MIT.
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-[var(--page-max)] px-4 py-16 sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight">
              Start diagnosing with evidence
            </h2>
            <p className="mt-3 max-w-[50ch] text-fg-muted">
              Install from the repository, scan a project, open the JSON in the
              offline viewer.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/docs"
                className="inline-flex h-9 items-center gap-2 rounded-[var(--radius-md)] bg-accent px-3.5 text-sm font-medium text-accent-fg hover:brightness-110"
              >
                Read the docs
                <ArrowRight size={14} aria-hidden />
              </Link>
              <Link
                href="/viewer"
                className="inline-flex h-9 items-center rounded-[var(--radius-md)] border border-border bg-bg-elevated px-3.5 text-sm font-medium hover:bg-bg-muted"
              >
                Open report viewer
              </Link>
              <a
                href={SITE_AUTHOR.repo}
                className="inline-flex h-9 items-center px-2 text-sm text-fg-muted hover:text-fg"
                rel="noopener noreferrer"
                target="_blank"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </section>
      </article>
    </>
  );
}
