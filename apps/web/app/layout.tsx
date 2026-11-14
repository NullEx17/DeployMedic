import type { Metadata } from "next";
import { JetBrains_Mono, Manrope } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DeployMedic — Evidence-first deployment diagnostics",
    template: "%s · DeployMedic",
  },
  description:
    "Scan a project for deployment issues locally. Import JSON reports in the browser without uploading them.",
  metadataBase: new URL("https://deploymedic.dev"),
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "DeployMedic — Evidence-first deployment diagnostics",
    description:
      "Scan a project for deployment issues locally. Import JSON reports in the browser without uploading them.",
    images: [
      {
        url: "/og-image.png",
        width: 1280,
        height: 640,
        alt: "DeployMedic — Docker deployment diagnostics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DeployMedic — Evidence-first deployment diagnostics",
    description:
      "Scan a project for deployment issues locally. Import JSON reports in the browser without uploading them.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('dm-theme');if(t==='light')document.documentElement.classList.remove('dark');else document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${manrope.variable} ${jetbrains.variable} min-h-dvh bg-bg font-sans text-fg antialiased`}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-[var(--radius-md)] focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-fg"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
