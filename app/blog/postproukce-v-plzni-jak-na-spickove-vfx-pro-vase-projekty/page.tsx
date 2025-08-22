import type { Metadata } from "next";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { Container, SectionTitle, Card } from "../../../components/ui";

export const metadata: Metadata = {
  title: "Postproukce v Plzni – Jak na špičkové vfx pro vaše projekty | Editra",
  description:
    "Jak v Plzni vzniká precizní postproukce a vfx pro náročné projekty.",
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
              title="Postproukce v Plzni – Jak na špičkové vfx pro vaše projekty"
            />
            <Card className="space-y-4 text-slate-300">
              <p>
                Filmová postproukce je komplexní proces, který rozhoduje o
                výsledném dojmu z každého audiovizuálního díla. Plzeň se v
                posledních letech stala centrem, kde se kvalitní postproukce a
                vfx dělají s precizností a kreativitou. Vfx Plzeň nabízí širokou
                škálu služeb – od střihu, barevné korekce, až po sofistikované
                CGI efekty.
              </p>
              <p>
                Díky moderním technologiím a zkušeným odborníkům je možné v
                Plzni realizovat i velmi náročné projekty. Tvůrci ocení zejména
                flexibilitu plzeňských studií, která umožňuje rychlou komunikaci
                a okamžitou implementaci změn. Vfx Plzeň se tak stává oblíbenou
                volbou pro filmaře, kteří chtějí spojit tradiční filmařské
                dovednosti s nejnovějšími vizuálními efekty.
              </p>
              <p>
                Nezapomínejme také na komunitu, která se kolem postproukce a vfx
                v Plzni vytvořila. Pravidelné workshopy, semináře a networkingové
                akce podporují sdílení zkušeností a inspirací. Pokud chcete, aby
                váš film, reklama nebo hudební klip vynikl, zvažte spolupráci s
                odborníky na postproukce a vfx Plzeň – výsledný produkt bude stát
                za to.
              </p>
            </Card>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
