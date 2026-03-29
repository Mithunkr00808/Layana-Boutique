import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import FadeIn from "@/components/FadeIn";
import { getReadyToWearProducts } from "@/lib/data";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ready-to-Wear",
  description: "A curated selection of archival silhouettes and modern essentialism.",
};

export default async function ReadyToWearPage({
  searchParams,
}: {
  searchParams?: { category?: string; size?: string; q?: string };
}) {
  const filters = {
    category: searchParams?.category || null,
    size: searchParams?.size || null,
    query: searchParams?.q || null,
  };

  const products = await getReadyToWearProducts({ category: filters.category, size: filters.size, query: filters.query });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow max-w-[1440px] mx-auto px-10 w-full pt-16 mt-20">
        {/* Collection Header */}
        <FadeIn direction="up">
          <header className="py-20 md:py-32 max-w-4xl">
            <h1 className="font-serif text-5xl md:text-7xl font-light tracking-tight text-[var(--color-on-surface)] mb-6">
              Ready-to-Wear
            </h1>
            <p className="font-sans text-lg text-[var(--color-secondary)] leading-relaxed max-w-2xl">
              A curated selection of archival silhouettes and modern essentialism. Our garments are crafted with the precision of a master tailor and the soul of a gallery piece.
            </p>
          </header>
        </FadeIn>

        <ProductGrid
          products={products}
          activeCategory={filters.category}
          activeSize={filters.size}
          activeQuery={filters.query}
        />
      </main>
      <Footer />
    </div>
  );
}
