"use client";
import { motion } from "framer-motion";
import {
  Workflow,
  GaugeCircle,
  ShieldCheck,
  Cpu,
  PlayCircle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Container,
  SectionTitle,
  Card,
  Badge,
  Button,
} from "../components/ui";
import ServicesSection from "../components/ServicesSection";
import PortfolioSection from "../components/PortfolioSection";
import AboutSection from "../components/AboutSection";
import ContactSection from "../components/ContactSection";

const Hero = () => (
  <section id="top" className="relative overflow-hidden">
    <Container className="py-20 sm:py-28">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-semibold leading-tight text-white sm:text-6xl"
          >
            Postprodukce videí & VFX v Plzni | <span className="text-sky-400">Editra</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mt-5 max-w-xl text-base text-slate-300 sm:text-lg"
          >
            Jsme studio <strong>Editra</strong>. Color grading a VFX přidáme podle potřeby.
            Čisté výstupy pro TV, online i kino – rychle a spolehlivě. To vše pod záštitou našeho
            <strong> automatizovaného QC Enginu.</strong>
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Button href="/kontakt">
              Domluvme si schůzku <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="https://www.youtube.com/embed/P-m6gLofH-Q" variant="ghost">
              Zhlédnout showreel <PlayCircle className="h-4 w-4" />
            </Button>
          </motion.div>
          <div className="mt-8 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <Badge>Postprodukce</Badge>
            <Badge>VFX & Compositing</Badge>
            <Badge>Color & Finishing</Badge>
            <Badge>Automatizované QC</Badge>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="relative"
        >
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl">
            <iframe
              className="absolute inset-0 h-full w-full"
              src="https://www.youtube.com/embed/P-m6gLofH-Q"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <p className="mt-4 text-center text-sm text-slate-400">VFX prvky pro Unexpected Visuals</p>
        </motion.div>
      </div>
    </Container>
  </section>
);

const ValueProps = () => (
  <section>
    <Container className="py-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: <Workflow className="h-5 w-5" />,
            title: "End‑to‑End pipeline",
            text: "Ingest → VFX → Color → QC → Delivery",
          },
          {
            icon: <GaugeCircle className="h-5 w-5" />,
            title: "Rychlost & škálování",
            text: "Batch procesy, render farmy, skriptování",
          },
          {
            icon: <ShieldCheck className="h-5 w-5" />,
            title: "Bezchybné výstupy",
            text: "Automatizované testy, loudness, titulky, safe‑margins",
          },
          {
            icon: <Cpu className="h-5 w-5" />,
            title: "Data‑driven",
            text: "Analytika, metriky, reporting pro klienty",
          },
        ].map((v, i) => (
          <Card key={i} className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
              {v.icon}
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{v.title}</h3>
              <p className="mt-1 text-sm text-slate-300">{v.text}</p>
            </div>
          </Card>
        ))}
      </div>
    </Container>
  </section>
);

const Pipeline = () => (
  <section id="pipeline" className="">
    <Container className="py-14">
      <SectionTitle
        eyebrow="Pipeline"
        title="Technologický tok, který drží termíny"
        subtitle="Standardizované kroky, automatizace a kontrolní brány. Přehled o stavu záběrů i dodávek v reálném čase."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          {
            step: "01",
            title: "Ingest & Metadata",
            text: "Bezpečný import, kontrola framerate/codec, automatické rozpoznání parametrů.",
          },
          {
            step: "02",
            title: "Edit / Conform",
            text: "Proxy, EDL/XML/AAF, synchronizace zvuku a časových kódů.",
          },
          {
            step: "03",
            title: "VFX / Comp",
            text: "Shot breakdown, verzování, trackování tasků a schvalování.",
          },
          {
            step: "04",
            title: "Color & Finishing",
            text: "Color science, LUT management, exporty pro mastering.",
          },
          {
            step: "05",
            title: "Automatizované QC",
            text: "Loudness (EBU R128), gamut, titulky, safe‑area, artefakty, drop‑frames.",
          },
          {
            step: "06",
            title: "Delivery & Archiving",
            text: "Dodávky pro TV, VOD, kino, archivace s checksumy (MD5/XXH).",
          },
        ].map((item, i) => (
          <Card key={i}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">{item.step}</span>
              <CheckCircle2 className="h-5 w-5 text-emerald-400/90" />
            </div>
            <h3 className="mt-3 text-lg font-semibold text-white">{item.title}</h3>
            <p className="mt-1 text-sm text-slate-300">{item.text}</p>
          </Card>
        ))}
      </div>
    </Container>
  </section>
);

export default function EditraLandingPage() {
  return (
    <div className="min-h-screen text-slate-100">
      <Navbar />
      <main>
        <Hero />
        <ValueProps />
        <ServicesSection />
        <PortfolioSection />
        <Pipeline />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
