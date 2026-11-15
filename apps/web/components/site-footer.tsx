import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-bg-elevated">
      <div className="mx-auto flex max-w-[var(--page-max)] flex-col gap-4 px-4 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div>
          <BrandLogo height={24} />
          <p className="mt-3 max-w-sm text-sm text-fg-muted">
            Local-first deployment diagnostics. Scan on your machine. Read
            reports in the browser without uploading them.
          </p>
          <p className="mt-3 text-sm text-fg-muted">
            Built by{" "}
            <a
              href="https://github.com/NullEx17"
              className="text-fg hover:text-accent"
              rel="noopener noreferrer"
              target="_blank"
            >
              NullEx17
            </a>
            {" · "}
            <a
              href="https://nullex17.me/"
              className="text-fg hover:text-accent"
              rel="noopener noreferrer"
              target="_blank"
            >
              nullex17.me
            </a>
          </p>
        </div>
        <div className="flex gap-10 text-sm">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wide text-fg-faint">
              Product
            </span>
            <Link href="/viewer" className="text-fg-muted hover:text-fg">
              Report viewer
            </Link>
            <Link href="/docs" className="text-fg-muted hover:text-fg">
              Documentation
            </Link>
            <Link href="/docs/cli" className="text-fg-muted hover:text-fg">
              CLI reference
            </Link>
            <Link href="/about" className="text-fg-muted hover:text-fg">
              About
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wide text-fg-faint">
              Project
            </span>
            <a
              href="https://github.com/NullEx17/DeployMedic"
              className="text-fg-muted hover:text-fg"
              rel="noopener noreferrer"
              target="_blank"
            >
              GitHub
            </a>
            <Link href="/docs/checks" className="text-fg-muted hover:text-fg">
              Supported checks
            </Link>
            <span className="text-fg-faint">MIT License</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
