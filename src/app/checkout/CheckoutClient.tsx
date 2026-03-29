"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { createOrder, verifyPayment } from "./actions";
import type { Address, CartItem } from "@/lib/data";

type PaymentState = "idle" | "creating" | "verifying" | "failed";

interface Props {
  items: CartItem[];
  addresses: Address[];
  subtotal: number;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutClient({ items, addresses, subtotal }: Props) {
  const router = useRouter();
  const [selectedAddressId, setSelectedAddressId] = useState<string>(addresses[0]?.id ?? "");
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const totalDisplay = useMemo(
    () =>
      `₹${subtotal.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
    [subtotal]
  );

  const setFailed = (message: string) => {
    setPaymentState("failed");
    setToastMessage(message);
  };

  const handlePay = async () => {
    if (!selectedAddressId) {
      setToastMessage("Select an address to continue.");
      return;
    }

    startTransition(async () => {
      setPaymentState("creating");
      const order = await createOrder(selectedAddressId);

      if ("error" in order) {
        setFailed(order.error || "Unable to start payment");
        return;
      }

      if (!window.Razorpay) {
        setFailed("Payment SDK not loaded. Please retry.");
        return;
      }

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "Layana Boutique",
        description: "Your curated selection",
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          setPaymentState("verifying");
          const result = await verifyPayment({
            ...response,
            addressId: selectedAddressId,
          });
          if (result.success) {
            router.push(`/order/${result.orderId}/confirmation`);
          } else {
            setFailed("Payment failed. Please try again.");
          }
        },
        modal: {
          ondismiss: () => {
            setToastMessage("Payment cancelled");
            setPaymentState("idle");
          },
        },
        theme: { color: "#1B1C1C" },
      });

      setPaymentState("idle");
      rzp.open();
    });
  };

  const overlayText =
    paymentState === "creating"
      ? "Securing your payment…"
      : paymentState === "verifying"
      ? "Confirming your payment…"
      : null;

  const formatPrice = (value: number) =>
    `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative">
        <div className="lg:col-span-2 space-y-8">
          <section className="border border-[var(--color-outline-variant)]/30 rounded-2xl p-6 md:p-8 bg-[var(--color-surface-container-low)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-2xl text-[var(--color-on-surface)]">Delivery address</h2>
              <a
                href="/account/addresses?return=/checkout"
                className="text-sm font-sans tracking-widest uppercase text-[var(--color-secondary)] hover:text-[var(--color-on-surface)] transition-colors"
              >
                Add new
              </a>
            </div>

            {addresses.length === 0 ? (
              <p className="text-sm text-[var(--color-secondary)]">
                No addresses saved. Add one to continue to payment.
              </p>
            ) : (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className={`block rounded-xl border p-4 cursor-pointer transition-colors ${
                      selectedAddressId === address.id
                        ? "border-[var(--color-primary)] bg-[var(--color-surface-container-lowest)]"
                        : "border-[var(--color-outline-variant)]/40 hover:border-[var(--color-primary)]/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="address"
                        className="mt-1"
                        checked={selectedAddressId === address.id}
                        onChange={() => setSelectedAddressId(address.id)}
                      />
                      <div>
                        <p className="font-serif text-lg text-[var(--color-on-surface)]">{address.fullName}</p>
                        <p className="text-sm text-[var(--color-secondary)]">
                          {address.streetAddress}, {address.city}, {address.state} {address.postalCode}
                        </p>
                        <p className="text-sm text-[var(--color-secondary)] mt-1">+91 {address.phone}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </section>

          <section className="border border-[var(--color-outline-variant)]/30 rounded-2xl p-6 md:p-8 bg-[var(--color-surface-container-low)]">
            <h2 className="font-serif text-2xl text-[var(--color-on-surface)] mb-6">Order review</h2>
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between border-b border-[var(--color-outline-variant)]/20 pb-4">
                  <div>
                    <p className="font-serif text-lg text-[var(--color-on-surface)]">{item.name}</p>
                    <p className="text-xs uppercase tracking-widest text-[var(--color-secondary)]">
                      {item.variant} · {item.size} · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="font-serif text-lg text-[var(--color-on-surface)]">
                    {formatPrice(item.rawPrice * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-sm text-[var(--color-secondary)]">
                <span>Subtotal</span>
                <span>{totalDisplay}</span>
              </div>
              <div className="flex justify-between text-sm text-[var(--color-secondary)]">
                <span>Shipping</span>
                <span>Complimentary</span>
              </div>
              <div className="pt-4 flex justify-between items-center border-t border-[var(--color-outline-variant)]/20">
                <span className="font-serif text-xl text-[var(--color-on-surface)]">Total</span>
                <span className="font-serif text-2xl text-[var(--color-on-surface)]">{totalDisplay}</span>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-[var(--color-surface-container-lowest)] p-6 rounded-2xl shadow-[0_24px_48px_rgba(27,28,28,0.06)] border border-[var(--color-outline-variant)]/20">
            <div className="flex items-center justify-between mb-4">
              <p className="font-sans text-xs tracking-[0.2em] uppercase text-[var(--color-secondary)]">
                Pay securely
              </p>
              <span className="text-xs text-[var(--color-secondary)]">Razorpay</span>
            </div>
            <p className="font-serif text-3xl text-[var(--color-on-surface)] mb-6">{totalDisplay}</p>
            <button
              onClick={handlePay}
              disabled={paymentState === "creating" || paymentState === "verifying" || isPending || !items.length}
              className="w-full py-4 bg-[var(--color-primary)] text-white font-sans text-xs tracking-[0.2em] uppercase transition-all active:scale-[0.98] hover:opacity-90 disabled:opacity-50"
            >
              {paymentState === "creating"
                ? "Securing…"
                : paymentState === "verifying"
                ? "Confirming…"
                : "Pay Now"}
            </button>
            {paymentState === "failed" && (
              <div className="mt-4 text-sm text-[var(--color-error)]">
                Payment failed. Please try again.
                <button
                  onClick={handlePay}
                  className="ml-3 underline text-[var(--color-on-surface)]"
                  disabled={isPending}
                >
                  Retry
                </button>
              </div>
            )}
            <p className="mt-4 text-xs text-[var(--color-secondary)] leading-relaxed">
              Your payment is encrypted and processed securely. On cancellation, you can reopen the payment window
              anytime.
            </p>
          </div>
        </div>

        {overlayText && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center rounded-2xl transition-opacity">
            <div className="bg-white/90 px-6 py-4 rounded-full shadow-lg border border-[var(--color-outline-variant)]/30">
              <p className="font-sans text-sm tracking-widest uppercase text-[var(--color-on-surface)]">
                {overlayText}
              </p>
            </div>
          </div>
        )}
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 shadow-lg rounded-xl px-4 py-3 text-sm text-[var(--color-on-surface)]">
          {toastMessage}
        </div>
      )}
    </>
  );
}
