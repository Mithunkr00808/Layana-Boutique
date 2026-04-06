import Image from "next/image";
import Link from "next/link";
import {
  SHOP_CATALOG_PATH,
  formatProductCategory,
} from "@/lib/catalog/categories";

export interface RelatedProduct {
  id: string;
  category?: string;
  name: string;
  price: string;
  discountPrice?: string;
  quantity?: number;
  image: string;
  alt: string;
}

export default function RelatedProducts({ products }: { products: RelatedProduct[] }) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mt-40 mb-20">
      <div className="flex items-baseline justify-between mb-16">
        <h2 className="font-serif text-3xl font-light text-[var(--color-on-surface)]">
          Complete the Look
        </h2>
        <Link
          href={SHOP_CATALOG_PATH}
          className="font-sans text-xs tracking-widest uppercase border-b border-[var(--color-on-surface)] pb-1 text-[var(--color-on-surface)] hover:text-[var(--color-primary)] transition-colors"
        >
          View Collection
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        {products.map((product) => (
          <Link href={`/product/${product.id}`} key={product.id} className="group cursor-pointer block">
            <div className="aspect-[3/4] rounded-[20px] overflow-hidden bg-[var(--color-surface-container-low)] mb-6">
              <Image
                src={product.image}
                alt={product.alt}
                width={300}
                height={400}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ease-out"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <p className="font-sans text-[10px] tracking-widest uppercase text-[var(--color-on-surface-variant)]">
                  {formatProductCategory(product.category)}
                </p>
                {product.quantity === 0 && (
                  <span className="font-sans text-[9px] uppercase font-bold tracking-widest text-[var(--color-error)] border border-[var(--color-error)] px-2 py-0.5 rounded-full">
                    Out of Stock
                  </span>
                )}
              </div>
              <h3 className="font-sans text-sm font-medium text-[var(--color-on-surface)]">
                {product.name}
              </h3>
              <div className="flex gap-2 items-center">
                {product.discountPrice ? (
                  <>
                    <p className="font-sans text-sm font-medium text-[var(--color-primary)]">
                      {product.discountPrice}
                    </p>
                    <p className="font-sans text-[10px] text-[var(--color-on-surface-variant)] line-through">
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
