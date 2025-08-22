"use client";
import { motion } from "framer-motion";
import {
  Film,
  Wand2,
  Cpu,
  Workflow,
  GaugeCircle,
  ShieldCheck,
  PlayCircle,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
} from "lucide-react";


// --- Simple UI primitives (Tailwind-based, no external UI lib needed) ---
import React, { ReactNode } from "react";

const Container = ({
  children,
  className = "",
}: { children: ReactNode; className?: string }) => (
  <div className={`mx-auto w-full max-w-7xl px-6 lg:px-8 ${className}`}>{children}</div>
);

type SectionTitleProps = {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
};

const SectionTitle = ({ eyebrow, title, subtitle }: SectionTitleProps) => (
  <div className="mx-auto mb-10 max-w-3xl text-center">
    {eyebrow && (
      <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-sky-400">
        {eyebrow}
      </p>
    )}
    <h2 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
      {title}
    </h2>
    {subtitle && (
      <p className="mt-3 text-base text-slate-300">{subtitle}</p>
    )}
  </div>
);

const Card = ({
  children,
  className = "",
}: { children: React.ReactNode; className?: string }) => (
  <div className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur transition hover:shadow-sky-500/10 ${className}`}>
    <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 transition group-hover:opacity-100" />
    {children}
  </div>
);

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
    {children}
  </span>
);

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "ghost";
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

const Button = ({
  children,
  href = "#",
  variant = "primary",
  className = "",
  onClick,
}: ButtonProps) => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-sky-400/60";
  const styles = {
    primary:
      "bg-sky-500 text-white hover:bg-sky-400 active:bg-sky-600 shadow-lg shadow-sky-500/20",
    ghost:
      "border border-white/15 bg-white/5 text-white hover:border-white/25",
  };
  return (
    <a href={href} className={`${base} ${styles[variant]} ${className}`} onClick={onClick}>
      {children}
    </a>
  );
};



// --- Navbar ---
const Navbar = () => (
  <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
    <Container className="flex items-center justify-between py-4">
      <a href="#top" className="flex items-center gap-2 text-white">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/90 shadow-lg shadow-sky-500/30">
          <Film className="h-5 w-5" />
        </div>
        <span className="text-lg font-bold tracking-wide">Editra</span>
      </a>
      <nav className="hidden items-center gap-6 text-sm text-slate-200 md:flex">
        <a href="#sluzby" className="hover:text-white">Služby</a>
        <a href="#pipeline" className="hover:text-white">Pipeline</a>
        <a href="#portfolio" className="hover:text-white">Portfolio</a>
        <a href="#onas" className="hover:text-white">O nás</a>
        <a href="#kontakt" className="hover:text-white">Kontakt</a>
      </nav>
      <div className="hidden md:block">
        <Button href="#kontakt">Nezávazná poptávka</Button>
      </div>
    </Container>
  </header>
);

// --- Hero ---
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
            Postprodukce & VFX v <span className="text-sky-400">Plzni</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mt-5 max-w-xl text-base text-slate-300 sm:text-lg"
          >
            Jsme studio <strong>Editra</strong>. Kombinujeme špičkovou postprodukci a VFX
            s vlastním vývojářským týmem. Stavíme postprodukční pipeline, automatizujeme
            kontrolu kvality skripty a analyzujeme data, aby každý výstup prošel na první dobrou.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Button href="#kontakt">
              Domluvme si hovor <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="#portfolio" variant="ghost">
              Zhlédnout showreel <PlayCircle className="h-4 w-4" />
            </Button>
          </motion.div>
          <div className="mt-8 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <Badge>Automatizované QC</Badge>
            <Badge>VFX & Compositing</Badge>
            <Badge>Color & Finishing</Badge>
            <Badge>FFmpeg / Python</Badge>
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

// --- Stats / Value Props ---
const ValueProps = () => (
  <section>
    <Container className="py-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: <Workflow className="h-5 w-5" />, title: "End‑to‑End pipeline", text: "Ingest → VFX → Color → QC → Delivery" },
          { icon: <GaugeCircle className="h-5 w-5" />, title: "Rychlost & škálování", text: "Batch procesy, render farmy, skriptování" },
          { icon: <ShieldCheck className="h-5 w-5" />, title: "Bezchybné výstupy", text: "Automatizované testy, loudness, titulky, safe‑margins" },
          { icon: <Cpu className="h-5 w-5" />, title: "Data‑driven", text: "Analytika, metriky, reporting pro klienty" },
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

// --- Services ---
const Services = () => (
  <section id="sluzby" className="pt-6">
    <Container className="py-14">
      <SectionTitle
        eyebrow="Služby"
        title="Co pro vás uděláme"
        subtitle="Od prvního záběru po finální master. Vše pod jednou střechou – kreativně i technicky."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
            <Badge>Nuke</Badge><Badge>After Effects</Badge><Badge>Mocha</Badge>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20">
              <Film className="h-5 w-5 text-sky-300" />
            </div>
            <h3 className="text-lg font-semibold text-white">Edit & Finishing</h3>
          </div>
          <p className="mt-2 text-sm text-slate-300">
            Offline/online střih, color grading, mastering a příprava dodávek pro TV/online/kino.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>Premiere Pro</Badge><Badge>DaVinci Resolve</Badge><Badge>ProRes / IMF</Badge>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20">
              <Cpu className="h-5 w-5 text-sky-300" />
            </div>
            <h3 className="text-lg font-semibold text-white">Vývoj & Pipeline</h3>
          </div>
          <p className="mt-2 text-sm text-slate-300">
            Tvoříme skripty a nástroje: ingest, transkódování, verze, kontrola hlasitosti, kontrola titulků, QC reporty.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>Python</Badge><Badge>FFmpeg</Badge><Badge>OCR</Badge><Badge>API</Badge>
          </div>
        </Card>
      </div>
    </Container>
  </section>
);

// --- Pipeline ---
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
          { step: "01", title: "Ingest & Metadata", text: "Bezpečný import, kontrola framerate/codec, automatické rozpoznání parametrů." },
          { step: "02", title: "Edit / Conform", text: "Proxy, EDL/XML/AAF, synchronizace zvuku a časových kódů." },
          { step: "03", title: "VFX / Comp", text: "Shot breakdown, verzování, trackování tasků a schvalování." },
          { step: "04", title: "Color & Finishing", text: "Color science, LUT management, exporty pro mastering." },
          { step: "05", title: "Automatizované QC", text: "Loudness (EBU R128), gamut, titulky, safe‑area, artefakty, drop‑frames." },
          { step: "06", title: "Delivery & Archiving", text: "Dodávky pro TV, VOD, kino, archivace s checksumy (MD5/XXH)." },
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

// --- Portfolio / Showreel ---
const Portfolio = () => (
  <section id="portfolio" className="">
    <Container className="py-14">
      <SectionTitle
        eyebrow="Portfolio"
        title="Showreel a ukázky"
        subtitle="Krátké ukázky naší práce. Plnou knihovnu rádi nasdílíme při callu."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="aspect-video w-full overflow-hidden rounded-xl">
            <iframe
              className="h-full w-full"
              src="https://www.youtube.com/watch?v=LolmAiyCg2c&t=3s"
              title="Editra Showreel"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
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
              src="https://www.youtube.com/watch?v=opazwv2YkPs&list=RDopazwv2YkPs&start_radio=1"
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

// --- About ---
const About = () => (
  <section id="onas">
    <Container className="py-14">
      <SectionTitle
        eyebrow="O nás"
        title="Kreativci s inženýrskou disciplínou"
        subtitle="Sídlíme v Plzni. Spojujeme filmové řemeslo s automatizací a daty – abychom doručili víc kvality za kratší čas."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-base font-semibold text-white">Proč Editra</h3>
          <p className="mt-2 text-sm text-slate-300">
            Každý projekt bereme jako systém: jasná pipeline, měřitelné metriky a
            přehledná komunikace. Díky vlastním nástrojům minimalizujeme lidské chyby a 
            máme kontrolu nad kvalitou v každém kroku.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>Versioning</Badge><Badge>Render queue</Badge><Badge>QC gates</Badge><Badge>Reporting</Badge>
          </div>
        </Card>
        <Card>
          <h3 className="text-base font-semibold text-white">Technologie</h3>
          <p className="mt-2 text-sm text-slate-300">
            Pracujeme s nástroji jako Nuke, After Effects, DaVinci Resolve a Python/FFmpeg
            skripty. Integrujeme OCR, kontrolu hlasitosti, validaci titulků a exportů.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>Nuke</Badge><Badge>AE</Badge><Badge>Resolve</Badge><Badge>Python</Badge><Badge>FFmpeg</Badge>
          </div>
        </Card>
      </div>
    </Container>
  </section>
);

// --- Contact ---
const Contact = () => (
  <section id="kontakt">
    <Container className="py-14">
      <SectionTitle
        eyebrow="Kontakt"
        title="Pojďme probrat váš projekt"
        subtitle="Napište pár řádků o zakázce. Ozveme se během jednoho pracovního dne."
      />
      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-300">Jméno</label>
                <input
                  required
                  placeholder="Jan Novák"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-300">Email</label>
                <input
                  required
                  type="email"
                  placeholder="jan@example.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-300">Předmět</label>
              <input
                placeholder="Téma / typ projektu"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-300">Zpráva</label>
              <textarea
                rows={5}
                placeholder="Stručný popis, termín, rozpočet…"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-400">Odesláním souhlasíte se zpracováním údajů pro účely poptávky.</div>
              <Button href="#" onClick={(e) => e.preventDefault()}>
                Odeslat poptávku
              </Button>
            </div>
          </form>
        </Card>
        <div className="space-y-6">
          <Card>
            <h3 className="text-base font-semibold text-white">Kontakt</h3>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@editra.cz</p>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> +420 777 000 000</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Plzeň, Česká republika</p>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="ghost" href="mailto:hello@editra.cz">Napsat email</Button>
              <Button variant="ghost" href="tel:+420777000000">Zavolat</Button>
            </div>
          </Card>
          <Card>
            <div className="aspect-video w-full overflow-hidden rounded-xl">
              <iframe
                className="h-full w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps?q=Plze%C5%88&output=embed"
                title="Mapa – Plzeň"
              />
            </div>
          </Card>
        </div>
      </div>
    </Container>
  </section>
);

// --- Footer ---
const Footer = () => (
  <footer className="border-t border-white/10">
    <Container className="flex flex-col items-center justify-between gap-4 py-8 text-sm text-slate-400 md:flex-row">
      <p>© {new Date().getFullYear()} Editra – Postprodukční studio</p>
      <div className="flex items-center gap-4">
        <a href="#top" className="hover:text-white">Zpět nahoru</a>
        <a href="#" className="hover:text-white">Zásady ochrany osobních údajů</a>
      </div>
    </Container>
  </footer>
);

export default function EditraLandingPage() {
  return (
    <div className="min-h-screen  text-slate-100">
      <Navbar />
      <main>
        <Hero />
        <ValueProps />
        <Services />
        <Pipeline />
        <Portfolio />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
