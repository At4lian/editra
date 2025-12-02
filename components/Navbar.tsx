import Link from "next/link";
import { Film } from "lucide-react";
import { Container, Button } from "./ui";

const Navbar = () => (
  <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
    <Container className="flex items-center justify-between py-4">
      <Link href="/" className="flex items-center gap-2 text-white">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/90 shadow-lg shadow-sky-500/30">
          <Film className="h-5 w-5" />
        </div>
        <span className="text-lg font-bold tracking-wide">Editra</span>
      </Link>
      <nav className="hidden items-center gap-6 text-sm text-slate-200 md:flex">
        <Link href="/" className="hover:text-white">Domů</Link>
        <Link href="/sluzby" className="hover:text-white">Služby</Link>
        <Link href="/portfolio" className="hover:text-white">Portfolio</Link>
        <Link href="/blog" className="hover:text-white">Blog</Link>
        <Link href="/o-nas" className="hover:text-white">O nás</Link>
        <Link href="/kontakt" className="hover:text-white">Kontakt</Link>
      </nav>
      <div className="hidden md:block">
        <Button href="/kontakt">Nezávazná poptávka</Button>
      </div>
    </Container>
  </header>
);

export default Navbar;
