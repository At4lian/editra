import type { Metadata } from "next";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ContactSection from "../../components/ContactSection";

export const metadata: Metadata = {
  title: "Kontakt – Editra",
  description:
    "Pojďme probrat váš projekt. E-mail, telefon a adresa studia Editra.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen text-slate-100" id="top">
      <Navbar />
      <main>
        <ContactSection level="h1" />
      </main>
      <Footer />
    </div>
  );
}
