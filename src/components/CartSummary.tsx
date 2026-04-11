"use client";

import { CreditCard, Building2, Smartphone } from "lucide-react";
import { CartItemType } from "./CartItems";
import { useRouter } from "next/navigation";

export default function CartSummary({ items }: { items: CartItemType[] }) {
  const subtotal = items.reduce((acc, item) => acc + item.rawPrice * item.quantity, 0);
  const originalSubtotal = items.reduce((acc, item) => acc + (item.rawOriginalPrice ?? item.rawPrice) * item.quantity, 0);
  const discount = originalSubtotal - subtotal;

  const formatInr = (value: number) =>
    `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const router = useRouter();

  return (
    <div className="lg:col-span-4">
      <div className="bg-[var(--color-surface-container-lowest)] p-10 shadow-[0_24px_48px_rgba(27,28,28,0.06)] sticky top-32">
        <h2 className="font-serif text-2xl font-light mb-8 text-[var(--color-on-surface)]">Summary</h2>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="font-sans text-xs tracking-widest uppercase text-zinc-500">Subtotal</span>
            <span className="font-sans font-medium text-lg text-[var(--color-on-surface)]">
              {formatInr(originalSubtotal)}
            </span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between items-center">
              <span className="font-sans text-xs tracking-widest uppercase text-[var(--color-primary)]">Discount</span>
              <span className="font-sans font-medium text-lg text-[var(--color-primary)]">
                -{formatInr(discount)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="font-sans text-xs tracking-widest uppercase text-zinc-500">Shipping</span>
            <span className="font-sans text-xs tracking-widest uppercase text-zinc-900 font-medium">Complimentary</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-sans text-xs tracking-widest uppercase text-zinc-500">Estimated Tax</span>
            <span className="font-sans font-medium text-lg text-[var(--color-on-surface)]">₹0.00</span>
          </div>

          <div className="pt-6 border-t border-[var(--color-outline-variant)]/20 flex justify-between items-center mb-10">
            <span className="font-serif text-xl text-[var(--color-on-surface)]">Total</span>
            <span className="font-serif text-2xl text-[var(--color-on-surface)]">
              {formatInr(subtotal)}
            </span>
          </div>

          <button
            onClick={() => router.push("/checkout")}
            disabled={items.length === 0}
            className="w-full py-5 bg-[var(--color-primary)] text-white font-sans text-xs tracking-[0.2em] uppercase transition-all active:scale-[0.98] hover:opacity-90 disabled:opacity-50"
          >
            Proceed to Checkout
          </button>

          <div className="mt-8 text-center">
            <p className="font-sans text-[10px] text-zinc-500 tracking-widest uppercase mb-4">
              Secure Payment Options
            </p>
            <div className="flex justify-center gap-4 text-zinc-500 opacity-40">
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
