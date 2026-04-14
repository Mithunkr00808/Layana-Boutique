import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getReadyToWearProducts } from "@/lib/data";
import Navbar from "@/components/Navbar";
import SortSelect from "@/components/SortSelect";
import { BreadcrumbJsonLd } from "@/components/seo/jsonld";
import {
  PRODUCT_CATEGORY_OPTIONS,
  SHOP_CATALOG_PATH,
  formatProductCategory,
  getCategoryHref,
  getProductCategoryConfig,
  resolveProductCategorySlug,
} from "@/lib/catalog/categories";

export const dynamic = "force-dynamic";

const collectionRedirects: Record<string, string> = {
  "winter-2024": SHOP_CATALOG_PATH,
};

type CategoryCollectionPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
};

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://layanaboutique.com";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
] as const;

function parsePrice(price: string): number {
  const num = parseFloat((price || "0").replace(/[^0-9.]/g, ""));
  return Number.isFinite(num) ? num : 0;
}

function sortProducts(products: Awaited<ReturnType<typeof getReadyToWearProducts>>, sort: string) {
  const sorted = [...products];
  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    case "price-desc":
      return sorted.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "newest":
    default:
      return sorted;
  }
}

export async function generateMetadata({
  params,
}: CategoryCollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = resolveProductCategorySlug(slug);

  if (!category) {
    return {
      title: "Collection",
      description: "Browse the Layana Boutique collection.",
    };
  }

  const config = getProductCategoryConfig(category);
  const title = `${config.label} Collection — Shop Online`;
  const description = `${config.description} Shop ${config.label.toLowerCase()} online at Layana Boutique with free shipping across India.`;

  return {
    title,
    description,
    openGraph: {
      type: "website",
      title: `${config.label} | Layana Boutique`,
      description,
      url: `${BASE_URL}/collections/${category}`,
      siteName: "Layana Boutique",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${config.label} — Layana Boutique Collection`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${config.label} | Layana Boutique`,
      description,
      images: ["/og-image.png"],
    },
    alternates: {
      canonical: `/collections/${category}`,
    },
  };
}

export default async function CollectionPage({ params, searchParams }: CategoryCollectionPageProps) {
  const { slug } = await params;
  const { sort: sortParam } = await searchParams;
  const activeSort = sortParam || "newest";
  const redirectTarget = collectionRedirects[slug];

  if (redirectTarget) {
    redirect(redirectTarget);
  }

  const category = resolveProductCategorySlug(slug);

  if (!category) {
    notFound();
  }

  if (slug !== category) {
    redirect(getCategoryHref(category));
  }

  const config = getProductCategoryConfig(category);
  const rawProducts = await getReadyToWearProducts({ category });
  const products = sortProducts(rawProducts, activeSort);
  const currentYear = new Date().getFullYear();

  const activeSubCategories = Array.from(
    new Set(rawProducts.flatMap((p) => p.subCategories || []))
  ).filter(Boolean).sort();

  return (
    <div className="min-h-screen bg-[var(--color-surface)] font-sans text-[var(--color-on-surface)] antialiased bg-white">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Collections", href: "/collections/sarees" },
          { name: config.label, href: `/collections/${category}` },
        ]}
      />
      <Navbar />

      <main className="mx-auto max-w-[1440px] px-10 pt-20">
        <header className="max-w-4xl py-20 md:py-32">
          <h1 className="mb-6 font-serif text-5xl font-light tracking-tight text-[var(--color-on-surface)] md:text-7xl">
            {config.label}
          </h1>
          <p className="max-w-2xl font-sans text-lg leading-relaxed text-[var(--color-secondary)]">
            {config.description}
          </p>
        </header>

        <section className="mb-12 flex flex-col items-start justify-between gap-6 py-8 md:flex-row md:items-center">
          <div className="flex items-center gap-10">
            <button
              type="button"
              className="flex items-center gap-2 font-sans text-xs uppercase tracking-widest text-[var(--color-on-surface)] transition-opacity hover:opacity-70"
            >
              <span>Filter</span>
              <SlidersHorizontal className="size-4" strokeWidth={1.5} />
            </button>

            {activeSubCategories.length > 0 && (
              <div className="hidden gap-8 text-xs uppercase tracking-widest text-[var(--color-secondary)] md:flex">
                {activeSubCategories.map((sub) => {
                  return (
                    <Link
                      key={sub}
                      href={`/collections/${category}?sub=${encodeURIComponent(sub)}`}
                      className="transition-colors hover:text-[var(--color-on-surface)]"
                    >
                      {sub}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <SortSelect activeSort={activeSort} />
        </section>

        <section className="mb-40 grid grid-cols-1 gap-x-6 gap-y-20 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.length > 0 ? (
            products.map((product) => (
              <Link href={`/product/${product.id}`} key={product.id} className="group cursor-pointer">
                <div className="relative mb-6 aspect-[3/4] overflow-hidden rounded-2xl bg-[var(--color-surface-container-low)]">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.alt || product.name}
                      fill
                      className="object-cover transition-transform duration-700 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[var(--color-surface-container-low)] text-xs uppercase tracking-[0.2em] text-[var(--color-secondary)]">
                      No Image
                    </div>
                  )}

                  <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 transition-all duration-500 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="block w-full bg-[var(--color-surface-container-lowest)]/90 py-4 text-center font-sans text-xs uppercase tracking-widest text-[var(--color-on-surface)] backdrop-blur-md transition-all hover:bg-[var(--color-primary)] hover:text-white">
                      Quick View
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-serif text-lg italic text-[var(--color-on-surface)]">
                      {product.name}
                    </h3>
                    <div className="flex flex-col items-end">
                      {product.discountPrice ? (
                        <>
                          <span className="font-sans text-sm font-medium text-[var(--color-primary)]">
                            {product.discountPrice}
                          </span>
                          <span className="font-sans text-[11px] text-zinc-400 line-through">
                            {product.price}
                          </span>
                        </>
                      ) : (
                        <span className="font-sans text-sm font-medium">
                          {product.price}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-[var(--color-secondary)]">
                    {product.options || formatProductCategory(product.category)}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] px-10 py-16 text-center">
              <h2 className="font-serif text-3xl font-light text-[var(--color-on-surface)]">
                No pieces available yet
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[var(--color-secondary)]">
                This collection will populate automatically once products in the {config.label}{" "}
                category are published from the admin catalog.
              </p>
            </div>
          )}
        </section>

        <section className="mb-40 flex items-center justify-center gap-12">
          <button
            type="button"
            disabled
            className="font-sans text-xs uppercase tracking-widest text-[var(--color-secondary)] opacity-50"
          >
            Previous
          </button>
          <div className="flex gap-8 font-sans text-xs tracking-widest">
            <button
              type="button"
              className="border-b border-[var(--color-on-surface)] pb-1 font-bold text-[var(--color-on-surface)]"
            >
              1
            </button>
          </div>
          <button
            type="button"
            disabled
            className="font-sans text-xs uppercase tracking-widest text-[var(--color-secondary)] opacity-50"
          >
            Next
          </button>
        </section>
      </main>
    </div>
  );
}
