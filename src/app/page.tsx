import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import NewArrivals from "@/components/NewArrivals";
import JournalPreview from "@/components/JournalPreview";
import FadeIn from "@/components/FadeIn";
import { getNewArrivals, getJournalArticles, getReadyToWearProducts } from "@/lib/data";
import { getSiteSettings } from "@/lib/siteSettings";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/jsonld";
import { getAdminSession } from "@/lib/auth/admin-session";

export const dynamic = "force-dynamic";

export default async function Home() {
  const settings = await getSiteSettings();
  const isLive = settings.general.isLive;
  const adminSession = await getAdminSession();

  if (!isLive && !adminSession) {
    return (
      <div className="flex min-h-screen flex-col bg-[var(--color-surface)]">
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        
        <main className="flex flex-grow flex-col items-center justify-center px-6 py-24 text-center">
          <FadeIn delay={0.1}>
            <h1 className="font-serif text-5xl md:text-7xl tracking-wide text-[var(--color-primary)]">
              Layana Boutique
            </h1>
          </FadeIn>
          
          <FadeIn delay={0.3}>
            <div className="mt-8 mb-12 h-px w-24 bg-[var(--color-outline-variant)] mx-auto"></div>
          </FadeIn>

          <FadeIn delay={0.5}>
            <h2 className="font-sans text-2xl md:text-3xl font-light text-[var(--color-on-surface)] mb-6">
              Opening Soon
            </h2>
            <p className="max-w-md text-sm md:text-base text-[var(--color-secondary)] mx-auto leading-relaxed">
              We are crafting something beautiful for you. Our curated collection of handpicked sarees, kurties, and kids wear will be available shortly.
            </p>
          </FadeIn>
          
          <FadeIn delay={0.7}>
            <div className="mt-12">
              <p className="text-xs uppercase tracking-widest text-[var(--color-secondary)] mb-4">
                Stay tuned for our launch
              </p>
              <div className="flex gap-4 justify-center">
                <span className="h-2 w-2 rounded-full bg-[var(--color-primary-container)] animate-pulse"></span>
                <span className="h-2 w-2 rounded-full bg-[var(--color-primary-container)] animate-pulse" style={{ animationDelay: "0.2s" }}></span>
                <span className="h-2 w-2 rounded-full bg-[var(--color-primary-container)] animate-pulse" style={{ animationDelay: "0.4s" }}></span>
              </div>
            </div>
          </FadeIn>
        </main>

        <footer className="py-8 text-center text-xs text-[var(--color-secondary)]">
          &copy; {new Date().getFullYear()} Layana Boutique. All rights reserved.
        </footer>
      </div>
    );
  }

  const [newArrivals, articles, kurtiesRaw] = await Promise.all([
    getNewArrivals(),
    getJournalArticles(),
    getReadyToWearProducts({ category: "kurties" })
  ]);
  const kurties = kurtiesRaw.slice(0, 3);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-surface)]">
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

        {kurties.length > 0 ? (
          <FadeIn delay={0.3}>
            <NewArrivals 
              products={kurties} 
              title="Featured Kurties" 
              link="/collections/kurties" 
            />
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
