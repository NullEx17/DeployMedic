"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const FRAMES = [
  { delay: 0, lines: ["$ deploymedic scan ./shop-api"] },
  {
    delay: 400,
    lines: [
      "$ deploymedic scan ./shop-api",
      "",
      "DeployMedic v0.1.0",
      "target ./shop-api",
    ],
  },
  {
    delay: 900,
    lines: [
      "$ deploymedic scan ./shop-api",
      "",
      "DeployMedic v0.1.0",
      "target ./shop-api",
      "",
      "4 fail  6 warning  4 pass  1 unknown  (15 findings)",
    ],
  },
  {
    delay: 1400,
    lines: [
      "$ deploymedic scan ./shop-api",
      "",
      "DeployMedic v0.1.0",
      "target ./shop-api",
      "",
      "4 fail  6 warning  4 pass  1 unknown  (15 findings)",
      "",
      "Incomplete scan",
      "  • One or more findings have severity unknown",
      "",
      "node",
      "  FAIL  LCK-001  No lockfile found",
      "         evidence    Checked for package-lock.json, pnpm-lock.yaml…",
      "         remediate   Commit the lockfile for your package manager",
      "  FAIL  PRT-001  Hardcoded listen port",
      "         evidence    server.js: listen(3000)",
      "         remediate   Bind to process.env.PORT with a local fallback",
      "",
      "git",
      "  FAIL  GIT-001  .env is not ignored",
      "         evidence    Parsed .gitignore — no rule matched .env",
      "         remediate   Add .env and .env.* to .gitignore",
      "",
      "finished in 48ms",
    ],
  },
];

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getServerReducedMotionSnapshot() {
  return false;
}

function colorize(line: string): ReactNode {
  if (line.startsWith("$ ")) {
    return (
      <>
        <span className="text-fg-faint">$ </span>
        <span className="text-fg">{line.slice(2)}</span>
      </>
    );
  }
  if (line.startsWith("DeployMedic")) {
    return <span className="font-semibold text-accent">{line}</span>;
  }
  if (line.includes("FAIL")) {
    return <span className="text-sev-fail">{line}</span>;
  }
  if (line.includes("WARN") || line === "Incomplete scan") {
    return <span className="text-sev-warning">{line}</span>;
  }
  if (/^\d+ fail/.test(line)) {
    return (
      <>
        <span className="text-sev-fail">4 fail</span>
        {"  "}
        <span className="text-sev-warning">6 warning</span>
        {"  "}
        <span className="text-sev-pass">4 pass</span>
        {"  "}
        <span className="text-sev-unknown">1 unknown</span>
        <span className="text-fg-faint">{"  (15 findings)"}</span>
      </>
    );
  }
  if (
    line.startsWith("         ") ||
    line.startsWith("target") ||
    line.startsWith("finished") ||
    line.startsWith("  •")
  ) {
    return <span className="text-fg-faint">{line}</span>;
  }
  if (
    line === "node" ||
    line === "git" ||
    line === "environment" ||
    line === "container"
  ) {
    return <span className="font-medium text-fg">{line}</span>;
  }
  return <span className="text-fg-muted">{line}</span>;
}

export function TerminalDemo({ className }: { className?: string }) {
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getServerReducedMotionSnapshot,
  );
  const [frame, setFrame] = useState(0);
  const displayFrame = reduced ? FRAMES.length - 1 : frame;

  useEffect(() => {
    if (reduced) return;
    const timers = FRAMES.map((f, index) =>
      window.setTimeout(() => setFrame(index), f.delay),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [reduced]);

  const lines = FRAMES[displayFrame]?.lines ?? FRAMES[0].lines;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--radius-lg)] border border-border bg-[#0c0c0e] shadow-none",
        className,
      )}
      role="region"
      aria-label="Terminal demonstration of deploymedic scan"
    >
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
        <span className="size-2.5 rounded-full bg-white/15" aria-hidden />
        <span className="size-2.5 rounded-full bg-white/15" aria-hidden />
        <span className="size-2.5 rounded-full bg-white/15" aria-hidden />
        <span className="ml-2 font-mono text-[11px] text-white/40">
          deploymedic — scan
        </span>
      </div>
      <pre className="max-h-[420px] overflow-auto p-4 font-mono text-[12px] leading-5 sm:text-[13px]">
        {lines.map((line, i) => (
          <div
            key={`${displayFrame}-${i}`}
            className="min-h-[1.25rem] whitespace-pre-wrap"
          >
            {colorize(line)}
            {i === lines.length - 1 && displayFrame < FRAMES.length - 1 ? (
              <span className="dm-caret" aria-hidden />
            ) : null}
          </div>
        ))}
      </pre>
    </div>
  );
}
