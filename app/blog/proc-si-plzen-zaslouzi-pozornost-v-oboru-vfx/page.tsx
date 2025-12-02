import type { Metadata } from "next";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { Container, SectionTitle, Card } from "../../../components/ui";

export const metadata: Metadata = {
  title: "Proč si Plzeň zaslouží pozornost v oboru vfx | Editra",
  description:
    "Plzeňská scéna vfx a postproukce roste díky talentům a moderním technologiím.",
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
              title="Proč si Plzeň zaslouží pozornost v oboru vfx"
            />
            <Card className="space-y-4 text-slate-300">
              <p>
                Plzeň je známá nejen díky svému pivu, ale i díky rychle se
                rozvíjejícímu odvětví vfx a postproukce. Místní studia investují
                do nejnovějších technologií, což umožňuje vytvářet realistické
                animace, složité kompozice a vizuální efekty na světové úrovni.
                Vfx Plzeň se tak stává synonymem pro kvalitu a inovaci.
              </p>
              <p>
                Jedním z klíčových faktorů úspěchu plzeňské vfx scény je
                spolupráce s vysokými školami a odbornými kurzy, které
                vychovávají novou generaci talentů. Tito mladí profesionálové
                přinášejí do oboru svěží nápady a nebojí se experimentovat. V
                Plzni je tak možné najít experty na postproukce a vfx, kteří
                dokážou posunout každý projekt na vyšší úroveň.
              </p>
              <p>
                Pro filmové produkce, reklamní agentury i nezávislé tvůrce
                představuje Plzeň ideální místo, kde lze realizovat projekty s
                důrazem na detail a kreativitu. Pokud se zaměříte na postproukce
                nebo vfx Plzeň, získáte nejen vysoce kvalitní výsledky, ale i
                partnera, který rozumí vašim potřebám a je připraven reagovat na
                dynamické změny v průběhu celého procesu.
              </p>
            </Card>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
