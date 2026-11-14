import type { Finding } from "@deploymedic/core";
import type { Check } from "../types.js";
import {
  assessEnvIgnore,
  collectGitignoreFiles,
} from "../gitignore/match.js";

export const gitignoreCheck: Check = {
  id: "gitignore",
  service: "git",
  description: "Checks that secret env files are ignored via gitignore rules",
  async run(ctx) {
    const findings: Finding[] = [];
    const files = await collectGitignoreFiles(ctx);

    if (!files.length) {
      findings.push({
        id: "GIT-001",
        checkId: "gitignore",
        severity: "warning",
        service: "git",
        title: "No .gitignore at scan root",
        description:
          "Without a .gitignore, local secret files are easier to commit accidentally.",
        evidence: `${ctx.root}/.gitignore not found (no nested gitignore files discovered either).`,
        impact: "Environment secrets may be committed and deployed or leaked.",
        remediation:
          "Add a .gitignore that includes .env and other local secret paths for your stack.",
        docsPath: "/docs/checks#gitignore",
      });
      return { checkId: "gitignore", findings };
    }

    const assessment = assessEnvIgnore(files);
    // Core requirement: root `.env` must be ignored. Additional probes strengthen confidence.
    const rootEnvIgnored = assessment.ignoredSecrets.includes(".env");
    const localEnvIgnored = assessment.ignoredSecrets.includes(".env.local");

    if (!rootEnvIgnored) {
      findings.push({
        id: "GIT-001",
        checkId: "gitignore",
        severity: "fail",
        service: "git",
        title: ".env is not ignored",
        description:
          "Gitignore rules (including nested files and negation) do not ignore `.env`.",
        evidence: `Checked ${assessment.gitignoreCount} gitignore file(s). Tracked secret probes: ${assessment.trackedSecrets.join(", ") || "(none)"}.`,
        impact:
          "API keys and credentials may enter git history and deploy artifacts.",
        remediation:
          "Add `.env` and `.env.*` to .gitignore (keep `.env.example` tracked with a negation if needed).",
        docsPath: "/docs/checks#gitignore",
      });
    } else if (!localEnvIgnored) {
      findings.push({
        id: "GIT-001",
        checkId: "gitignore",
        severity: "warning",
        service: "git",
        title: ".env ignored, but .env.local is not",
        description:
          "Root `.env` is ignored, but `.env.local` is still trackable under current rules.",
        evidence: `Ignored: ${assessment.ignoredSecrets.join(", ")}. Still tracked: ${assessment.trackedSecrets.join(", ")}.`,
        impact: "Local override secrets in `.env.local` may be committed.",
        remediation:
          "Add `.env.*` (with `!.env.example` if desired) or an explicit `.env.local` rule.",
        docsPath: "/docs/checks#gitignore",
      });
    } else {
      findings.push({
        id: "GIT-001",
        checkId: "gitignore",
        severity: "pass",
        service: "git",
        title: ".env files are ignored",
        description:
          "Gitignore rules ignore common secret env paths (root and nested rules applied).",
        evidence: `Ignored probes: ${assessment.ignoredSecrets.join(", ")}. Gitignore files: ${assessment.gitignoreCount}.`,
        impact: "None.",
        remediation: "No action required.",
        docsPath: "/docs/checks#gitignore",
      });
    }

    if (
      rootEnvIgnored &&
      assessment.examplesUnexpectedlyIgnored.includes(".env.example")
    ) {
      findings.push({
        id: "GIT-002",
        checkId: "gitignore",
        severity: "warning",
        service: "git",
        title: ".env.example appears ignored",
        description:
          "`.env.example` is ignored by current rules, so the env contract may not be committed.",
        evidence: "Probe `.env.example` is ignored (often from a broad `.env*` rule without negation).",
        impact: "New environments lack a documented variable template in git.",
        remediation: "Add `!.env.example` after the ignore rule, or narrow the pattern to `.env.*` carefully.",
        docsPath: "/docs/checks#gitignore",
      });
    }

    return { checkId: "gitignore", findings };
  },
};
