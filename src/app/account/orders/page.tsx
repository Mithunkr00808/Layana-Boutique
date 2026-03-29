import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getUserOrders } from "@/lib/data";

export const dynamic = "force-dynamic";

const formatInr = (value: number) =>
  `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default async function OrdersPage() {
  const orders = await getUserOrders();

  // getUserOrders returns [] on unauthenticated; middleware handles redirect, but double-guard:
  if (!orders) {
    redirect("/login?returnUrl=/account/orders");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow max-w-[1440px] mx-auto w-full px-6 md:px-10 pt-16 mt-20 pb-16">
        <header className="mb-12">
          <p className="font-sans text-[var(--color-secondary)] text-xs tracking-[0.25em] uppercase mb-3">
            Your purchases
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-light tracking-tight italic text-[var(--color-on-surface)]">
            Orders
          </h1>
          <p className="font-sans text-sm text-[var(--color-secondary)] mt-3 max-w-2xl">
            Track your recent purchases and revisit their confirmations.
          </p>
        </header>

        {orders.length === 0 ? (
          <div className="border border-[var(--color-outline-variant)]/30 rounded-2xl p-10 text-center bg-[var(--color-surface-container-low)]">
            <p className="font-serif text-2xl text-[var(--color-on-surface)] mb-3">No orders yet</p>
            <p className="text-sm text-[var(--color-secondary)] mb-6">
              When you place an order, it will appear here with its status and details.
            </p>
            <a
              href="/ready-to-wear"
              className="inline-flex px-6 py-3 bg-[var(--color-primary)] text-white rounded-full text-xs tracking-[0.2em] uppercase hover:opacity-90 transition"
            >
              Continue shopping
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-[var(--color-outline-variant)]/30 rounded-2xl p-6 md:p-8 bg-[var(--color-surface-container-lowest)] shadow-[0_24px_48px_rgba(27,28,28,0.06)]"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div>
                    <p className="font-sans text-xs uppercase tracking-[0.2em] text-[var(--color-secondary)]">
                      Order #{order.id}
                    </p>
                    <p className="font-serif text-2xl text-[var(--color-on-surface)]">
                      {formatInr(order.total ?? order.subtotal)}
                    </p>
                  </div>
                  <div className="flex gap-3 text-sm text-[var(--color-secondary)]">
                    <span className="px-3 py-1 rounded-full border border-[var(--color-outline-variant)]/50 uppercase tracking-[0.2em]">
                      {order.status ?? "paid"}
                    </span>
                    {order.razorpayPaymentId && (
                      <span className="px-3 py-1 rounded-full border border-[var(--color-outline-variant)]/50">
                        Payment: {order.razorpayPaymentId}
                      </span>
                    )}
                    {order.createdAt && (
                      <span className="px-3 py-1 rounded-full border border-[var(--color-outline-variant)]/50">
                        {new Date(order.createdAt.seconds ? order.createdAt.seconds * 1000 : order.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between border-b border-[var(--color-outline-variant)]/20 pb-2"
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

                <div className="flex gap-3">
                  <a
                    href={`/order/${order.id}/confirmation`}
                    className="px-5 py-3 bg-[var(--color-primary)] text-white rounded-full text-xs tracking-[0.2em] uppercase hover:opacity-90 transition"
                  >
                    View confirmation
                  </a>
                  <a
                    href="/ready-to-wear"
                    className="px-5 py-3 border border-[var(--color-outline-variant)]/40 rounded-full text-xs tracking-[0.2em] uppercase text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-low)] transition"
                  >
                    Continue shopping
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
