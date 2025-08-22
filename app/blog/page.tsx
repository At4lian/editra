import type { Metadata } from "next";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Container, SectionTitle, Card } from "../../components/ui";

export const metadata: Metadata = {
  title: "Blog – Editra",
  description: "Novinky a články o postprodukci, VFX a technologii.",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen text-slate-100" id="top">
      <Navbar />
      <main>
        <section className="pt-6">
          <Container className="py-14">
            <SectionTitle level="h1" title="Blog" subtitle="Novinky a postřehy z postprodukce a VFX" />
            <Card>
              <p className="text-sm text-slate-300">Zatím zde nejsou žádné články. Sledujte nás pro aktuality.</p>
            </Card>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
