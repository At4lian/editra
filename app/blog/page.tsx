import type { Metadata } from "next";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Container, SectionTitle, Card } from "../../components/ui";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog – Editra",
  description: "Novinky a články o postprodukci, VFX a technologii.",
};

const posts = [
  {
    slug: "postproukce-a-vfx-v-plzni-budoucnost-filmove-tvorby",
    title: "Postproukce a vfx v Plzni – Budoucnost filmové tvorby",
  },
  {
    slug: "proc-si-plzen-zaslouzi-pozornost-v-oboru-vfx",
    title: "Proč si Plzeň zaslouží pozornost v oboru vfx",
  },
  {
    slug: "postproukce-v-plzni-jak-na-spickove-vfx-pro-vase-projekty",
    title: "Postproukce v Plzni – Jak na špičkové vfx pro vaše projekty",
  },
  {
    slug: "trendy-v-postproukci-plzen-jako-hub-pro-vfx",
    title: "Trendy v postproukci – Plzeň jako hub pro vfx",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen text-slate-100" id="top">
      <Navbar />
      <main>
        <section className="pt-6">
          <Container className="py-14">
            <SectionTitle
              level="h1"
              title="Blog"
              subtitle="Novinky a postřehy z postprodukce a VFX"
            />
            <div className="space-y-6">
              {posts.map((post) => (
                <Card key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-lg font-semibold text-white hover:text-sky-400"
                  >
                    {post.title}
                  </Link>
                </Card>
              ))}
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
