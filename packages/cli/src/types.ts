import type { Finding } from "@deploymedic/core";

export type CheckContext = {
  root: string;
  url: string | null;
  readText: (relativePath: string) => Promise<string | null>;
  exists: (relativePath: string) => Promise<boolean>;
  isDirectory: (relativePath: string) => Promise<boolean>;
  listDir: (relativePath: string) => Promise<string[]>;
};

export type CheckResult = {
  checkId: string;
  findings: Finding[];
  skipped?: boolean;
  skipReason?: string;
};

export type Check = {
  id: string;
  service: string;
  description: string;
  run: (ctx: CheckContext) => Promise<CheckResult>;
};
