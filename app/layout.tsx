// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LightRays from "./LightRays";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// ⚠️ klientská komponenta z reactbits – načteme bez SSR

export const metadata: Metadata = {
  title: "Editra – Postprodukce & VFX v Plzni",
  description:
    "Postprodukční studio kombinující špičkovou postprodukci, VFX a vývoj nástrojů. Pipeline, QC a automatizace.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950`}>
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
