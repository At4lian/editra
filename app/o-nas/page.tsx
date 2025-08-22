import type { Metadata } from "next";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import AboutSection from "../../components/AboutSection";

export const metadata: Metadata = {
  title: "O nás – Editra",
  description:
    "Kreativci s inženýrskou disciplínou. Sídlíme v Plzni.",
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
