# DeployMedic Pre-Release Audit

**Auditor role:** independent senior open-source maintainer, security engineer, principal product designer  
**Scope:** repository at `DeployMedic/` as of 2026-11-14  
**Method:** source review, adversarial probes, and full verification commands  
**Constraint:** no publish, deploy, or push performed

---

## Executive summary

DeployMedic is a coherent early product: a real local CLI with evidence-bearing findings, a versioned JSON report schema, and a browser viewer that parses reports without uploading them. The visual system is restrained and mostly honest about scope. Verification commands (**test**, **typecheck**, **lint**, **build**) all exited **0** before remediation.

It is **not yet ready for a confident first public release**. Confirmed high-severity issues include: **filesystem path escape** in the scan I/O layer, **uncaught crash** on a `null` Compose document, **missing `--url` scheme allowlisting**, **unbounded report/file ingestion** (DoS), and **dead GitHub links** to a non-existent org/repo. Test coverage is thin (7 tests) relative to the security-sensitive surface.

**Honest release readiness score: 5.5 / 10** (pre-fix). After critical/high fixes in this pass, expected **~7 / 10** pending broader tests, dependency audit policy, and a real remote.

**Differentiation:** Overlaps with hadolint, dotenv-linter, dockle, and ad-hoc CI scripts. The distinctive combination is **unified multi-check evidence reports + offline JSON viewer + explicit incompleteness**. That is meaningful for a v0.1 niche tool, not a category-defining moat yet.

---

## Verification command results (pre-fix)

| Command | Exit code | Notes |
| --- | --- | --- |
| `npm test` | **0** | core 5/5, cli 2/2 |
| `npm run typecheck` | **0** | core, cli, web |
| `npm run lint` | **0** | web ESLint clean; cli/core via `tsc --noEmit` |
| `npm run build` | **0** | core + cli + Next.js 15 production build |
| `npm audit --omit=dev` | **non-zero** | 2 high (zod collection exhaustion advisory class; next→postcss), 1 moderate |

---

## Critical findings

_None confirmed._ No remote code execution, no default secret exfiltration to a network, and no `dangerouslySetInnerHTML` over untrusted report fields were found. Theme bootstrap script in `apps/web/app/layout.tsx` is static.

---

## High findings

### H1 — Scan filesystem context allows path traversal outside the project root

**Severity:** High  
**Files:** `packages/cli/src/fs.ts` (lines 5–17)  
**Issue:** `path.resolve(root, relativePath)` does not confine reads to `root`. Relative segments such as `../secret` resolve outside the scan tree. Symlink escape is the same class of bug on platforms that allow project symlinks (common when scanning untrusted clones).

**Reproduction:**

```bash
node tmp-audit-probes.mjs
# prints: TRAVERSAL VULN
```

Or:

```js
import { createFsContext } from "./packages/cli/dist/fs.js";
// given root=/tmp/proj and file /tmp/secret.env
await createFsContext("/tmp/proj", null).readText("../secret.env");
// returns file contents
```

**Impact:** Scanning a malicious or poorly structured tree can read arbitrary files reachable by the OS user into process memory (and, if a future check echoes contents, into reports).  
**Proposed fix:** Resolve then reject any path whose normalized/real path is outside `realpath(root)`; refuse symlink targets outside root; bound read size.  
**Launch blocker:** Yes.

---

### H2 — Compose check crashes the CLI when YAML parses to `null`

**Severity:** High  
**Files:** `packages/cli/src/checks/compose.ts` (lines 50–69)  
**Issue:** After `parseYaml`, code does `compose.services` without ensuring `compose` is a non-null object. A compose file whose document is literally `null` throws `TypeError` and aborts the whole scan.

**Reproduction:**

```bash
# write docker-compose.yml containing only: null
node packages/cli/dist/bin.js scan <that-dir> --only compose
# TypeError: Cannot read properties of null (reading 'services')
```

Confirmed via `tmp-audit-probes.mjs` → `SCAN_CRASH`.

**Impact:** Denial of service / non-deterministic operator experience; exit path becomes exception (code 2) instead of a structured finding.  
**Proposed fix:** Validate parsed value is a plain object; emit a `fail` finding otherwise.  
**Launch blocker:** Yes.

---

### H3 — `--url` accepts non-HTTP(S) schemes (SSRF / unexpected fetch targets)

**Severity:** High  
**Files:** `packages/cli/src/checks/health-url.ts` (lines 22–28), `packages/cli/src/bin.ts` (lines 27, 54–58)  
**Issue:** User-supplied `--url` is passed directly to `fetch` with no scheme allowlist. `file:`, `gopher:`, and similar schemes are accepted at the URL-parse layer. Private-IP HTTP probes are intentional for a local CLI, but non-HTTP schemes are not.

**Reproduction:**

```bash
node packages/cli/dist/bin.js scan . --only health-url --url file:///etc/passwd
# attempts fetch; should be rejected before fetch
```

