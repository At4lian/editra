"use client";

import { Mail, Phone, MapPin } from "lucide-react";
import { Container, SectionTitle, Card, Button, type HeadingLevel } from "./ui";

interface Props {
  level?: HeadingLevel;
}

const ContactSection = ({ level = "h2" }: Props) => (
  <section>
    <Container className="py-14">
      <SectionTitle
        eyebrow="Kontakt"
        title="Pojďme probrat váš projekt"
        subtitle="Napište pár řádků o zakázce. Ozveme se během jednoho pracovního dne."
        level={level}
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
              <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> info@editra.cz</p>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> +420 737 869 067</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Plzeň, Česká republika</p>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="ghost" href="mailto:info@editra.cz">Napsat email</Button>
              <Button variant="ghost" href="tel:+420737869067">Zavolat</Button>
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

export default ContactSection;
