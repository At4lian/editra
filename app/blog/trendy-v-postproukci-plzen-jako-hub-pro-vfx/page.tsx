import type { Metadata } from "next";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { Container, SectionTitle, Card } from "../../../components/ui";

export const metadata: Metadata = {
  title: "Trendy v postproukci – Plzeň jako hub pro vfx | Editra",
  description:
    "Proč je Plzeň čím dál důležitější pro postproukce a vfx v Česku.",
};

export default function Post() {
  return (
    <div className="min-h-screen text-slate-100" id="top">
      <Navbar />
      <main>
        <section className="pt-6">
          <Container className="py-14">
            <SectionTitle
              level="h1"
              title="Trendy v postproukci – Plzeň jako hub pro vfx"
            />
            <Card className="space-y-4 text-slate-300">
              <p>
                V posledních letech se trendem stává decentralizace filmové a
                televizní produkce z tradičních center, jakými jsou Praha nebo
                Brno. Plzeň se díky kvalitní infrastruktuře, bohaté kulturní
                scéně a dostupným službám postproukce stává stále populárnější.
                Klíčové slovo vfx Plzeň tak není jen marketingový tah, ale odraz
                reálného rozvoje v západočeském regionu.
              </p>
              <p>
                Plzeňská studia disponují špičkovými softwary pro vfx a nabízí
                také možnost pronájmu ateliérů. To vše při zachování rozumných
                nákladů, což je atraktivní jak pro zahraniční, tak pro domácí
                produkce. Vfx Plzeň přitom znamená nejen technickou kvalitu, ale
                i lokální kreativitu. Místní umělci dokážou do projektů vnést
                specifický nádech inspirovaný historií města i jeho moderním
                duchem.
              </p>
              <p>
                Právě kombinace technické preciznosti a kreativního přístupu
                činí z Plzně ideální místo pro realizaci vašich vfx záměrů. Pokud
                hledáte nové možnosti, jak posunout své projekty vpřed, zapojení
                postproukce a vfx z Plzně může být klíčem k úspěchu. Stačí se
                inspirovat možnostmi, které město nabízí, a najít ty správné
                partnery pro váš projekt.
              </p>
            </Card>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
