import Navbar from "@/components/Navbar";
import ProductGrid from "@/components/ProductGrid";
import FadeIn from "@/components/FadeIn";
import { getReadyToWearProducts } from "@/lib/data";
import { Suspense } from "react";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Designer Sarees, Kurties & Kids Wear",
  description:
    "Browse the full Layana Boutique catalog. Shop premium designer sarees, elegant kurties, and festive kids ethnic wear online with free shipping across India.",
  openGraph: {
    type: "website",
    title: "Shop Designer Sarees, Kurties & Kids Wear | Layana Boutique",
    description:
      "Browse the full Layana Boutique catalog. Premium sarees, kurties, and kids wear.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Layana Boutique — Shop All Collections",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop Designer Sarees, Kurties & Kids Wear | Layana Boutique",
    description:
      "Browse the full Layana Boutique catalog. Premium sarees, kurties, and kids wear.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: `/ready-to-wear`,
  },
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
              Shop Layana Boutique
            </h1>
            <p className="font-sans text-lg text-[var(--color-secondary)] leading-relaxed max-w-2xl">
              Discover the latest Sarees, Kurties, and Kids Wear, curated with the same editorial focus and craftsmanship that defines the Layana Boutique collection.
            </p>
          </header>
        </FadeIn>

        <Suspense fallback={<div className="pb-40 text-sm text-[var(--color-secondary)]">Loading catalog...</div>}>
          <ProductGrid
            products={products}
            activeCategory={filters.category}
            activeSize={filters.size}
            activeQuery={filters.query}
          />
        </Suspense>
      </main>
    </div>
  );
}
