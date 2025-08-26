import { Quote } from "lucide-react";
import { Container, SectionTitle, Card } from "./ui";

const testimonials = [
  {
    quote:
      "Editra dokázala zachránit náš projekt před deadline a výsledky předčily očekávání.",
    author: "Jan Novák, Producent",
  },
  {
    quote:
      "Jejich přístup k automatizaci QC nám šetří hodiny práce při každé zakázce.",
    author: "Eva Dvořáková, Postprodukční supervizorka",
  },
  {
    quote:
      "Moderní pipeline a rychlá komunikace – přesně to, co jsme potřebovali.",
    author: "Michal Král, Režisér",
  },
];

export default function TestimonialsSection() {
  return (
    <section id="reference" className="">
      <Container className="py-14">
        <SectionTitle
          eyebrow="Reference"
          title="Co říkají naši klienti"
          subtitle="Zkušenosti produkcí, se kterými spolupracujeme"
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Card key={i} className="flex flex-col gap-4">
              <Quote className="h-6 w-6 text-sky-400" />
              <p className="text-slate-300 italic">&quot;{t.quote}&quot;</p>
              <p className="text-sm font-semibold text-white">{t.author}</p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
