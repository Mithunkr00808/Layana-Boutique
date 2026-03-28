"use client";

import { CreditCard, Building2, Smartphone } from "lucide-react";
import { CartItemType } from "./CartItems";

export default function CartSummary({ items }: { items: CartItemType[] }) {
  const subtotal = items.reduce((acc, item) => acc + item.rawPrice * item.quantity, 0);

  return (
    <div className="lg:col-span-4">
      <div className="bg-[var(--color-surface-container-lowest)] p-10 shadow-[0_24px_48px_rgba(27,28,28,0.06)] sticky top-32">
        <h2 className="font-serif text-2xl font-light mb-8 text-[var(--color-on-surface)]">Summary</h2>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="font-sans text-xs tracking-widest uppercase text-[var(--color-secondary)]">Subtotal</span>
            <span className="font-sans font-medium text-lg text-[var(--color-on-surface)]">€{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-sans text-xs tracking-widest uppercase text-[var(--color-secondary)]">Shipping</span>
            <span className="font-sans text-xs tracking-widest uppercase text-[var(--color-on-surface)] font-medium">Complimentary</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-sans text-xs tracking-widest uppercase text-[var(--color-secondary)]">Estimated Tax</span>
            <span className="font-sans font-medium text-lg text-[var(--color-on-surface)]">€0.00</span>
          </div>

          <div className="pt-6 border-t border-[var(--color-outline-variant)]/20 flex justify-between items-center mb-10">
            <span className="font-serif text-xl text-[var(--color-on-surface)]">Total</span>
            <span className="font-serif text-2xl text-[var(--color-on-surface)]">€{subtotal.toFixed(2)}</span>
          </div>

          <button className="w-full py-5 bg-[var(--color-primary)] text-white font-sans text-xs tracking-[0.2em] uppercase transition-all active:scale-[0.98] hover:opacity-90">
            Proceed to Checkout
          </button>

          <div className="mt-8 text-center">
            <p className="font-sans text-[10px] text-[var(--color-secondary)] tracking-widest uppercase mb-4">
              Secure Payment Options
            </p>
            <div className="flex justify-center gap-4 text-[var(--color-secondary)] opacity-40">
              <CreditCard strokeWidth={1.5} size={24} />
              <Building2 strokeWidth={1.5} size={24} />
              <Smartphone strokeWidth={1.5} size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
