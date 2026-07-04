"use client";

import { useMemo, useState, useTransition, useEffect } from "react";
import { ChevronDown, Minus, Plus } from "lucide-react";
import { formatProductCategory } from "@/lib/catalog/categories";
import { useCart } from "@/lib/contexts/CartContext";

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
  materials?: string;
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

  const { addItem, updateQuantity, removeItem, items } = useCart();

  const effectiveSize = props.hasSizes === false ? "One Size" : (selectedSize || "");
  const docId = `${props.id}-${effectiveSize}`;
  const cartItem = items.find((i) => i.id === docId);
  const cartQty = cartItem?.quantity || 0;

  // Local quantity — this is the count the user sees and adjusts BEFORE confirming
  const [localQty, setLocalQty] = useState<number>(cartQty > 0 ? cartQty : 1);
  // Whether the item exists in the cart
  const [cartSynced, setCartSynced] = useState(cartQty > 0);

  useEffect(() => {
    if (cartQty > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalQty(cartQty);
      setCartSynced(true);
    } else {
      setLocalQty(1);
      setCartSynced(false);
    }
  }, [cartQty]);

  const numericPrice = useMemo(() => {
    const numeric = parseFloat((props.price || "").replace(/[^\d.]/g, ""));
    return Number.isFinite(numeric) ? numeric : 0;
  }, [props.price]);

  // Use discounted price if available, otherwise fall back to full price
  const numericEffectivePrice = useMemo(() => {
    if (props.discountPrice) {
      const discounted = parseFloat((props.discountPrice || "").replace(/[^\d.]/g, ""));
      if (Number.isFinite(discounted) && discounted > 0) return discounted;
    }
    return numericPrice;
  }, [props.discountPrice, numericPrice]);

  const priceDisplay = useMemo(
    () =>
      `₹${numericEffectivePrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    [numericEffectivePrice]
  );

  const handleAddToBag = () => {
    const qtyToAdd = localQty;
    setMessage("");

    startTransition(async () => {
      try {
        if (cartSynced) {
          if (qtyToAdd === 0) {
            await removeItem(docId);
            setMessage("Removed from bag");
          } else {
            await updateQuantity(docId, qtyToAdd);
            setMessage("Bag updated");
          }
        } else {
          if (qtyToAdd > 0) {
            await addItem({
              productId: props.id,
              name: props.name,
              variant: props.categoryPath,
              size: effectiveSize,
              price: numericEffectivePrice,
              priceDisplay,
              image: props.primaryImage || "",
              alt: props.name,
              quantity: qtyToAdd,
              originalPrice: props.discountPrice ? numericPrice : undefined,
              originalPriceDisplay: props.discountPrice ? props.price : undefined,
            });
            setMessage("Added to bag");
          }
        }
        setTimeout(() => setMessage(""), 2000);
      } catch {
        setMessage("Could not update bag. Please try again.");
      }
    });
  };

  const decrementQty = () => {
    const minQty = cartSynced ? 0 : 1;
    setLocalQty((prev) => (prev > minQty ? prev - 1 : minQty));
  };

  const incrementQty = () => {
    setLocalQty((prev) => prev + 1);
  };

  const isOutOfStock = props.quantity === 0;

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
            {props.materials && (
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer list-none py-4 border-b border-[var(--color-outline-variant)]/30">
                  <span className="font-sans text-xs uppercase tracking-widest">Material & Care</span>
                  <ChevronDown strokeWidth={1} size={16} className="group-open:rotate-180 transition-transform" />
                </summary>
                <div className="py-4 text-sm text-[var(--color-on-surface-variant)] font-light">
                  <p>{props.materials}</p>
                </div>
              </details>
            )}

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
            <div>
              <span className="font-sans text-xs uppercase tracking-widest">Select Size</span>
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

        {/* CTA — Quantity selector + Add to Bag */}
        <div className="pt-2 space-y-4">
          <div className="flex items-center gap-4">
            {/* Add to Bag button — always on the left, text never changes */}
            <button
              onClick={handleAddToBag}
              disabled={isPending || !numericPrice || isOutOfStock}
              className="flex-1 bg-[var(--color-on-surface)] text-[var(--color-surface)] py-[18px] rounded-sm font-sans text-xs uppercase tracking-widest transition-all active:scale-[0.99] hover:opacity-90 disabled:opacity-50"
            >
              {isOutOfStock ? "OUT OF STOCK" : isPending ? "Adding..." : "Add to Bag"}
            </button>


            {/* Quantity selector — always on the right */}
            <div className="flex items-center border border-[var(--color-outline-variant)]/40 rounded-sm">
              <button
                onClick={decrementQty}
                disabled={localQty <= 0 || isOutOfStock}
                className="px-4 py-4 hover:bg-[var(--color-surface-container-high)] transition-colors disabled:opacity-30"
                aria-label="Decrease quantity"
              >
                <Minus size={14} strokeWidth={1.5} />
              </button>
              <span className="px-5 font-sans text-sm font-medium tabular-nums min-w-[1.5rem] text-center select-none">
                {localQty}
              </span>
              <button
                onClick={incrementQty}
                disabled={isOutOfStock}
                className="px-4 py-4 hover:bg-[var(--color-surface-container-high)] transition-colors disabled:opacity-30"
                aria-label="Increase quantity"
              >
                <Plus size={14} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {message && (
            <p className={`text-xs font-sans transition-opacity ${message.includes("Could not") ? "text-red-500" : "text-green-600"}`}>
              {message}
            </p>
          )}
        </div>

        <p className="text-[10px] text-center text-[var(--color-on-surface-variant)] font-sans tracking-widest uppercase">
          Free complimentary shipping and returns on all orders
        </p>
      </div>
    </div>
  );
}
