"use client";

import { cn } from "@/lib/cn";
import { useTheme } from "@/lib/theme";

type BrandLogoProps = {
  variant?: "full" | "symbol";
  className?: string;
  /** Height in px for the full wordmark; symbol scales to this height. */
  height?: number;
  priority?: boolean;
};

export function BrandLogo({
  variant = "full",
  className,
  height = 28,
  priority = false,
}: BrandLogoProps) {
  const { theme } = useTheme();
  const dark = theme === "dark";

  if (variant === "symbol") {
    const src = dark
      ? "/brand/logos/deploymedic-symbol-dark.svg"
      : "/brand/logos/deploymedic-symbol-light.svg";
    return (
      // eslint-disable-next-line @next/next/no-img-element -- brand SVG; theme-switched
      <img
        src={src}
        alt="DeployMedic"
        width={Math.round(height * (322 / 244))}
        height={height}
        className={cn("h-auto w-auto", className)}
        style={{ height }}
        decoding="async"
        {...(priority ? { fetchPriority: "high" as const } : {})}
      />
    );
  }

  const src = dark
    ? "/brand/logos/deploymedic-logo-dark.svg"
    : "/brand/logos/deploymedic-logo-light.svg";
  const width = Math.round(height * (510 / 115));

  return (
    // eslint-disable-next-line @next/next/no-img-element -- brand SVG; theme-switched
    <img
      src={src}
      alt="DeployMedic"
      width={width}
      height={height}
      className={cn("h-auto w-auto", className)}
      style={{ height }}
      decoding="async"
      {...(priority ? { fetchPriority: "high" as const } : {})}
    />
  );
}
