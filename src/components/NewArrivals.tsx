import Image from "next/image";
import Link from "next/link";
import {
  SHOP_CATALOG_PATH,
  formatProductCategory,
} from "@/lib/catalog/categories";
import WishlistButton from "./WishlistButton";

export interface ProductSummary {
  id: string;
  name: string;
  category?: string;
  price: string;
  discountPrice?: string;
  quantity?: number;
  image: string;
  alt: string;
  isLimited?: boolean;
}

export default function NewArrivals({ products }: { products: ProductSummary[] }) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-[var(--color-surface)] max-w-[1440px] mx-auto px-10">
      <div className="flex flex-col md:flex-row justify-between items-baseline mb-16 gap-4">
        <h2 className="font-serif text-3xl md:text-4xl text-[var(--color-on-surface)] font-light">
          Latest Arrivals
        </h2>
        <Link
          href={SHOP_CATALOG_PATH}
          className="font-sans text-xs tracking-[0.2em] uppercase text-[var(--color-secondary)] hover:text-[var(--color-on-surface)] transition-colors border-b border-[var(--color-outline-variant)]/30 pb-1"
        >
          View All Pieces
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {products.map((product) => (
          <Link href={`/product/${product.id}`} key={product.id} className="group cursor-pointer block">
            <div className="rounded-[20px] aspect-[3/4] overflow-hidden bg-[var(--color-surface-low)] mb-6 relative">
              <Image
                src={product.image}
                alt={product.alt}
                fill
                priority={true}
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              {product.isLimited && (
                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1 text-[10px] font-sans tracking-widest uppercase rounded">
                  Limited
                </div>
              )}
              <div className="absolute top-4 right-4 z-10 transition-opacity duration-300 opacity-100 md:opacity-0 group-hover:opacity-100">
                <WishlistButton item={product} />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="font-sans text-[10px] uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                  {formatProductCategory(product.category)}
                </span>
                {product.quantity === 0 && (
                  <span className="font-sans text-[9px] uppercase font-bold tracking-widest text-[var(--color-error)] border border-[var(--color-error)] px-2 py-0.5 rounded-full">
                    Out of Stock
                  </span>
                )}
              </div>
              <h3 className="font-sans text-lg text-[var(--color-on-surface)] font-medium group-hover:underline underline-offset-4 decoration-1">
                {product.name}
              </h3>
              <div className="flex gap-3 items-center">
                {product.discountPrice ? (
                  <>
                    <p className="font-sans text-sm font-medium text-[var(--color-primary)]">
                      {product.discountPrice}
                    </p>
                    <p className="font-sans text-xs text-[var(--color-on-surface-variant)] line-through">
                      {product.price}
                    </p>
                  </>
                ) : (
                  <p className="font-sans text-sm text-[var(--color-secondary)]">
                    {product.price}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
