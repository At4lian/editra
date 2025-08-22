import type { Metadata } from "next";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import PortfolioSection from "../../components/PortfolioSection";

export const metadata: Metadata = {
  title: "Portfolio – Editra",
  description: "Showreel a ukázky naší postprodukční práce.",
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
