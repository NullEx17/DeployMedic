import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[var(--page-max)] px-4 py-24 sm:px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-faint">
        404
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Page not found
      </h1>
      <p className="mt-3 max-w-[40ch] text-fg-muted">
        That route does not exist. Head back to the product site or open the
        report viewer.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="inline-flex h-9 items-center rounded-[var(--radius-md)] bg-accent px-3.5 text-sm font-medium text-accent-fg"
        >
          Home
        </Link>
        <Link
          href="/viewer"
          className="inline-flex h-9 items-center rounded-[var(--radius-md)] border border-border px-3.5 text-sm font-medium"
        >
          Report viewer
        </Link>
      </div>
    </div>
  );
}
