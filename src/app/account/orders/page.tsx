import Navbar from "@/components/Navbar";
import AccountSidebar from "@/components/AccountSidebar";
import { getUserOrders } from "@/lib/data";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: any) {
  try {
    const date =
      typeof value?.toDate === "function"
        ? value.toDate()
        : typeof value === "number"
        ? new Date(value)
        : new Date(String(value));
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) {
    return { name: "there", email: "" };
  }
  const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
  const uid = decoded.uid;
  const userRecord = await adminAuth.getUser(uid).catch(() => null);
  const name =
    userRecord?.displayName ||
    decoded.name ||
    decoded.email?.split("@")[0] ||
    userRecord?.email?.split("@")[0] ||
    "there";
  const email = decoded.email || userRecord?.email || "";
  return { name, email };
}

export default async function OrdersPage() {
  const [{ email }, orders] = await Promise.all([getSessionUser(), getUserOrders()]);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-surface,#fbf9f8)] text-[var(--color-on-surface,#1b1c1c)]">
      <Navbar />

      <main className="pt-28 pb-20 px-6 md:px-10 max-w-screen-2xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
          <div className="hidden md:block md:col-span-3 lg:col-span-2">
            <AccountSidebar active="orders" email={email} />
          </div>

          <section className="md:col-span-9 lg:col-span-10 pb-12">
            <header className="mb-12">
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-500 mb-2">
                Orders
              </p>
            <h1 className="text-5xl font-serif font-light tracking-tight mb-2">
              Your Orders
            </h1>
            <p className="text-zinc-500">
              Review and track your curated selections from our collections.
            </p>
          </header>

          {orders.length === 0 ? (
            <div className="border border-dashed border-zinc-300 rounded-xl p-10 text-center bg-white">
              <p className="font-serif text-2xl mb-3">No orders yet</p>
              <p className="text-sm text-zinc-500 mb-6">
                When you place an order, it will appear here with its status and details.
              </p>
              <Link
                href="/ready-to-wear"
                className="inline-flex px-6 py-3 bg-blue-900 text-white rounded-full text-xs tracking-[0.2em] uppercase hover:opacity-90 transition"
              >
                Continue shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-10">
              {orders.map((order) => {
                const status = (order.status || "paid").toLowerCase();
                const statusColor =
                  status === "delivered"
                    ? "text-green-700 bg-green-100"
                    : status === "shipped"
                    ? "text-blue-800 bg-blue-100"
                    : status === "paid"
                    ? "text-blue-800 bg-blue-100"
                    : "text-zinc-700 bg-zinc-100";

                return (
                  <article
                    key={order.id}
                    className="bg-white p-8 lg:p-10 flex flex-col lg:flex-row justify-between gap-8 border border-zinc-200 shadow-sm hover:bg-zinc-50 transition"
                  >
                    <div className="flex flex-col justify-between space-y-6">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <span
                            className={`text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full ${statusColor}`}
                          >
                            {order.status || "Paid"}
                          </span>
                          {order.createdAt && (
                            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                              {formatDate(order.createdAt)}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-serif tracking-tight">#{order.id}</h3>
                        <p className="text-zinc-500 text-sm mt-1">
                          Total amount: {formatCurrency(order.total ?? order.subtotal ?? 0)}
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <Link
                          href={`/order/${order.id}/confirmation`}
                          className="text-xs uppercase tracking-widest font-semibold border-b border-blue-900 text-blue-900 pb-0.5 hover:opacity-70 transition"
                        >
                          View Details
                        </Link>
                        {order.status?.toLowerCase() === "shipped" && (
                          <button className="text-xs uppercase tracking-widest font-semibold bg-blue-900 text-white px-6 py-3 rounded-lg hover:shadow-lg transition">
                            Track Order
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between gap-6 w-full lg:w-auto">
                      <div className="flex -space-x-4 overflow-hidden">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div
                            key={item.id}
                            className={`w-28 h-40 bg-zinc-100 overflow-hidden shadow-sm ${
                              idx === 1 ? "shadow-[-14px_0_24px_rgba(0,0,0,0.08)]" : ""
                            } ${idx === 2 ? "shadow-[-18px_0_30px_rgba(0,0,0,0.12)]" : ""}`}
                          >
                            <img
                              src={item.image}
                              alt={item.alt || item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
          </section>
        </div>
      </main>
    </div>
  );
}
