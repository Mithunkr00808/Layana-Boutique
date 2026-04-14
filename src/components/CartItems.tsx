"use client";

import Image from "next/image";
import { Truck, Minus, Plus, Loader2 } from "lucide-react";
import { useState, useCallback } from "react";
import { useCart } from "@/lib/contexts/CartContext";

export interface CartItemType {
  id: string;
  name: string;
  variant: string;
  size: string;
  quantity: number;
  price: string;
  rawPrice: number;
  image: string;
  alt: string;
  originalPrice?: string;
  rawOriginalPrice?: number;
}

function CartItemRow({ item }: { item: CartItemType }) {
  const { updateQuantity, removeItem } = useCart();
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const formatInr = (value: number) =>
    `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleQuantityChange = useCallback(async (change: number) => {
    const newQty = item.quantity + change;
    if (newQty < 1) return;
    setPendingAction(change > 0 ? "inc" : "dec");
    await updateQuantity(item.id, newQty);
    setPendingAction(null);
  }, [item.id, item.quantity, updateQuantity]);

  const handleRemove = useCallback(async () => {
    setPendingAction("remove");
    await removeItem(item.id);
    setPendingAction(null);
  }, [item.id, removeItem]);

  const isPending = pendingAction !== null;

  return (
    <div className="grid grid-cols-6 items-center py-10 border-b border-[var(--color-outline-variant)]/10 group">
      <div className="col-span-3 flex items-center gap-8">
        <div className="w-24 h-32 rounded-[20px] bg-[var(--color-surface-container-low)] overflow-hidden shrink-0">
          <Image
            src={item.image}
            alt={item.alt}
            width={96}
            height={128}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ease-out"
          />
        </div>
        <div>
          <h3 className="font-serif text-lg text-[var(--color-on-surface)] mb-1">{item.name}</h3>
          <p className="font-sans text-xs text-zinc-500 tracking-wide uppercase">{item.variant}</p>
          <button
            onClick={handleRemove}
            disabled={isPending}
            className="mt-4 font-sans text-[10px] tracking-widest uppercase text-[var(--color-error)]/80 hover:text-[var(--color-error)] transition-colors disabled:opacity-40"
          >
            {pendingAction === "remove" ? "Removing…" : "Remove"}
          </button>
        </div>
      </div>
      
      <div className="text-center font-sans text-sm">
        {["one size", "os"].includes(item.size.toLowerCase()) ? "" : item.size}
      </div>
      
      <div className="flex justify-center items-center gap-4">
        <button 
          onClick={() => handleQuantityChange(-1)}
          disabled={isPending || item.quantity <= 1}
          className="text-zinc-500 hover:text-[var(--color-on-surface)] transition-colors disabled:opacity-30"
        >
          <Minus strokeWidth={1.5} size={16} />
        </button>
        <span className="font-sans text-sm w-6 text-center">
          {pendingAction === "inc" || pendingAction === "dec" 
            ? <Loader2 className="animate-spin inline" size={14} /> 
            : item.quantity}
        </span>
        <button 
          onClick={() => handleQuantityChange(1)}
          disabled={isPending}
          className="text-zinc-500 hover:text-[var(--color-on-surface)] transition-colors disabled:opacity-30"
        >
          <Plus strokeWidth={1.5} size={16} />
        </button>
      </div>
      
      <div className="text-right flex flex-col items-end">
        <span className="font-serif text-lg text-[var(--color-on-surface)]">
          {formatInr(item.rawPrice)}
        </span>
        {item.originalPrice && (
          <span className="font-sans text-[10px] tracking-widest uppercase text-zinc-400 line-through">
            {item.originalPrice}
          </span>
        )}
      </div>
    </div>
  );
}

export default function CartItems({ items: serverItems }: { items: CartItemType[] }) {
  // Use CartContext as the single source of truth.
  // Fall back to server-rendered items only for the initial render.
  const { items: contextItems } = useCart();
  const items = contextItems.length > 0 ? contextItems : serverItems;

  return (
    <div className="lg:col-span-8">
      <div className="w-full">
        {/* Table Header */}
        <div className="grid grid-cols-6 pb-6 text-xs font-sans tracking-widest uppercase text-zinc-500 border-b border-[var(--color-outline-variant)]/20">
          <div className="col-span-3">Product</div>
          <div className="text-center">Size</div>
          <div className="text-center">Quantity</div>
          <div className="text-right">Price</div>
        </div>

        {/* Cart Items — each row manages its own loading state */}
        {items.map((item) => (
          <CartItemRow key={item.id} item={item} />
        ))}
      </div>

      {/* Shipping Notice */}
      <div className="mt-12 p-8 bg-[var(--color-surface-container-low)] flex items-start gap-4">
        <Truck strokeWidth={1} size={24} className="text-[var(--color-primary)] shrink-0" />
        <div>
          <p className="font-sans text-xs tracking-widest uppercase text-[var(--color-on-surface)] font-semibold mb-1">
            Expected Delivery
          </p>
          <p className="text-xs text-zinc-500 font-sans leading-relaxed">
            Expect arrival within 3-7 business days.
          </p>
        </div>
      </div>
    </div>
  );
}
