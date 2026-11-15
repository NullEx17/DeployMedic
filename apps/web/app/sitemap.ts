import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/about",
    "/viewer",
    "/docs",
    "/docs/cli",
    "/docs/report-format",
    "/docs/checks",
  ];

  const lastModified = new Date();

  return routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: path === "" || path === "/about" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/about" || path === "/docs" ? 0.9 : 0.7,
  }));
}
