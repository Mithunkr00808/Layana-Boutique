/* eslint-disable @typescript-eslint/no-explicit-any */
import Navbar from "@/components/Navbar";
import AccountSidebar from "@/components/AccountSidebar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebase/admin";
import { getUserOrders } from "@/lib/data";
import { Settings, Mail, Sprout } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
    redirect("/login?returnUrl=/account");
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

export default async function AccountPage() {
  const { name, email } = await getSessionUser();
  const orders = await getUserOrders(5);
  const latestOrder = orders[0] || null;
  const savedItems = latestOrder?.items?.slice(0, 4) || [];
  const displayName = name && name !== email ? name : "there";

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-surface,#fbf9f8)] text-[var(--color-on-surface,#1b1c1c)]">
      <Navbar />

      <main className="pt-28 pb-20 px-6 md:px-10 max-w-screen-2xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
          <div className="hidden md:block md:col-span-3 lg:col-span-2">
            <AccountSidebar active="profile" email={email} />
          </div>

          <div className="md:col-span-9 lg:col-span-10 space-y-16">
            <section className="max-w-3xl space-y-4">
              <h1 className="text-5xl md:text-7xl font-serif tracking-tight">
                Welcome back, <span className="italic">{displayName}.</span>
              </h1>
              <p className="text-lg text-zinc-500 max-w-xl">
                Keep track of your curation, deliveries, and saved looks.
              </p>
              {email && <p className="text-sm text-zinc-400">{email}</p>}
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-[var(--color-surface-container-low,#f6f3f2)] rounded-lg p-8 flex flex-col justify-between min-h-[380px] border border-zinc-200/60">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-2xl font-serif mb-2">Latest Order</h3>
                    {latestOrder ? (
                      <p className="text-sm text-zinc-500">
                        Order #{latestOrder.id} — {latestOrder.status}
                      </p>
                    ) : (
                      <p className="text-sm text-zinc-500">No orders yet</p>
                    )}
                  </div>
                  {latestOrder && (
                    <span className="bg-blue-900/10 text-blue-900 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest">
                      {latestOrder.status}
                    </span>
                  )}
                </div>

                {latestOrder && latestOrder.items.length > 0 ? (
                  <div className="flex gap-4 overflow-x-auto pb-4">
                    {latestOrder.items.slice(0, 4).map((item) => (
                      <div key={item.id} className="flex-shrink-0 w-32 group">
                        <div className="aspect-[3/4] overflow-hidden rounded mb-3 bg-zinc-100 relative">
                          <Image
                            src={item.image || "/placeholder.png"}
                            alt={item.alt || item.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-tighter truncate">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-zinc-500">
                          {formatCurrency(item.rawPrice || 0)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-zinc-500">Nothing to show yet.</div>
                )}

                <div className="mt-8 border-t border-zinc-200 pt-6 flex justify-between items-center">
                  <p className="text-sm">
                    Ordered on{" "}
                    <span className="font-semibold">
                      {latestOrder ? formatDate(latestOrder.createdAt) : "—"}
                    </span>
                  </p>
                  {latestOrder && (
                    <a
                      href="/account/orders"
                      className="text-sm font-bold text-blue-900 underline underline-offset-4 hover:opacity-70 transition-opacity"
                    >
                      View Details
                    </a>
                  )}
                </div>
              </div>

              <div className="bg-blue-900 text-white rounded-lg p-8 flex flex-col justify-between">
                <div>
                  <Sprout className="text-white mb-6" size={36} strokeWidth={1.5} />
                  <h3 className="text-2xl font-serif leading-tight mb-4">
                    Sustainability Impact
                  </h3>
                  <p className="text-sm opacity-80 leading-relaxed">
                    Based on your choices this season, your estimated impact savings are{" "}
                    <span className="font-bold">4.2kg CO₂</span>. Keep shopping consciously.
                  </p>
                </div>
                <div className="mt-8">
                  <button className="w-full py-4 border border-white/20 hover:bg-white hover:text-blue-900 transition-all duration-500 text-[10px] uppercase font-bold tracking-[0.2em] rounded-lg">
                    View Detailed Report
                  </button>
                </div>
              </div>
            </section>

            <section>
              <div className="flex justify-between items-end mb-10">
                <h2 className="text-3xl font-serif tracking-tight">Saved for later</h2>
                <a
                  href="/account/wishlist"
                  className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 hover:text-zinc-900 border-b border-zinc-400"
                >
                  View All
                </a>
              </div>

              {savedItems.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
                  {savedItems.map((item) => (
                    <div key={item.id} className="space-y-4 group">
                      <div className="aspect-[3/4] bg-[var(--color-surface-container-low,#f6f3f2)] overflow-hidden rounded relative">
                        <Image
                          src={item.image || "/placeholder.png"}
                          alt={item.alt || item.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-tight">
                          {item.name}
                        </h4>
                        <p className="text-sm text-zinc-500">
                          {formatCurrency(item.rawPrice || 0)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">
                  No saved items yet. Browse and add favorites to see them here.
                </p>
              )}
            </section>

            <section className="border-t border-zinc-200 pt-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <Link
                  href="/account/preferences"
                  className="flex gap-6 items-start hover:opacity-90 transition-opacity cursor-pointer relative z-10"
                >
                  <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
                    <Settings size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif mb-2">Account Preferences</h3>
                    <p className="text-sm text-zinc-500 mb-4">
                      Manage your password, notifications, and privacy options.
                    </p>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-blue-900">
                      Edit Preferences
                    </span>
                  </div>
                </Link>

                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif mb-2">Concierge Service</h3>
                    <p className="text-sm text-zinc-500 mb-4">
                      Connect with our styling advisors for personalized recommendations.
                    </p>
                    <button className="text-[10px] uppercase font-bold tracking-widest text-blue-900 hover:opacity-70 transition-opacity">
                      Contact Advisor
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
