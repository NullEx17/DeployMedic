"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/docs", label: "Overview" },
  { href: "/docs/cli", label: "CLI reference" },
  { href: "/docs/report-format", label: "Report format" },
  { href: "/docs/checks", label: "Checks" },
];

export function DocsNav() {
  const pathname = usePathname();

  return (
    <nav
      className="mt-3 flex flex-row gap-1 overflow-x-auto lg:flex-col"
      aria-label="Docs"
    >
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "whitespace-nowrap rounded-[var(--radius-md)] px-3 py-1.5 text-sm transition-colors",
              active
                ? "bg-bg-muted font-medium text-fg"
                : "text-fg-muted hover:bg-bg-muted hover:text-fg",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
