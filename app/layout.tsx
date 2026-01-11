// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LightRays from "./LightRays";
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const siteName = "Editra";
const defaultTitle = "Editra - Postprodukce videí v Plzni";
const defaultDescription =
  "Postprodukce videí v Plzni: VFX, color grading, mastering a automatizované QC. Spolehlivé výstupy pro TV, online i kino.";
const defaultKeywords = [
  "postprodukce videí",
  "postprodukce videí v Plzni",
  "postprodukce Plzeň",
  "video postprodukce",
  "VFX Plzeň",
  "color grading",
  "střih videa",
  "finishing",
  "postprodukční studio",
];

const businessJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: siteName,
  description: defaultDescription,
  url: siteUrl,
  email: "info@editra.cz",
  telephone: "+420737869067",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Plzeň",
    addressCountry: "CZ",
  },
  areaServed: {
    "@type": "City",
    name: "Plzeň",
  },
};



// ⚠️ klientská komponenta z reactbits – načteme bez SSR

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s - Editra",
  },
  description: defaultDescription,
  keywords: defaultKeywords,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: siteUrl,
    siteName,
    locale: "cs_CZ",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: defaultTitle,
    description: defaultDescription,
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
};



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
        />
        <Analytics />
        <div className="fixed inset-0 -z-10 overflow-hidden">
            <LightRays
              colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
              blend={0.5}
              amplitude={1.0}
              speed={2}
            />
          <div className="absolute inset-0 bg-slate-950/90 pointer-events-none" />
        </div>
        <div className="relative z-0 min-h-screen">{children}</div>
      </body>
    </html>
  );
}
