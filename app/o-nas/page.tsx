import type { Metadata } from "next";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import AboutSection from "../../components/AboutSection";

export const metadata: Metadata = {
  title: "O nás - postprodukční studio v Plzni",
  description:
    "Editra je postprodukční studio v Plzni. Spojujeme filmové řemeslo, VFX a automatizaci pro rychlejší dodávky.",
  keywords: [
    "o nás",
    "Editra",
    "postprodukce videí",
    "postprodukční studio",
    "Plzeň",
    "VFX",
    "color grading",
    "pipeline",
  ],
  alternates: {
    canonical: "/o-nas",
  },
  openGraph: {
    title: "O nás - postprodukční studio v Plzni - Editra",
    description:
      "Editra je postprodukční studio v Plzni. Spojujeme filmové řemeslo, VFX a automatizaci pro rychlejší dodávky.",
    url: "/o-nas",
  },
  twitter: {
    title: "O nás - postprodukční studio v Plzni - Editra",
    description:
      "Editra je postprodukční studio v Plzni. Spojujeme filmové řemeslo, VFX a automatizaci pro rychlejší dodávky.",
  },
};



export default function AboutPage() {
  return (
    <div className="min-h-screen text-slate-100" id="top">
      <Navbar />
      <main>
        <AboutSection level="h1" />
      </main>
      <Footer />
    </div>
  );
}
