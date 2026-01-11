import type { Metadata } from "next";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ServicesSection from "../../components/ServicesSection";

export const metadata: Metadata = {
  title: "Služby postprodukce videí v Plzni",
  description:
    "Postprodukce videí v Plzni: střih, VFX, color grading, mastering, QC a dodávky pro TV, online i kino.",
  keywords: [
    "postprodukce videí",
    "postprodukce videí v Plzni",
    "postprodukce Plzeň",
    "VFX",
    "color grading",
    "střih videa",
    "mastering",
    "QC",
    "finishing",
  ],
  alternates: {
    canonical: "/sluzby",
  },
  openGraph: {
    title: "Služby postprodukce videí v Plzni - Editra",
    description:
      "Postprodukce videí v Plzni: střih, VFX, color grading, mastering, QC a dodávky pro TV, online i kino.",
    url: "/sluzby",
  },
  twitter: {
    title: "Služby postprodukce videí v Plzni - Editra",
    description:
      "Postprodukce videí v Plzni: střih, VFX, color grading, mastering, QC a dodávky pro TV, online i kino.",
  },
};



export default function ServicesPage() {
  return (
    <div className="min-h-screen text-slate-100" id="top">
      <Navbar />
      <main>
        <ServicesSection level="h1" />
      </main>
      <Footer />
    </div>
  );
}
