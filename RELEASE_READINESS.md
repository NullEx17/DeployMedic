# DeployMedic Release Readiness

**Date:** 2026-11-14  
**Scope:** Release-candidate hardening on the existing monorepo (no publish, deploy, remote creation, or push)

---

## Exact verification results

| Command | Exit code | Notes |
| --- | --- | --- |
| `npm test` | **0** | core **7/7**, cli **23/23** (30 total) |
| `npm run typecheck` | **0** | core, cli, web |
| `npm run lint` | **0** | web ESLint flat config; cli/core via `tsc --noEmit` |
| `npm run build` | **0** | Next.js **16.4.6** production build |
| `npm audit --omit=dev` | **0** | **found 0 vulnerabilities** |
| `npm run verify-pack` | **0** | dry-run packs + tarball install + CLI scan of `fixtures/sample-healthy` |

Full lint/typecheck/build/audit/pack were re-run after the Next 16 and React lint fixes.

---

## Dependency advisory status

### Production (`npm audit --omit=dev`)

**Clean — 0 vulnerabilities.**

| Prior advisory | Chain | Resolution |
| --- | --- | --- |
| **zod** high `<4.6.6` (GHSA-mrhx-c7xc-m3w5) | `@deploymedic/core` → zod@3.x | Upgraded to **zod@4.6.7**; schema migrated to `z.iso.datetime()`, `z.url()`, explicit `Severity` union |
| **postcss** high `<=8.5.22` | `next@15` → nested postcss@8.4.31 | Upgraded **next** + **eslint-config-next** to **16.4.6** (ships postcss@8.5.33). Root `overrides.postcss=8.5.33` retained as belt-and-suspenders |
| **next** moderate (via postcss) | same | Cleared by Next 16.4.6 |

**Not used:** `npm audit fix --force` (would have been a blind major bump). Next 16 was applied deliberately and verified with build + lint migration.

### Development (`npm audit` including dev)

**7 moderate** remaining — all `minimatch` via `eslint-config-next` → `typescript-eslint` (`@typescript-eslint/typescript-estree`).

- Advisory range reported as `minimatch 7.0.0 - 11.0.0`.
- Latest `minimatch@11.0.8` remains inside that reported range; no compatible patched escape without replacing the ESLint toolchain.
- **Justification for not excluding via audit config:** documented here instead of hiding. Impact is **dev-time lint only**, not runtime CLI/viewer packages.
- `npm audit fix` (non-force) did not clear these.

---

## Changes made

### Security & dependencies
- Zod 4.6.7 + schema API updates; severity typing hardened for TS.
- Next.js 16.4.6 + eslint-config-next 16.4.6; ESLint flat config (`eslint .`).
- postcss override `8.5.33`.

### Gitignore correctness
- New `packages/cli/src/gitignore/match.ts` using the `ignore` package.
- Supports negation, nested `.gitignore`, directory-scoped patterns, bounded confined walk.
- `gitignore` check probes `.env`, `.env.local`, nested paths; warns if `.env.example` is ignored.
- Regression tests in `gitignore/match.test.ts`.

### Tests & fixtures
- Compose fixtures: `fixtures/compose-healthy`, `compose-broken`, `compose-malformed`, `compose-proxy-mismatch`.
- CLI integration: exit codes, `--json`, malformed report, `file://` rejection.
- Security: oversized reads, symlink escape (skipped on Windows without privilege), compose edge scans.
- Prior confinement / URL / schema size tests retained.

### Package quality
- CLI `exports` map added.
- `npm run verify-pack` packs `@deploymedic/core` + `@deploymedic/cli`, installs tarballs outside the monorepo, runs CLI successfully.
- **Not published to npm.**

### UI/UX (verified issues only)
- Finding cards: visible `focus-visible` outline (keyboard).
- Theme via `useSyncExternalStore` (no sync setState-in-effect).
- Mobile nav closes on link click.
- Terminal demo respects reduced motion without forbidden effect patterns.
- Report viewer initializes examples from props/`key` (no load-in-effect).
- Preserved dark-first charcoal/teal system.

### Open-source readiness
- `CONTRIBUTING.md`, `SECURITY.md`
- `.github/ISSUE_TEMPLATE/*`, `PULL_REQUEST_TEMPLATE.md`
- README updated with honest local commands, verify-pack, no fabricated GitHub remote
- Docs check page updated for gitignore behavior / http(s)-only probes

---

## Remaining blockers

| Item | Severity | Notes |
| --- | --- | --- |
| No public git remote yet | Process | Intentionally not created this session |
| Dev-only minimatch advisories (×7 moderate) | Low for runtime RC | Upstream eslint toolchain; monitor |
| Gitignore walk is bounded | Known limit | Very deep trees may miss nested ignores (documented) |
| npm publish / GitHub Pages deploy | Out of scope | Do not publish until maintainers approve |

Non-blockers: richer port-graph analysis, axe CI, CODE_OF_CONDUCT (optional).

---

## Current release readiness score

**8.5 / 10** — suitable for a **public GitHub launch as a v0.1.0 release candidate**, provided a real remote is created and the first tagged release notes cite known limits in `SECURITY.md` / docs.

Delta from prior audit (~7.0): production audit clean, gitignore correctness, pack verification, broader tests, OSS scaffolding, Next/Zod upgrades verified.

---

## Recommended next steps

1. Create the real GitHub repository (human); point README “Source” links at it.
2. Tag `v0.1.0` after a final maintainer review of `SECURITY.md` contact path.
3. Watch `typescript-eslint` / `minimatch` for a patched release; re-run `npm audit`.
4. Optionally add Playwright smoke for `/viewer` keyboard path.
5. Publish `@deploymedic/core` then `@deploymedic/cli` to npm **only after** explicit approval (not done here).

---

## Differentiation (unchanged thesis)

DeployMedic’s value is the **evidence-first multi-check report + offline viewer + explicit incompleteness**, not inventing a new container linter category. That remains a credible niche for an honest v0.1.
