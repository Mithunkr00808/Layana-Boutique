import Image from "next/image";
import Link from "next/link";

export interface ProductSummary {
  id: string;
  name: string;
  category?: string;
  price: string;
  image: string;
  alt: string;
  isLimited?: boolean;
}

export default function NewArrivals({ products }: { products: ProductSummary[] }) {
  return (
    <section className="py-24 bg-[var(--color-surface)] max-w-[1440px] mx-auto px-10">
      <div className="flex flex-col md:flex-row justify-between items-baseline mb-16 gap-4">
        <h2 className="font-serif text-3xl md:text-4xl text-[var(--color-on-surface)] font-light">
          New Arrivals
        </h2>
        <Link
          href="/new-arrivals"
          className="font-sans text-xs tracking-[0.2em] uppercase text-[var(--color-secondary)] hover:text-[var(--color-on-surface)] transition-colors border-b border-[var(--color-outline-variant)]/30 pb-1"
        >
          View All Arrivals
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {products.map((product) => (
          <div key={product.id} className="group cursor-pointer">
            <div className="aspect-[3/4] overflow-hidden bg-[var(--color-surface-low)] mb-6 relative">
              <Image
                src={product.image}
                alt={product.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              {product.isLimited && (
                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1 text-[10px] font-sans tracking-widest uppercase">
                  Limited
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-sans text-[10px] uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                {product.category}
              </span>
              <h3 className="font-sans text-lg text-[var(--color-on-surface)] font-medium group-hover:underline underline-offset-4 decoration-1">
                {product.name}
              </h3>
              <p className="font-sans text-sm text-[var(--color-secondary)]">
                {product.price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
