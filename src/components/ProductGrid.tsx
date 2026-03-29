"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

export interface GridProduct {
  id: string;
  name: string;
  price: string;
  options?: string;
  image: string;
  alt: string;
}

export default function ProductGrid({
  products,
  activeCategory,
  activeSize,
  activeQuery,
}: {
  products: GridProduct[];
  activeCategory?: string | null;
  activeSize?: string | null;
  activeQuery?: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchText, setSearchText] = useState(activeQuery || "");

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/ready-to-wear?${params.toString()}`);
  };

  // Debounce search updates to avoid chatty router pushes
  useEffect(() => {
    const handle = setTimeout(() => {
      const value = searchText.trim();
      setParam("q", value ? value : null);
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  return (
    <>
      {/* Filtering & Sort Bar */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center py-8 gap-6 mb-12 border-b border-[var(--color-outline-variant)]/30">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3 font-sans text-xs uppercase tracking-widest text-[var(--color-on-surface)]">
            <span className="flex items-center gap-2">
              <SlidersHorizontal strokeWidth={1} size={16} />
              Filter
            </span>
            <select
              className="text-[var(--color-secondary)] bg-transparent border-b border-[var(--color-outline-variant)]/50 focus:outline-none"
              value={activeCategory || ""}
              onChange={(e) => setParam("category", e.target.value || null)}
            >
              <option value="">All Categories</option>
              <option value="ready-to-wear">Ready to Wear</option>
              <option value="new-arrivals">New Arrivals</option>
              <option value="outerwear">Outerwear</option>
              <option value="knitwear">Knitwear</option>
              <option value="dresses">Dresses</option>
            </select>
            <select
              className="text-[var(--color-secondary)] bg-transparent border-b border-[var(--color-outline-variant)]/50 focus:outline-none"
              value={activeSize || ""}
              onChange={(e) => setParam("size", e.target.value || null)}
            >
              <option value="">Any Size</option>
              <option value="fr34">FR 34</option>
              <option value="fr36">FR 36</option>
              <option value="fr38">FR 38</option>
              <option value="fr40">FR 40</option>
              <option value="m">M</option>
              <option value="l">L</option>
            </select>
          </div>
          <div className="flex-1 max-w-xs">
            <input
              type="search"
              placeholder="Search fabrics, styles, pieces"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full border-b border-[var(--color-outline-variant)]/50 bg-transparent py-2 text-sm font-sans text-[var(--color-on-surface)] placeholder:text-[var(--color-secondary)] focus:outline-none"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-sans text-xs uppercase tracking-widest text-[var(--color-secondary)]">
            Sort by:
          </span>
          <button className="flex items-center gap-2 font-sans text-xs uppercase tracking-widest text-[var(--color-on-surface)]">
            <span>Newest</span>
            <ChevronDown strokeWidth={1.5} size={16} />
          </button>
        </div>
      </section>

      {/* Product Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-20 mb-40">
        {products.map((product) => (
          <Link href={`/product/${product.id}`} key={product.id} className="group cursor-pointer block">
            <div className="relative overflow-hidden bg-[var(--color-surface-low)] aspect-[3/4] mb-6">
              <Image
                src={product.image}
                alt={product.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out z-10">
                <button 
                  className="w-full glass bg-white/80 py-4 font-sans text-xs uppercase tracking-widest text-[var(--color-on-surface)] hover:bg-[var(--color-primary)] hover:text-white transition-all"
                  onClick={(e) => { e.preventDefault(); console.log('Quick view', product.name); }}
                >
                  Quick View
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-start">
                <h3 className="font-serif text-lg italic text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors">
                  {product.name}
                </h3>
                <span className="font-sans text-sm font-medium">
                  {product.price}
                </span>
              </div>
              <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-[var(--color-secondary)]">
                {product.options}
              </p>
            </div>
          </Link>
        ))}
      </section>

      {/* Pagination */}
      <section className="flex justify-center items-center gap-12 mb-40">
        <button className="font-sans text-xs uppercase tracking-widest text-[var(--color-secondary)] hover:text-[var(--color-on-surface)] transition-colors disabled:opacity-30">
          Previous
        </button>
        <div className="flex gap-8 font-sans text-xs tracking-widest">
          <button className="text-[var(--color-on-surface)] font-bold border-b border-[var(--color-on-surface)] pb-1">1</button>
          <button className="text-[var(--color-secondary)] hover:text-[var(--color-on-surface)] transition-colors">2</button>
          <button className="text-[var(--color-secondary)] hover:text-[var(--color-on-surface)] transition-colors">3</button>
          <span className="text-[var(--color-secondary)]">...</span>
          <button className="text-[var(--color-secondary)] hover:text-[var(--color-on-surface)] transition-colors">12</button>
        </div>
        <button className="font-sans text-xs uppercase tracking-widest text-[var(--color-secondary)] hover:text-[var(--color-on-surface)] transition-colors">
          Next
        </button>
      </section>
    </>
  );
}
