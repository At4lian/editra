import { Container, SectionTitle, Card, type HeadingLevel } from "./ui";

interface Props {
  level?: HeadingLevel;
}

const PortfolioSection = ({ level = "h2" }: Props) => (
  <section>
    <Container className="py-14">
      <SectionTitle
        eyebrow="Portfolio"
        title="Showreel a ukázky"
        subtitle="Krátké ukázky naší práce. Plnou knihovnu rádi nasdílíme při callu."
        level={level}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="aspect-video w-full overflow-hidden rounded-xl">
            <iframe
              className="h-full w-full"
              src="https://www.youtube.com/embed/LolmAiyCg2c"
              title="Case study"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
          <h3 className="mt-4 text-base font-semibold text-white">Summer City Fest Plzeň 2024</h3>
          <p className="mt-1 text-sm text-slate-300">Postprodukce aftermovie.</p>
        </Card>
        <Card>
          <div className="aspect-video w-full overflow-hidden rounded-xl">
            <iframe
              className="h-full w-full"
              src="https://www.youtube.com/embed/opazwv2YkPs"
              title="Case study"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
          <h3 className="mt-4 text-base font-semibold text-white">DOTS - Broken Skies</h3>
          <p className="mt-1 text-sm text-slate-300">Postprodukce, color grading videoklipu</p>
        </Card>
      </div>
    </Container>
  </section>
);

export default PortfolioSection;
