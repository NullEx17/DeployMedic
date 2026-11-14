"use client";

import { CopyButton } from "@/components/copy-button";

const BUILD_AND_SCAN = `npm install
npm run build:core && npm run build:cli
node packages/cli/dist/bin.js scan .`;

export function InstallCommand({
  command = "node packages/cli/dist/bin.js scan .",
}: {
  command?: string;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center overflow-x-auto rounded-[var(--radius-md)] border border-border bg-bg-elevated px-3 py-2 font-mono text-sm text-fg">
        <span className="mr-2 select-none text-fg-faint" aria-hidden>
          $
        </span>
        <code className="whitespace-nowrap">{command}</code>
      </div>
      <CopyButton value={command} label="Copy" />
    </div>
  );
}

export function SetupCommands() {
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-[var(--radius-md)] border border-border bg-bg-elevated p-4 font-mono text-[13px] leading-6 text-fg">
        <pre>{BUILD_AND_SCAN}</pre>
      </div>
      <CopyButton value={BUILD_AND_SCAN} label="Copy setup" />
    </div>
  );
}
