import Navbar from "@/components/Navbar";
import { getOrderById } from "@/lib/data";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "Your Layana Boutique order has been confirmed.",
};

export const dynamic = "force-dynamic";

function formatInr(value: number) {
  return `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function OrderConfirmationPage({ params }: { params: { orderId: string } }) {
  const order = await getOrderById(params.orderId);

  if (!order) {
    redirect("/account");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow max-w-[1440px] mx-auto px-6 md:px-10 pt-16 mt-20 pb-20">
        <header className="mb-14 flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-xl">
            ✓
          </div>
          <div>
            <p className="font-sans text-[var(--color-secondary)] text-xs tracking-[0.25em] uppercase mb-2">
              Order Confirmed
            </p>
            <h1 className="font-serif text-5xl md:text-6xl font-light italic text-[var(--color-on-surface)]">
              Thank you for your purchase
            </h1>
            <p className="font-sans text-sm text-[var(--color-secondary)] mt-3">
              Your payment has been verified and your order is being prepared.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          <section className="lg:col-span-7 space-y-6">
            <div className="border border-[var(--color-outline-variant)]/30 rounded-2xl p-6 md:p-8 bg-[var(--color-surface-container-low)]">
              <h2 className="font-serif text-2xl text-[var(--color-on-surface)] mb-4">Order details</h2>
              <div className="space-y-2 text-sm text-[var(--color-secondary)]">
                <p>
                  <span className="font-semibold text-[var(--color-on-surface)]">Order ID:</span> {order.id}
                </p>
                <p>
                  <span className="font-semibold text-[var(--color-on-surface)]">Payment ID:</span>{" "}
                  {order.razorpayPaymentId}
                </p>
                <p>
                  <span className="font-semibold text-[var(--color-on-surface)]">Status:</span>{" "}
                  {order.status.toUpperCase()}
                </p>
              </div>
            </div>

            <div className="border border-[var(--color-outline-variant)]/30 rounded-2xl p-6 md:p-8 bg-[var(--color-surface-container-low)]">
              <h2 className="font-serif text-2xl text-[var(--color-on-surface)] mb-4">Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between border-b border-[var(--color-outline-variant)]/20 pb-3"
                  >
                    <div>
                      <p className="font-serif text-lg text-[var(--color-on-surface)]">{item.name}</p>
                      <p className="text-xs uppercase tracking-widest text-[var(--color-secondary)]">
                        {item.variant} · {item.size} · Qty {item.quantity}
                      </p>
                    </div>
                    <p className="font-serif text-lg text-[var(--color-on-surface)]">
                      {formatInr(item.rawPrice * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="lg:col-span-5 space-y-6">
            <div className="border border-[var(--color-outline-variant)]/30 rounded-2xl p-6 md:p-8 bg-[var(--color-surface-container-lowest)] shadow-[0_24px_48px_rgba(27,28,28,0.06)]">
              <h2 className="font-serif text-2xl text-[var(--color-on-surface)] mb-4">Shipping address</h2>
              {order.address ? (
                <div className="text-sm text-[var(--color-on-surface)] space-y-1">
                  <p className="font-semibold">{order.address.fullName}</p>
                  <p>{order.address.streetAddress}</p>
                  <p>
                    {order.address.city}, {order.address.state} {order.address.postalCode}
                  </p>
                  <p className="text-[var(--color-secondary)]">+91 {order.address.phone}</p>
                </div>
              ) : (
                <p className="text-sm text-[var(--color-secondary)]">Address not available.</p>
              )}
            </div>

            <div className="border border-[var(--color-outline-variant)]/30 rounded-2xl p-6 md:p-8 bg-[var(--color-surface-container-lowest)] shadow-[0_24px_48px_rgba(27,28,28,0.06)]">
              <h2 className="font-serif text-2xl text-[var(--color-on-surface)] mb-4">Summary</h2>
              <div className="space-y-3 text-sm text-[var(--color-secondary)]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatInr(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{formatInr(order.shipping)}</span>
                </div>
                <div className="pt-3 border-t border-[var(--color-outline-variant)]/20 flex justify-between items-center">
                  <span className="font-serif text-xl text-[var(--color-on-surface)]">Total</span>
                  <span className="font-serif text-2xl text-[var(--color-on-surface)]">{formatInr(order.total)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <a
                href="/ready-to-wear"
                className="px-5 py-3 border border-[var(--color-outline-variant)]/40 rounded-full text-sm font-sans tracking-[0.15em] uppercase text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-low)] transition-colors"
              >
                Continue Shopping
              </a>
              <a
                href="/account"
                className="px-5 py-3 bg-[var(--color-primary)] text-white rounded-full text-sm font-sans tracking-[0.15em] uppercase hover:opacity-90 transition-opacity"
              >
                View Orders
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
