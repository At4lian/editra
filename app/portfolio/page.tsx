import type { Metadata } from "next";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import PortfolioSection from "../../components/PortfolioSection";

export const metadata: Metadata = {
  title: "Portfolio postprodukce videí v Plzni",
  description:
    "Showreel a ukázky postprodukce videí, VFX a color gradingu. Reference z Plzně i celé ČR.",
  keywords: [
    "portfolio",
    "showreel",
    "postprodukce videí",
    "postprodukce videí v Plzni",
    "VFX",
    "color grading",
    "Plzeň",
    "postprodukční studio",
  ],
  alternates: {
    canonical: "/portfolio",
  },
  openGraph: {
    title: "Portfolio postprodukce videí v Plzni - Editra",
    description:
      "Showreel a ukázky postprodukce videí, VFX a color gradingu. Reference z Plzně i celé ČR.",
    url: "/portfolio",
  },
  twitter: {
    title: "Portfolio postprodukce videí v Plzni - Editra",
    description:
      "Showreel a ukázky postprodukce videí, VFX a color gradingu. Reference z Plzně i celé ČR.",
  },
};



export default function PortfolioPage() {
  return (
    <div className="min-h-screen text-slate-100" id="top">
      <Navbar />
      <main>
        <PortfolioSection level="h1" />
      </main>
      <Footer />
    </div>
  );
}
