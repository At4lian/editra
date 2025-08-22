import Link from "next/link";
import { Container } from "./ui";

const Footer = () => (
  <footer className="border-t border-white/10">
    <Container className="flex flex-col items-center justify-between gap-4 py-8 text-sm text-slate-400 md:flex-row">
      <p>© {new Date().getFullYear()} Editra – Postprodukční studio</p>
      <div className="flex items-center gap-4">
        <Link href="#top" className="hover:text-white">
          Zpět nahoru
        </Link>
        <Link href="#" className="hover:text-white">
          Zásady ochrany osobních údajů
        </Link>
      </div>
    </Container>
  </footer>
);

export default Footer;
