import type { Metadata } from "next";
import { ReportViewer } from "@/components/report/report-viewer";

export const metadata: Metadata = {
  title: "Report viewer — offline DeployMedic JSON diagnostics",
  description:
    "Import DeployMedic JSON scan results locally. Files are parsed in your browser only — never uploaded. Filter findings by severity and service.",
  keywords: [
    "DeployMedic report viewer",
    "offline deployment report",
    "JSON deployment diagnostics",
    "local-first report viewer",
    "Docker scan results",
  ],
  alternates: { canonical: "/viewer" },
  openGraph: {
    title: "DeployMedic report viewer",
    description:
      "Import DeployMedic JSON scan results locally. Parsed in-browser — never uploaded.",
    url: "/viewer",
  },
};

export default async function ViewerPage({
  searchParams,
}: {
  searchParams: Promise<{ example?: string }>;
}) {
  const params = await searchParams;
  const example =
    params.example === "broken" || params.example === "healthy"
      ? params.example
      : null;

  return <ReportViewer key={example ?? "empty"} initialExample={example} />;
}
