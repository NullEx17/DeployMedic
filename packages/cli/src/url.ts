export type UrlValidation =
  | { ok: true; url: string }
  | { ok: false; reason: string };

/**
 * Health probes may only use http(s). Other schemes (file, gopher, etc.) are rejected.
 * Private-network http(s) targets remain allowed — this CLI is local-first by design.
 */
export function validateProbeUrl(raw: string): UrlValidation {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return { ok: false, reason: "URL is not absolute or is malformed." };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      ok: false,
      reason: `Unsupported URL scheme "${parsed.protocol.replace(/:$/, "")}". Only http and https are allowed.`,
    };
  }

  if (!parsed.hostname) {
    return { ok: false, reason: "URL must include a hostname." };
  }

  return { ok: true, url: parsed.toString() };
}
