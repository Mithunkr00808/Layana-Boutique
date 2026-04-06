"use client";

import { useMemo, useState, useTransition, useEffect } from "react";
import { ChevronDown, Minus, Plus } from "lucide-react";
import { addCartItem, getCartItemQuantity, updateCartItemQuantity, removeCartItem } from "@/app/cart/actions";
import { formatProductCategory } from "@/lib/catalog/categories";

interface SizeProps {
  label: string;
  available: boolean;
}

interface ProductDetailsProps {
  id: string;
  sku: string;
  categoryPath: string;
  name: string;
  price: string;
  description: string;
  discountPrice?: string;
  quantity: number;
  hasSizes?: boolean;
  sustainability: string;
  sizes: SizeProps[];
  primaryImage?: string;
}

export default function ProductDetails(props: ProductDetailsProps) {
  const initialSize = useMemo(
    () => props.sizes.find((s) => s.available)?.label || props.sizes[0]?.label || null,
    [props.sizes]
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(initialSize);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>("");
  const [cartQuantity, setCartQuantity] = useState<number>(0);

  const effectiveSize = props.hasSizes === false ? "One Size" : (selectedSize || "");

  useEffect(() => {
    async function fetchQuantity() {
      const qty = await getCartItemQuantity(props.id, effectiveSize);
      setCartQuantity(qty);
    }
    fetchQuantity();
  }, [props.id, effectiveSize]);

  const numericPrice = useMemo(() => {
    const numeric = parseFloat((props.price || "").replace(/[^\d.]/g, ""));
    return Number.isFinite(numeric) ? numeric : 0;
  }, [props.price]);

  const priceDisplay = useMemo(
    () => `₹${numericPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    [numericPrice]
  );

  const handleAddToCart = () => {
    setMessage("");
    startTransition(async () => {
      const result = await addCartItem({
        productId: props.id,
        name: props.name,
        variant: props.categoryPath,
        size: effectiveSize,
        price: numericPrice,
        priceDisplay,
        image: props.primaryImage || "",
        alt: props.name,
      });

      if (!result.ok) {
        setMessage("Could not add to bag. Please try again.");
      } else {
          setMessage("Added to bag");
          setCartQuantity(prev => prev + 1);
      }
    });
  };

  const handleUpdateQuantity = (newQty: number) => {
      setMessage("");
      startTransition(async () => {
          const docId = `${props.id}-${effectiveSize || "onesize"}`;
          let success = false;
          if (newQty <= 0) {
              success = await removeCartItem(docId);
              if (success) setCartQuantity(0);
          } else {
              success = await updateCartItemQuantity(docId, newQty);
              if (success) setCartQuantity(newQty);
          }

          if (!success) {
              setMessage("Could not update quantity. Please try again.");
          }
      });
  };

  return (
    <div className="md:col-span-5 relative">
      <div className="md:sticky md:top-32 space-y-12">
        {/* Identity & Pricing */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-sans text-xs tracking-widest text-[var(--color-on-surface-variant)] uppercase">
              {formatProductCategory(props.categoryPath)}
            </p>
            <span className="font-mono text-[10px] text-[var(--color-secondary)]">SKU: {props.sku}</span>
          </div>
          <h1 className="font-serif text-5xl font-light tracking-tight text-[var(--color-on-surface)] leading-tight">
            {props.name}
          </h1>
          <div className="font-sans text-xl font-light text-[var(--color-on-surface)] flex gap-4 items-center">
            {props.discountPrice ? (
              <>
                <span className="text-[var(--color-primary)]">{props.discountPrice}</span>
                <span className="text-[var(--color-on-surface-variant)] line-through text-lg">{props.price}</span>
              </>
            ) : (
              <span>{props.price}</span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-6">
          <p className="text-[var(--color-on-surface-variant)] leading-relaxed text-sm font-light">
            {props.description}
          </p>

          <div className="flex flex-col gap-3">
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer list-none py-4 border-b border-[var(--color-outline-variant)]/30">
                <span className="font-sans text-xs uppercase tracking-widest">Sustainability</span>
                <ChevronDown strokeWidth={1} size={16} className="group-open:rotate-180 transition-transform" />
              </summary>
              <div className="py-4 text-sm text-[var(--color-on-surface-variant)] font-light">
                <p>{props.sustainability}</p>
              </div>
            </details>
          </div>
        </div>

        {/* Sizing */}
        {props.hasSizes !== false && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs uppercase tracking-widest">Select Size</span>
              <button className="font-sans text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)] underline underline-offset-4 hover:text-[var(--color-on-surface)] transition-colors">
                Size Guide
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {props.sizes.map((size) => (
                <button
                  key={size.label}
                  onClick={() => setSelectedSize(size.label)}
                  className={`py-3 text-xs font-medium transition-all active:scale-[0.98] ${
                    selectedSize === size.label
                      ? "bg-[var(--color-on-surface)] text-[var(--color-surface)]"
                      : "border border-[var(--color-outline-variant)]/40 hover:border-[var(--color-on-surface)]"
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="pt-6 space-y-4">
          {cartQuantity > 0 ? (
            <div className="flex items-center gap-4">
               <div className="flex-1 flex items-center justify-between border border-[var(--color-outline-variant)]/40 p-4 rounded-sm">
                   <button
                     onClick={() => handleUpdateQuantity(cartQuantity - 1)}
                     disabled={isPending}
                     className="p-1 hover:bg-[var(--color-surface-container-high)] rounded-full transition-colors disabled:opacity-50"
                     aria-label="Decrease quantity"
                   >
                     <Minus size={16} strokeWidth={1.5} />
                   </button>
                   <span className="font-sans text-sm font-medium tabular-nums">{cartQuantity}</span>
                   <button
                     onClick={() => handleUpdateQuantity(cartQuantity + 1)}
                     disabled={isPending}
                     className="p-1 hover:bg-[var(--color-surface-container-high)] rounded-full transition-colors disabled:opacity-50"
                     aria-label="Increase quantity"
                   >
                     <Plus size={16} strokeWidth={1.5} />
                   </button>
               </div>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={isPending || !numericPrice || props.quantity === 0}
              className="w-full bg-[var(--color-primary)] text-[var(--color-on-primary)] py-5 rounded-sm font-sans text-xs uppercase tracking-widest transition-all active:scale-[0.99] hover:opacity-90 disabled:opacity-50"
            >
              {props.quantity === 0 ? "OUT OF STOCK" : (isPending ? "Adding..." : "Add to Bag")}
            </button>
          )}
          {message && (
            <p className="text-xs text-[var(--color-secondary)] font-sans">{message}</p>
          )}
        </div>
        <p className="text-[10px] text-center text-[var(--color-on-surface-variant)] font-sans tracking-widest uppercase">
          Free complimentary shipping and returns on all orders
        </p>
      </div>
    </div>
  );
}
