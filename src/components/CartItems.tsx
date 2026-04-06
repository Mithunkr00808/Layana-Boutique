"use client";

import Image from "next/image";
import { Truck, Minus, Plus, Loader2 } from "lucide-react";
import { useTransition } from "react";
import { removeCartItem, updateCartItemQuantity } from "@/app/cart/actions";

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
}

export default function CartItems({ items }: { items: CartItemType[] }) {
  const [isPending, startTransition] = useTransition();
  const formatInr = (value: number) =>
    `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleUpdateQuantity = (id: string, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty < 1) return; // Prevent going to 0 structurally for now
    startTransition(async () => {
      await updateCartItemQuantity(id, newQty);
    });
  };

  const handleRemove = (id: string) => {
    startTransition(async () => {
      await removeCartItem(id);
    });
  };

  return (
    <div className="lg:col-span-8">
      <div className="w-full">
        {/* Table Header */}
        <div className="grid grid-cols-6 pb-6 text-xs font-sans tracking-widest uppercase text-[var(--color-secondary)] border-b border-[var(--color-outline-variant)]/20">
          <div className="col-span-3">Product</div>
          <div className="text-center">Size</div>
          <div className="text-center">Quantity</div>
          <div className="text-right">Price</div>
        </div>

        {/* Cart Items */}
        {items.map((item) => (
          <div key={item.id} className="grid grid-cols-6 items-center py-10 border-b border-[var(--color-outline-variant)]/10 group">
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
                <p className="font-sans text-xs text-[var(--color-secondary)] tracking-wide uppercase">{item.variant}</p>
                <button
                  onClick={() => handleRemove(item.id)}
                  disabled={isPending}
                  className="mt-4 font-sans text-[10px] tracking-widest uppercase text-[var(--color-secondary)] hover:text-[var(--color-error)] transition-colors disabled:opacity-40"
                >
                  Remove
                </button>
              </div>
            </div>
            
            <div className="text-center font-sans text-sm">{item.size}</div>
            
            <div className="flex justify-center items-center gap-4">
              <button 
                onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                disabled={isPending || item.quantity <= 1}
                className="text-[var(--color-secondary)] hover:text-[var(--color-on-surface)] transition-colors disabled:opacity-30"
              >
                <Minus strokeWidth={1.5} size={16} />
              </button>
              <span className="font-sans text-sm w-4 text-center">
                {isPending ? <Loader2 className="animate-spin text-xs inline" size={14} /> : item.quantity}
              </span>
              <button 
                onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                disabled={isPending}
                className="text-[var(--color-secondary)] hover:text-[var(--color-on-surface)] transition-colors disabled:opacity-30"
              >
                <Plus strokeWidth={1.5} size={16} />
              </button>
            </div>
            
            <div className="text-right font-serif text-lg">{formatInr(item.rawPrice)}</div>
          </div>
        ))}
      </div>

      {/* Shipping Notice */}
      <div className="mt-12 p-8 bg-[var(--color-surface-container-low)] flex items-start gap-4">
        <Truck strokeWidth={1} size={24} className="text-[var(--color-primary)] shrink-0" />
        <div>
          <p className="font-sans text-xs tracking-widest uppercase text-[var(--color-on-surface)] font-semibold mb-1">
            Complimentary White Glove Delivery
          </p>
          <p className="text-xs text-[var(--color-secondary)] font-sans leading-relaxed">
            Your selection qualifies for our signature concierge delivery service. Expect arrival within 3-5 business days.
          </p>
        </div>
      </div>
    </div>
  );
}
