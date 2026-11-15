# DeployMedic Design System

## Product thesis

DeployMedic helps developers find why a deployment is broken — locally, with evidence, before or after it ships. The product is a CLI that scans a project, a JSON report format, and a browser viewer that never uploads that report.

## Brand kit

Canonical graphic identity lives in `assets/brand/` (tokens, logos, README banners, social preview). Web-served copies are under `apps/web/public/brand/` and root favicons in `apps/web/public/`.

| Use | Asset |
| --- | --- |
| Dark website header | `deploymedic-logo-dark.svg` |
| Light website header | `deploymedic-logo-light.svg` |
| Standalone symbol | `deploymedic-symbol-*.svg` |
| Browser tab | `favicon.svg` / `favicon.ico` |
| Social / OG | `og-image.png` (1280 × 640) |

Logo mark: open **D**, three slashes, and medical cross — from the teal-cross concept. Favicon uses a simplified symbol for small tabs.

## Principles

1. **Evidence over opinion** — Every finding shows what was inspected and what was found.
2. **Local-first trust** — Reports stay on the machine. The viewer parses JSON in the browser only.
3. **Honest scope** — Advertise only implemented checks. Incomplete scans are labeled incomplete.
4. **Terminal as source of truth** — The website demonstrates the CLI; it does not replace it.
5. **Quiet chrome, loud signal** — Neutral surfaces; severity color only on status.
6. **Keyboard-complete** — Filters, findings, and remediation actions work without a mouse.
7. **Reduced motion** — Motion clarifies hierarchy; it never decorates.

## Information architecture

| Surface | Purpose |
| --- | --- |
| `/` | Product landing: brand, value prop, live terminal demo, install, example report, how it works, checks & limits |
| `/about` | Product thesis, local-first trust model, maintainer — SEO/about surface |
| `/viewer` | Local JSON import and diagnostic report UI |
| `/docs` | Installation, CLI reference, report format, checks, security model |
| `/docs/cli` | Commands, flags, exit codes, NO_COLOR |
| `/docs/report-format` | JSON schema and field meanings |
| `/docs/checks` | What each check inspects and what it cannot see |
| CLI | `deploymedic scan`, `deploymedic report`, `deploymedic --version` |

## Visual identity

- **Mood:** Clinical diagnostics — precise, calm, high contrast where it matters.
- **Accent:** Teal `#14B8A6` (dark) / `#08776D` (light). One accent; severity colors are separate.
- **Surfaces:** Cool charcoal — `#0B0F14` → `#151C24` with borders `#2A3540` (dark); light stack `#F5F7F8` / `#FFFFFF` / `#D9E1E5`.
- **Text:** `#F5F7F8` / muted `#A2AFBA` (dark); `#0B0F14` / muted `#40505C` (light).
- **Status (on dark):** fail `#FF8D89`, warn `#F7C875`, passed `#7CDDAD`, unknown `#A2AFBA`.
- **Typography:** Manrope (UI) + JetBrains Mono (CLI, evidence, IDs).
- **Radii:** 2px controls, 4px panels — no pill clusters, no large soft cards.
- **Shadows:** Almost none; depth from border and surface steps.
- **Forbidden:** Gradient washes, glow borders, glassmorphism, emoji hero art, fake metrics, dashboard chart filler.

## Tokens

See `apps/web/app/globals.css` for CSS custom properties (color, type, space, radius, motion, severity). Source of truth for palette values: `assets/brand/brand-tokens.css` / `brand-tokens.json`.

## Component states

Every interactive component must define: default, hover, active, focus-visible, disabled, and when relevant loading / empty / error.
