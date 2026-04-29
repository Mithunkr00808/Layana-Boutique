import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import NewArrivals from "@/components/NewArrivals";
import Link from "next/link";

import JournalPreview from "@/components/JournalPreview";
import FadeIn from "@/components/FadeIn";
import { getNewArrivals, getJournalArticles } from "@/lib/data";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/jsonld";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [newArrivals, articles] = await Promise.all([
    getNewArrivals(),
    getJournalArticles()
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <Navbar />
      <main className="flex-grow overflow-x-hidden">
        <FadeIn delay={0.1}>
          <Hero />
        </FadeIn>
        {newArrivals.length > 0 ? (
          <FadeIn delay={0.2}>
            <NewArrivals products={newArrivals} />
          </FadeIn>
        ) : null}

        {articles.length > 0 ? (
          <FadeIn>
            <JournalPreview articles={articles} />
          </FadeIn>
        ) : null}

        <section className="mx-auto max-w-[1440px] px-10 pb-24">
          <div className="rounded-2xl border border-zinc-200/70 bg-white px-6 py-8 md:px-10">
            <h2 className="font-serif text-3xl text-[var(--color-on-surface)]">
              Shop by curated collections
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--color-secondary)]">
              Discover handpicked sarees, kurties and kids wear designed for festive celebrations,
              wedding occasions and everyday elegance. Explore each collection to find styles, fabrics
              and silhouettes that match your personal wardrobe story.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/collections/sarees" className="rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] hover:bg-zinc-50">
                Sarees Collection
              </Link>
              <Link href="/collections/kurties" className="rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] hover:bg-zinc-50">
                Kurties Collection
              </Link>
              <Link href="/collections/kids-wear" className="rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] hover:bg-zinc-50">
                Kids Wear Collection
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
