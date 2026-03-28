"use client";

import Image from "next/image";
import { Truck, Minus, Plus } from "lucide-react";

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
              <div className="w-24 h-32 bg-[var(--color-surface-container-low)] overflow-hidden shrink-0">
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
                <button className="mt-4 font-sans text-[10px] tracking-widest uppercase text-[var(--color-secondary)] hover:text-[var(--color-error)] transition-colors">
                  Remove
                </button>
              </div>
            </div>
            
            <div className="text-center font-sans text-sm">{item.size}</div>
            
            <div className="flex justify-center items-center gap-4">
              <button className="text-[var(--color-secondary)] hover:text-[var(--color-on-surface)] transition-colors">
                <Minus strokeWidth={1.5} size={16} />
              </button>
              <span className="font-sans text-sm w-4 text-center">{item.quantity}</span>
              <button className="text-[var(--color-secondary)] hover:text-[var(--color-on-surface)] transition-colors">
                <Plus strokeWidth={1.5} size={16} />
              </button>
            </div>
            
            <div className="text-right font-serif text-lg">{item.price}</div>
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
