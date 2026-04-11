/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { createOrder, verifyPayment } from "./actions";
import { addAddress } from "@/app/account/actions";
import type { Address, CartItem } from "@/lib/data";
import { useAuth } from "@/lib/contexts/AuthContext";
import Image from "next/image";
import { Button } from "@/components/ui/button";

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
  const { user } = useAuth();
  const [addressesState, setAddressesState] = useState<Address[]>(addresses);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(addresses[0]?.id ?? "");
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [addingAddress, setAddingAddress] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [newAddress, setNewAddress] = useState<{
    fullName: string;
    phone: string;
    streetAddress: string;
    city: string;
    state: string;
    postalCode: string;
    addressType: "home" | "work" | "other";
  }>({
    fullName: "",
    phone: "",
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    addressType: "home",
  });

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
      const order = await createOrder(selectedAddressId, shippingMethod);

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
            setFailed(result.error || "Payment verification failed. Please contact support.");
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

  const shippingAmount = shippingMethod === "standard" ? 0 : 250;
  const totalWithShipping = subtotal + shippingAmount;
  const totalDisplayWithShipping = formatPrice(totalWithShipping);

  const setAddressField = (key: keyof typeof newAddress, value: string) => {
    setNewAddress((prev) => ({ ...prev, [key]: value }));
  };

  const maybeAutoFillCityState = async (pin: string) => {
    if (pin.length !== 6 || newAddress.city || newAddress.state) return;
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = (await res.json()) as any[];
      const office = data?.[0]?.PostOffice?.[0];
      if (office) {
        setNewAddress((prev) => ({
          ...prev,
          city: prev.city || office?.District || "",
          state: prev.state || office?.State || "",
        }));
      }
    } catch (err) {
      console.warn("PIN lookup failed", err);
    }
  };

  const addNewAddress = async () => {
    if (!user) {
      setToastMessage("Sign in to add an address.");
      return;
    }

    const result = await addAddress(newAddress);

    if (result.success) {
      setAddressesState((prev) => [...prev, result.address]);
      setSelectedAddressId(result.address.id);
      setAddingAddress(false);
      setToastMessage("Address added");
    } else {
      setToastMessage(result.error || "Could not add address. Try again.");
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
        <div className="lg:col-span-2 space-y-14">
          <section className="space-y-6">
            <h2 className="font-serif text-3xl tracking-tight">Shipping Address</h2>

            {addressesState.length > 0 && (
              <div className="space-y-3">
                {addressesState.map((address) => (
                  <label
                    key={address.id}
                    className={`flex items-start justify-between p-4 rounded-lg border transition cursor-pointer ${
                      selectedAddressId === address.id
                        ? "border-[var(--color-primary)] bg-[var(--color-surface-container-lowest)]"
                        : "border-[var(--color-outline-variant)]/40 hover:border-[var(--color-primary)]/60"
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
                        <p className="font-serif text-lg">{address.fullName}</p>
                        <p className="text-sm text-[var(--color-secondary)]">
                          {address.streetAddress}, {address.city}, {address.state} {address.postalCode}
                        </p>
                        <p className="text-sm text-[var(--color-secondary)] mt-1">+91 {address.phone}</p>
                      </div>
                    </div>
                    <span className="text-xs uppercase tracking-[0.25em] text-[var(--color-secondary)]">
                      {address.addressType || "Home"}
                    </span>
                  </label>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setAddingAddress((v) => !v)}
              className="text-sm uppercase tracking-[0.25em] font-semibold text-[var(--color-on-surface)]"
            >
              {addingAddress ? "Close new address" : "Add new address"}
            </button>

            {addingAddress && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 p-6 rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-low)]">
                <div className="md:col-span-2">
                  <label className="block text-[var(--color-secondary)] text-xs uppercase tracking-[0.25em] mb-2">
                    Full Name
                  </label>
                  <input
                    value={newAddress.fullName}
                    onChange={(e) => setAddressField("fullName", e.target.value)}
                    className="w-full bg-transparent border-b border-[var(--color-outline-variant)]/40 focus:border-[var(--color-primary)] focus:ring-0 py-3"
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <label className="block text-[var(--color-secondary)] text-xs uppercase tracking-[0.25em] mb-2">
                    Phone
                  </label>
                  <input
                    value={newAddress.phone}
                    onChange={(e) => setAddressField("phone", e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                    maxLength={10}
                    inputMode="numeric"
                    className="w-full bg-transparent border-b border-[var(--color-outline-variant)]/40 focus:border-[var(--color-primary)] focus:ring-0 py-3"
                    placeholder="10-digit mobile"
                  />
                </div>
                <div>
                  <label className="block text-[var(--color-secondary)] text-xs uppercase tracking-[0.25em] mb-2">
                    PIN Code
                  </label>
                  <input
                    value={newAddress.postalCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
                      setAddressField("postalCode", val);
                      if (val.length === 6) maybeAutoFillCityState(val);
                    }}
                    maxLength={6}
                    inputMode="numeric"
                    className="w-full bg-transparent border-b border-[var(--color-outline-variant)]/40 focus:border-[var(--color-primary)] focus:ring-0 py-3"
                    placeholder="6-digit PIN"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[var(--color-secondary)] text-xs uppercase tracking-[0.25em] mb-2">
                    Street Address
                  </label>
                  <input
                    value={newAddress.streetAddress}
                    onChange={(e) => setAddressField("streetAddress", e.target.value)}
                    className="w-full bg-transparent border-b border-[var(--color-outline-variant)]/40 focus:border-[var(--color-primary)] focus:ring-0 py-3"
                    placeholder="House number, street, area"
                  />
                </div>
                <div>
                  <label className="block text-[var(--color-secondary)] text-xs uppercase tracking-[0.25em] mb-2">
                    City
                  </label>
                  <input
                    value={newAddress.city}
                    onChange={(e) => setAddressField("city", e.target.value)}
                    className="w-full bg-transparent border-b border-[var(--color-outline-variant)]/40 focus:border-[var(--color-primary)] focus:ring-0 py-3"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-[var(--color-secondary)] text-xs uppercase tracking-[0.25em] mb-2">
                    State
                  </label>
                  <input
                    value={newAddress.state}
                    onChange={(e) => setAddressField("state", e.target.value)}
                    className="w-full bg-transparent border-b border-[var(--color-outline-variant)]/40 focus:border-[var(--color-primary)] focus:ring-0 py-3"
                    placeholder="State"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[var(--color-secondary)] text-xs uppercase tracking-[0.25em] mb-3">
                    Address Type
                  </label>
                  <div className="flex gap-3">
                    {["home", "work", "other"].map((type) => {
                      const active = newAddress.addressType === type;
                      return (
                        <button
                          type="button"
                          key={type}
                          onClick={() => setAddressField("addressType", type as "home" | "work" | "other")}
                          className={`px-4 py-2 rounded-full border text-sm capitalize transition ${
                            active
                              ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                              : "bg-white text-[var(--color-on-surface)] border-[var(--color-outline-variant)]/50 hover:border-[var(--color-primary)]"
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <Button
                    type="button"
                    onClick={addNewAddress}
                    className="px-6 py-6 bg-[var(--color-primary)] text-white text-xs uppercase tracking-[0.2em] rounded-md hover:opacity-90"
                  >
                    Save & Use
                  </Button>
                </div>
              </div>
            )}
          </section>

          <section className="space-y-6">
            <h2 className="font-serif text-3xl tracking-tight">Shipping Method</h2>
            <div className="space-y-3">
              <label className="group flex items-center justify-between p-5 rounded-lg border border-[var(--color-outline-variant)]/30 hover:border-[var(--color-primary)]/60 transition cursor-pointer">
                <div className="flex items-center gap-4">
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingMethod === "standard"}
                    onChange={() => setShippingMethod("standard")}
                    className="w-5 h-5 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                  <div>
                    <span className="block font-sans text-base font-semibold">Standard Delivery</span>
                    <span className="text-[var(--color-secondary)] text-sm">3-5 Business Days</span>
                  </div>
                </div>
                <span className="font-sans font-medium text-sm">Complimentary</span>
              </label>
              <label className="group flex items-center justify-between p-5 rounded-lg border border-[var(--color-outline-variant)]/30 hover:border-[var(--color-primary)]/60 transition cursor-pointer">
                <div className="flex items-center gap-4">
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingMethod === "express"}
                    onChange={() => setShippingMethod("express")}
                    className="w-5 h-5 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                  <div>
                    <span className="block font-sans text-base font-semibold">Express Priority</span>
                    <span className="text-[var(--color-secondary)] text-sm">Next Day Delivery</span>
                  </div>
                </div>
                <span className="font-sans font-medium text-sm">{formatPrice(shippingAmount)}</span>
              </label>
            </div>
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-[var(--color-surface-container-low)] p-8 rounded-xl shadow-[0_24px_48px_rgba(27,28,28,0.06)] border border-[var(--color-outline-variant)]/20">
            <h3 className="font-serif text-2xl mb-6">Order Summary</h3>
            <div className="space-y-6 mb-8">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-28 bg-[var(--color-surface-container-highest)] overflow-hidden rounded-lg relative">
                    <Image
                      src={item.image || "/placeholder.png"}
                      alt={item.alt || item.name}
                      className="object-cover"
                      fill
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-sans font-semibold text-[var(--color-on-surface)]">{item.name}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-secondary)] mt-1">
                      {["one size", "os"].includes((item.size || "").toLowerCase()) ? "" : `${item.size} · `}Qty {item.quantity}
                    </p>
                    <p className="mt-1 font-sans font-semibold text-[var(--color-on-surface)]">
                      {formatPrice(item.rawPrice * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t border-[var(--color-outline-variant)]/20">
              <div className="flex justify-between text-sm text-[var(--color-secondary)]">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-[var(--color-secondary)]">
                <span>Shipping</span>
                <span>{shippingAmount === 0 ? "Complimentary" : formatPrice(shippingAmount)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-[var(--color-on-surface)] pt-2">
                <span>Total</span>
                <span>{totalDisplayWithShipping}</span>
              </div>
            </div>

            <Button
              onClick={handlePay}
              disabled={paymentState === "creating" || paymentState === "verifying" || isPending || !items.length}
              className="w-full mt-8 py-8 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-container)] text-white font-sans text-xs tracking-[0.25em] uppercase rounded-md shadow-lg shadow-[var(--color-primary)]/10 active:scale-95 hover:opacity-90 disabled:opacity-50"
            >
              {paymentState === "creating"
                ? "Securing…"
                : paymentState === "verifying"
                ? "Confirming…"
                : "Proceed to Payment"}
            </Button>
            <p className="text-xs text-[var(--color-secondary)] mt-4 leading-relaxed">
              By placing your order, you agree to our Terms and Privacy. Secure transaction powered by Razorpay.
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
