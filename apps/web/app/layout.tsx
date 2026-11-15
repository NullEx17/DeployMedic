import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Manrope } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { JsonLd } from "@/components/json-ld";
import {
  SITE_AUTHOR,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  absoluteUrl,
} from "@/lib/seo";
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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0B0F14" },
    { media: "(prefers-color-scheme: light)", color: "#F5F7F8" },
  ],
  colorScheme: "dark light",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [...SITE_KEYWORDS],
  authors: [{ name: SITE_AUTHOR.name, url: SITE_AUTHOR.url }],
  creator: SITE_AUTHOR.name,
  publisher: SITE_AUTHOR.name,
  category: "technology",
  applicationName: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
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
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1280,
        height: 640,
        alt: `${SITE_NAME} — Docker and Node.js deployment diagnostics`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  other: {
    "theme-color": "#0B0F14",
  },
};

const siteJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: ["Deploy Medic", "deployment diagnostics CLI"],
    url: absoluteUrl("/"),
    description: SITE_DESCRIPTION,
    inLanguage: "en",
    publisher: {
      "@type": "Person",
      name: SITE_AUTHOR.name,
      url: SITE_AUTHOR.url,
      sameAs: [SITE_AUTHOR.github, SITE_AUTHOR.url],
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: "Deployment diagnostics",
    operatingSystem: "Windows, macOS, Linux",
    url: absoluteUrl("/"),
    downloadUrl: SITE_AUTHOR.repo,
    codeRepository: SITE_AUTHOR.repo,
    description: SITE_DESCRIPTION,
    keywords: SITE_KEYWORDS.join(", "),
    license: "https://opensource.org/licenses/MIT",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Person",
      name: SITE_AUTHOR.name,
      url: SITE_AUTHOR.url,
      sameAs: [SITE_AUTHOR.github, SITE_AUTHOR.url],
    },
    featureList: [
      "Local CLI project scan",
      "Docker and Compose checks",
      "Node.js lockfile and engines checks",
      "Environment template coverage",
      "Offline JSON report viewer",
      "Evidence-based findings with remediation",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/brand/logos/deploymedic-symbol-dark.svg"),
    sameAs: [SITE_AUTHOR.repo, SITE_AUTHOR.github],
    founder: {
      "@type": "Person",
      name: SITE_AUTHOR.name,
      url: SITE_AUTHOR.url,
    },
  },
];

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
        <JsonLd data={siteJsonLd} />
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