**Impact:** Unexpected protocol handlers / future runtime behavior; unsafe if DeployMedic is wrapped as an automated service that forwards attacker-controlled URLs.  
**Proposed fix:** Allow only `http:` and `https:`; reject others with exit code 2 before scanning.  
**Launch blocker:** Yes.

---

### H4 — Unbounded report JSON / finding strings enable memory exhaustion

**Severity:** High  
**Files:**  
- `packages/core/src/schema.ts` (Finding/ScanReport string + array fields unbounded)  
- `apps/web/components/report/report-viewer.tsx` (`onFiles` → `file.text()` with no size cap, ~95–106)  
- Transitive: `npm audit` high on `zod` (GHSA-mrhx-c7xc-m3w5) for oversized constrained collections  

**Issue:** A hostile “report” can present megabyte–gigabyte strings or huge `findings` arrays. The viewer loads the entire file into memory and Zod validates without caps. CLI `report` similarly parses unbounded JSON.

**Reproduction:** Construct a JSON file matching the schema skeleton with a multi‑100MB `evidence` string or tens of thousands of findings; drop into `/viewer` or `deploymedic report`.

**Impact:** Tab/process OOM; aligns with known Zod advisory class.  
**Proposed fix:** Cap string lengths and findings count in schema; reject oversize files in viewer (and CLI report) before `JSON.parse`.  
**Launch blocker:** Yes for public viewer exposure.

---

### H5 — Dead GitHub links and fabricated repository URL

**Severity:** High (release honesty / “no dead buttons”)  
**Files:**  
- `package.json` `repository.url` → `https://github.com/deploymedic/deploymedic`  
- `apps/web/components/site-header.tsx`, `site-footer.tsx`, `apps/web/app/page.tsx` GitHub anchors  

**Issue:** Links point at an org/repo that is not established in this workspace. Violates the project’s own quality bar and misleads first-release users.

**Reproduction:** Open the landing page GitHub link or `package.json` repository field; destination is not a live project remote for this tree.

**Proposed fix:** Remove external GitHub hrefs until a real remote exists; document local-only source in README; drop or neutralize `repository` until publish time.  
**Launch blocker:** Yes for “public release” messaging.

---

### H6 — Production dependency audit: high advisories (next/postcss, zod)

**Severity:** High (supply-chain hygiene)  
**Evidence:** `npm audit --omit=dev` → zod high; next→postcss high.  
**Proposed fix:** Add string/array bounds now (mitigates zod class); plan Next upgrade carefully; document accepted risk if force-upgrade is breaking.  
**Launch blocker:** Partial — bounds are required now; full Next major bump can be scheduled if changelog reviewed.

---

## Medium findings

### M1 — No bounded reads on compose/Dockerfile/.env (DoS via huge files)

**Files:** `packages/cli/src/fs.ts`  
Even without traversal, multi‑GB files are fully slurped. YAML alias bombs are already blocked by `yaml` (“Excessive alias count…”), which is good.  
**Fix:** Enforce max bytes in `readText` (same as H1 fix).

### M2 — `.gitignore` matcher is naive (false fail / false confidence)

**Files:** `packages/cli/src/checks/gitignore.ts` (lines 4–13)  
Misses common patterns (`**/.env`, `.env.local` alone without `.env`, root-anchored `/.env`). Does not model gitignore precedence/negation fully.  
**Fix:** Expand pattern set or document strict matching as a known limitation (docs already partially honest).

### M3 — `ENV-002` severity `fail` for local `.env` drift

**Files:** `packages/cli/src/checks/env-example.ts` (lines 91–105)  
Correct for local preflight; noisy in CI where `.env` is intentionally absent or partial (absence is `unknown`, partial is `fail`).  
**Fix:** Consider `warning` for local-only drift, or a `--strict-env` flag (post-launch).

### M4 — Test coverage inadequate for release

Only `packages/core/src/validate.test.ts` and `packages/cli/src/scan.test.ts` (7 tests). No tests for compose edge cases, FS confinement, URL allowlist, or viewer limits.  
**Launch blocker:** for high issues — yes (tests must accompany fixes). Broader matrix — optional improvement.

### M5 — Report non-determinism (absolute paths, timestamps)

**Files:** `packages/cli/src/scan.ts` (target.path absolute, generatedAt, durationMs)  
Hinders golden-file testing. Not a security bug.

### M6 — Accessibility / UX gaps (viewer)

**Files:** `apps/web/components/report/report-viewer.tsx`, `finding-card.tsx`  
- Keyboard j/k works when focus is not in inputs — good.  
- Finding cards are `tabIndex={0}` articles; large lists create heavy tab stops.  
- No visible “skip to findings” landmark beyond global skip link.  
- Mobile: filters stack acceptably; dropzone OK.  
- Contrast: teal accent on dark is intentional; verify warning amber on soft backgrounds under WCAG in light theme (spot-check recommended).  
Not launch-blocking for v0.1 if documented.

