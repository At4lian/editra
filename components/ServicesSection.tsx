import { Film, Wand2, Cpu } from "lucide-react";
import { Container, SectionTitle, Card, Badge, type HeadingLevel } from "./ui";

interface Props {
  level?: HeadingLevel;
}

const ServicesSection = ({ level = "h2" }: Props) => (
  <section className="pt-6">
    <Container className="py-14">
      <SectionTitle
        eyebrow="Služby"
        title="Co pro vás uděláme"
        subtitle="Od prvního záběru po finální master. Vše pod jednou střechou – kreativně i technicky."
        level={level}
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20">
              <Film className="h-5 w-5 text-sky-300" />
            </div>
            <h3 className="text-lg font-semibold text-white">Postprodukce</h3>
          </div>
          <p className="mt-2 text-sm text-slate-300">
            Offline/online střih, color grading, mastering a příprava dodávek pro TV/online/kino.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>Premiere Pro</Badge>
            <Badge>DaVinci Resolve</Badge>
            <Badge>ProRes / IMF</Badge>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20">
              <Wand2 className="h-5 w-5 text-sky-300" />
            </div>
            <h3 className="text-lg font-semibold text-white">VFX & Compositing</h3>
          </div>
          <p className="mt-2 text-sm text-slate-300">
            2D/3D compositing, clean‑up, keying, tracking, retuše, matchmove a FX simulace.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>Nuke</Badge>
            <Badge>After Effects</Badge>
            <Badge>Mocha</Badge>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20">
              <Cpu className="h-5 w-5 text-sky-300" />
            </div>
            <h3 className="text-lg font-semibold text-white">Color grading & finishing</h3>
          </div>
          <p className="mt-2 text-sm text-slate-300">
            Tvoříme skripty a nástroje: ingest, transkódování, verze, kontrola hlasitosti, kontrola titulků, QC reporty.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>Python</Badge>
            <Badge>FFmpeg</Badge>
            <Badge>OCR</Badge>
            <Badge>API</Badge>
          </div>
        </Card>
      </div>
    </Container>
  </section>
);

export default ServicesSection;
