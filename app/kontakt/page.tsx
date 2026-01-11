import type { Metadata } from "next";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ContactSection from "../../components/ContactSection";

export const metadata: Metadata = {
  title: "Kontakt - postprodukce videí v Plzni",
  description:
    "Kontaktujte postprodukční studio Editra v Plzni. E-mail, telefon a mapa studia.",
  keywords: [
    "kontakt",
    "postprodukce videí",
    "postprodukce videí v Plzni",
    "Plzeň",
    "Editra",
    "postprodukční studio",
    "telefon",
    "email",
  ],
  alternates: {
    canonical: "/kontakt",
  },
  openGraph: {
    title: "Kontakt - postprodukce videí v Plzni - Editra",
    description:
      "Kontaktujte postprodukční studio Editra v Plzni. E-mail, telefon a mapa studia.",
    url: "/kontakt",
  },
  twitter: {
    title: "Kontakt - postprodukce videí v Plzni - Editra",
    description:
      "Kontaktujte postprodukční studio Editra v Plzni. E-mail, telefon a mapa studia.",
  },
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