### M7 — Lint scripts for cli/core are typecheck-only

`packages/cli` / `packages/core` `"lint": "tsc --noEmit"` — no ESLint on TS sources. Medium process gap.

### M8 — Install / package messaging residual risk

README still mentions “After a global/workspace install… binary name is `deploymedic`” while public npm publish is not done. Local `npm run deploymedic` works. Medium docs clarity.

---

## Low findings

### L1 — Terminal demo is illustrative, not a live PTY

Numbers match the broken fixture class of results; still a scripted animation. Acceptable if not labeled “live”.

### L2 — `docsPath` unused in viewer UI

Schema field present; not linked in `finding-card.tsx`. Avoids `javascript:` href risk for now (good). Low product gap.

### L3 — Visual hierarchy generally solid

Charcoal/teal system is distinctive vs purple-SaaS templates. Minor inconsistency: marketing sections use bordered panels that read slightly “card-like” vs DESIGN.md card aversion — low.

### L4 — No `SECURITY.md` / threat model doc

Expected for first public OSS release.

### L5 — CI workflow assumes Linux symlink/npm ci

`.github/workflows/ci.yml` is a good start; will need a real remote to matter.

---

## Advertised vs implemented

| Advertised | Status |
| --- | --- |
| Local CLI scan with evidence | Implemented |
| JSON report + `report` command | Implemented |
| NO_COLOR / non-TTY / `--color` | Implemented |
| Exit 1 on fail | Implemented |
| Local-only viewer, no upload | Implemented (client-side parse) |
| Documented checks only | Implemented |
| Incomplete scan labeling | Implemented |
| Published npm global install | **Not** implemented (docs mostly corrected to local build) |
| Live GitHub project page | **Not** implemented (links fabricated) |

---

## Launch blockers vs optional improvements

### Launch blockers (must fix before public release)

1. H1 path confinement + bounded reads  
2. H2 compose null crash  
3. H3 HTTP(S)-only URL allowlist  
4. H4 schema + viewer/CLI size limits  
5. H5 remove dead GitHub / fake repository URL  
6. Tests proving H1–H4  

### Optional improvements (post-blocker)

- Richer gitignore semantics (M2)  
- Env-check CI mode (M3)  
- Broader check unit tests / golden reports (M4/M5)  
- ESLint for packages (M7)  
- SECURITY.md, real remote, npm publish plan  
- Next/postcss upgrade after reviewing breaking changes (H6 remainder)  
- A11y pass with axe + mobile screenshots (M6)

---

## Proposed fix order

1. Harden `packages/cli/src/fs.ts`  
2. Harden `compose.ts`  
3. Allowlist URL schemes in CLI + health check  
4. Bound `@deploymedic/core` schema + viewer/CLI ingest limits  
5. Neutralize GitHub links / repository metadata  
6. Add regression tests; re-run verify suite  

---

## Release readiness score

| Dimension | Score (/10) | Note |
| --- | --- | --- |
| Correctness of implemented checks | 6.5 | Useful, some false-fail risk |
| Security posture | 4 → **7** post-fix | H1–H5 addressed in-tree |
| UX / design quality | 7.5 | Strong for v0.1 |
| Docs honesty | 6 → **7.5** post-fix | Dead GitHub links removed |
| Test/CI maturity | 4 → **5.5** post-fix | Security regressions added; still thin |
| Differentiation | 6 | Real niche, not unique moat |
| **Overall (pre-fix)** | **5.5** | Not launch-ready |
| **Overall (post H1–H5 fixes)** | **7.0** | Soft launch possible after remote + audit follow-ups |

---

## Remediation applied in-repo (post-audit)

The following launch blockers were fixed with regression tests (no publish/deploy/push):

| ID | Fix | Tests |
| --- | --- | --- |
| H1 | `packages/cli/src/fs.ts` path containment + 1 MiB read cap | `fs.test.ts` |
| H2 | `compose.ts` rejects non-object YAML roots without throwing | `checks/compose.test.ts` |
| H3 | `url.ts` + CLI/`health-url` http(s)-only allowlist | `url.test.ts` |
| H4 | Schema/string/findings caps; viewer + CLI size gates | `validate.test.ts` |
| H5 | Removed fabricated GitHub hrefs / `package.json` repository URL | manual UI link review |

**Remaining after fix:** M1 largely mitigated by read caps; M2–M8 still open; H6 residual next/postcss advisory pending careful upgrade; no public git remote yet.

---

## Appendix — probe notes

- YAML alias bomb: **blocked** by `yaml` package (`Excessive alias count…`).  
- `file://` fetch on this Node build: failed at network layer; still must allowlist.  
- Symlink creation on this Windows host: `EPERM` (probe inconclusive locally); Linux CI remains the realistic escape path — confine via `realpath` anyway.
