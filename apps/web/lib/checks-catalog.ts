export const checksCatalog = [
  {
    id: "package-json",
    service: "node",
    summary: "package.json presence, JSON validity, start/build scripts, engines.node",
  },
  {
    id: "lockfile",
    service: "node",
    summary: "Presence of a single package-manager lockfile",
  },
  {
    id: "node-version",
    service: "node",
    summary: ".nvmrc / .node-version / engines.node pin",
  },
  {
    id: "gitignore",
    service: "git",
    summary: "Whether .env files are ignored",
  },
  {
    id: "env-example",
    service: "environment",
    summary: ".env.example presence and key coverage vs local .env",
  },
  {
    id: "dockerfile",
    service: "container",
    summary: "HEALTHCHECK, non-root USER, EXPOSE documentation",
  },
  {
    id: "compose",
    service: "container",
    summary: "Compose YAML validity and service healthchecks",
  },
  {
    id: "port-config",
    service: "runtime",
    summary: "PORT env usage vs hardcoded listen ports in common entry files",
  },
  {
    id: "health-url",
    service: "http",
    summary: "Optional GET probe when --url is provided",
  },
] as const;
