"use client";

import { useState } from "react";
import Link from "next/link";
import { Film, Menu, X } from "lucide-react";
import { Container, Button } from "./ui";

const links = [
  { href: "/", label: "Domů" },
  { href: "/sluzby", label: "Služby" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/blog", label: "Blog" },
  { href: "/o-nas", label: "O nás" },
  { href: "/kontakt", label: "Kontakt" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
      <Container className="flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-2 text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/90 shadow-lg shadow-sky-500/30">
            <Film className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-wide">Editra</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-slate-200 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-white">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:block">
          <Button href="/kontakt">Nezávazná poptávka</Button>
        </div>
        <button
          className="md:hidden text-slate-200"
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </Container>
      {open && (
        <div className="md:hidden border-t border-white/10 bg-slate-950/95">
          <nav className="flex flex-col items-center gap-4 py-4 text-sm text-slate-200">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="hover:text-white"
                onClick={close}
              >
                {l.label}
              </Link>
            ))}
            <Button href="/kontakt" className="w-11/12" onClick={close}>
              Nezávazná poptávka
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
