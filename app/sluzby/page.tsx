import type { Metadata } from "next";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ServicesSection from "../../components/ServicesSection";

export const metadata: Metadata = {
  title: "Služby – Editra",
  description:
    "Postprodukce, VFX, color grading a automatizace v Editra.",
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
