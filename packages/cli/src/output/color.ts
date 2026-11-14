import pc from "picocolors";

export type ColorMode = "auto" | "always" | "never";

function envDisablesColor(): boolean {
  if (process.env.NO_COLOR !== undefined && process.env.NO_COLOR !== "") return true;
  if (process.env.FORCE_COLOR === "0") return true;
  return false;
}

export function resolveColorEnabled(mode: ColorMode, isTty: boolean): boolean {
  if (mode === "never") return false;
  if (mode === "always") return true;
  if (envDisablesColor()) return false;
  return isTty;
}

export function createPalette(enabled: boolean) {
  const wrap =
    (fn: (s: string) => string) =>
    (s: string): string =>
      enabled ? fn(s) : s;

  return {
    enabled,
    bold: wrap(pc.bold),
    dim: wrap(pc.dim),
    teal: wrap(pc.cyan),
    fail: wrap(pc.red),
    warning: wrap(pc.yellow),
    pass: wrap(pc.green),
    unknown: wrap(pc.gray),
    muted: wrap(pc.gray),
  };
}

export type Palette = ReturnType<typeof createPalette>;
