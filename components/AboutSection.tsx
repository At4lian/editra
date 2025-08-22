import { Container, SectionTitle, Card, Badge, type HeadingLevel } from "./ui";

interface Props {
  level?: HeadingLevel;
}

const AboutSection = ({ level = "h2" }: Props) => (
  <section>
    <Container className="py-14">
      <SectionTitle
        eyebrow="O nás"
        title="Kreativci s inženýrskou disciplínou"
        subtitle="Sídlíme v Plzni. Spojujeme filmové řemeslo s automatizací a daty – abychom doručili víc kvality za kratší čas."
        level={level}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-base font-semibold text-white">Proč Editra</h3>
          <p className="mt-2 text-sm text-slate-300">
            Každý projekt bereme jako systém: jasná pipeline, měřitelné metriky a přehledná komunikace. Díky vlastním nástrojům minimalizujeme lidské chyby a máme kontrolu nad kvalitou v každém kroku.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>Versioning</Badge>
            <Badge>Render queue</Badge>
            <Badge>QC gates</Badge>
            <Badge>Reporting</Badge>
          </div>
        </Card>
        <Card>
          <h3 className="text-base font-semibold text-white">Technologie</h3>
          <p className="mt-2 text-sm text-slate-300">
            Pracujeme s nástroji jako Nuke, After Effects, DaVinci Resolve a Python/FFmpeg skripty. Integrujeme OCR, kontrolu hlasitosti, validaci titulků a exportů.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>Nuke</Badge>
            <Badge>AE</Badge>
            <Badge>Resolve</Badge>
            <Badge>Python</Badge>
            <Badge>FFmpeg</Badge>
          </div>
        </Card>
      </div>
    </Container>
  </section>
);

export default AboutSection;
