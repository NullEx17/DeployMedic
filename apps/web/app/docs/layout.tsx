import { DocsNav } from "@/components/docs-nav";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto grid max-w-[var(--page-max)] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[200px_1fr]">
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-faint">
          Documentation
        </p>
        <DocsNav />
      </aside>
      <article className="min-w-0 max-w-[72ch]">{children}</article>
    </div>
  );
}
