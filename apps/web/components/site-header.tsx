"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Moon, Sun, Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useTheme } from "@/lib/theme";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/viewer", label: "Report viewer" },
  { href: "/docs", label: "Docs" },
  { href: "/docs/checks", label: "Checks" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[var(--page-max)] items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center"
          onClick={() => setOpen(false)}
          aria-label="DeployMedic home"
        >
          <BrandLogo height={26} priority />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-[var(--radius-md)] px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-bg-muted text-fg"
                    : "text-fg-muted hover:bg-bg-muted hover:text-fg",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <a
            href="https://github.com/NullEx17/DeployMedic"
            className="rounded-[var(--radius-md)] px-3 py-1.5 text-sm text-fg-muted transition-colors hover:bg-bg-muted hover:text-fg"
            rel="noopener noreferrer"
            target="_blank"
          >
            GitHub
          </a>
        </nav>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            aria-label={
              theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
            }
            onClick={toggle}
            className="px-2"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="px-2 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </Button>
        </div>
      </div>

      {open ? (
        <nav
          className="border-t border-border px-4 py-3 md:hidden"
          aria-label="Mobile"
        >
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-[var(--radius-md)] px-3 py-2 text-sm text-fg-muted hover:bg-bg-muted hover:text-fg"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href="https://github.com/NullEx17/DeployMedic"
                className="block rounded-[var(--radius-md)] px-3 py-2 text-sm text-fg-muted hover:bg-bg-muted hover:text-fg"
                rel="noopener noreferrer"
                target="_blank"
                onClick={() => setOpen(false)}
              >
                GitHub
              </a>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
