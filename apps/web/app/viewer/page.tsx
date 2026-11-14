import type { Metadata } from "next";
import { ReportViewer } from "@/components/report/report-viewer";

export const metadata: Metadata = {
  title: "Report viewer",
  description:
    "Import DeployMedic JSON scan results locally. Parsed in-browser — never uploaded.",
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
