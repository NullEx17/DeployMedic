#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Command } from "commander";
import { parseScanReportJson } from "@deploymedic/core";
import { getCheckCatalog } from "./checks/index.js";
import {
  exitCodeForReport,
  formatReportJson,
  formatReportText,
} from "./output/format.js";
import { resolveColorEnabled, type ColorMode } from "./output/color.js";
import { runScan } from "./scan.js";
import { validateProbeUrl } from "./url.js";
import { CLI_VERSION } from "./version.js";
import { MAX_REPORT_JSON_BYTES } from "@deploymedic/core";

const program = new Command();

program
  .name("deploymedic")
  .description("Evidence-first deployment diagnostics")
  .version(CLI_VERSION);

program
  .command("scan")
  .description("Scan a project directory for deployment issues")
  .argument("[path]", "project root to scan", ".")
  .option("--url <url>", "optional HTTP URL to probe")
  .option("--json", "emit machine-readable JSON report to stdout", false)
  .option("--output <file>", "write the JSON report to a file")
  .option("--only <checks>", "comma-separated check ids to run")
  .option("--color <mode>", "auto | always | never", "auto")
  .action(async (targetPath: string, opts: {
    url?: string;
    json?: boolean;
    output?: string;
    only?: string;
    color: string;
  }) => {
    const only = opts.only
      ? opts.only.split(",").map((s) => s.trim()).filter(Boolean)
      : undefined;

    if (only?.length) {
      const known = new Set(getCheckCatalog().map((c) => c.id));
      const unknown = only.filter((id) => !known.has(id));
      if (unknown.length) {
        console.error(`Unknown check id(s): ${unknown.join(", ")}`);
        console.error(`Known: ${[...known].join(", ")}`);
        process.exitCode = 2;
        return;
      }
    }

    let probeUrl: string | null = opts.url ?? null;
    if (probeUrl) {
      const validated = validateProbeUrl(probeUrl);
      if (!validated.ok) {
        console.error(`Invalid --url: ${validated.reason}`);
        process.exitCode = 2;
        return;
      }
      probeUrl = validated.url;
    }

    const report = await runScan({
      root: targetPath,
      url: probeUrl,
      only,
    });

    const colorMode = normalizeColor(opts.color);
    const colorEnabled = resolveColorEnabled(colorMode, Boolean(process.stdout.isTTY));

    if (opts.output) {
      await writeFile(path.resolve(opts.output), formatReportJson(report), "utf8");
    }

    if (opts.json) {
      process.stdout.write(formatReportJson(report));
    } else {
      process.stdout.write(formatReportText(report, colorEnabled));
      if (opts.output) {
        process.stdout.write(`\nWrote ${path.resolve(opts.output)}\n`);
      }
    }

    process.exitCode = exitCodeForReport(report);
  });

program
  .command("report")
  .description("Pretty-print an existing DeployMedic JSON report")
  .argument("<file>", "path to a scan JSON file")
  .option("--json", "re-emit validated JSON", false)
  .option("--color <mode>", "auto | always | never", "auto")
  .action(async (file: string, opts: { json?: boolean; color: string }) => {
    const absolute = path.resolve(file);
    const { stat } = await import("node:fs/promises");
    const info = await stat(absolute);
    if (info.size > MAX_REPORT_JSON_BYTES) {
      console.error(
        `Report file exceeds ${MAX_REPORT_JSON_BYTES} byte limit (${info.size} bytes).`,
      );
      process.exitCode = 2;
      return;
    }
    const text = await readFile(absolute, "utf8");
    const result = parseScanReportJson(text);
    if (!result.ok) {
      console.error("Invalid DeployMedic report:");
      for (const err of result.errors) console.error(`  - ${err}`);
      process.exitCode = 2;
      return;
    }

    const colorMode = normalizeColor(opts.color);
    const colorEnabled = resolveColorEnabled(colorMode, Boolean(process.stdout.isTTY));

    if (opts.json) {
      process.stdout.write(formatReportJson(result.report));
    } else {
      process.stdout.write(formatReportText(result.report, colorEnabled));
      if (result.warnings.length) {
        for (const warning of result.warnings) {
          console.error(`warning: ${warning}`);
        }
      }
    }
    process.exitCode = exitCodeForReport(result.report);
  });

program
  .command("checks")
  .description("List implemented diagnostic checks")
  .action(() => {
    for (const check of getCheckCatalog()) {
      process.stdout.write(
        `${check.id.padEnd(14)} ${check.service.padEnd(12)} ${check.description}\n`,
      );
    }
  });

function normalizeColor(value: string): ColorMode {
  if (value === "always" || value === "never" || value === "auto") return value;
  console.error(`Invalid --color ${value}; using auto`);
  return "auto";
}

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 2;
});
