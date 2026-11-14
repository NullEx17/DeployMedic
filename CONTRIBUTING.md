# Contributing to DeployMedic

Thanks for helping improve DeployMedic. This project prefers small, evidence-based changes over broad rewrites.

## Development setup

```bash
npm install
npm run build:core
npm run build:cli
npm test
npm run dev
```

Requires Node.js 20+.

## Workflow

1. Create a focused branch for one concern (check logic, docs, viewer a11y, etc.).
2. Add or update tests next to the code you change (`*.test.ts`).
3. Run `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build` before opening a PR.
4. If you change scan behavior, update `fixtures/` and run `npm run sync-fixtures`.
5. Do not advertise features that are not implemented.

## Package layout

| Path | Package | Publishable |
| --- | --- | --- |
| `packages/core` | `@deploymedic/core` | yes |
| `packages/cli` | `@deploymedic/cli` | yes |
| `apps/web` | `@deploymedic/web` | no (private app) |

## Security reports

See [SECURITY.md](./SECURITY.md). Do not file public issues for undisclosed vulnerabilities.
