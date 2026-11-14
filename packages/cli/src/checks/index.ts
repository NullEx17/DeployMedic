import type { Check } from "../types.js";
import { packageJsonCheck } from "./package-json.js";
import { lockfileCheck } from "./lockfile.js";
import { gitignoreCheck } from "./gitignore.js";
import { envExampleCheck } from "./env-example.js";
import { dockerfileCheck } from "./dockerfile.js";
import { composeCheck } from "./compose.js";
import { nodeVersionCheck } from "./node-version.js";
import { healthUrlCheck } from "./health-url.js";
import { portConfigCheck } from "./port-config.js";

/** Checks that are implemented and advertised. Order = CLI run order. */
export const CHECKS: Check[] = [
  packageJsonCheck,
  lockfileCheck,
  nodeVersionCheck,
  gitignoreCheck,
  envExampleCheck,
  dockerfileCheck,
  composeCheck,
  portConfigCheck,
  healthUrlCheck,
];

export function getCheckCatalog() {
  return CHECKS.map((c) => ({
    id: c.id,
    service: c.service,
    description: c.description,
  }));
}
