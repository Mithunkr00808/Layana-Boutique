import Navbar from "@/components/Navbar";
import CheckoutClient from "./CheckoutClient";
import { getCartItemsForUser, getUserAddresses } from "@/lib/data";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your purchase",
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  // Server-side auth guard
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) redirect("/account");
  try {
    await adminAuth.verifySessionCookie(session, true);
  } catch {
    redirect("/account");
  }

  const items = await getCartItemsForUser();
  const addresses = await getUserAddresses();

  if (!items.length) {
    redirect("/cart");
  }

  const subtotal = items.reduce((acc, item) => acc + item.rawPrice * item.quantity, 0);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow max-w-[1440px] mx-auto w-full px-6 md:px-10 pt-16 mt-20 pb-16">
        <header className="mb-14">
          <p className="font-sans text-[var(--color-secondary)] text-xs tracking-[0.25em] uppercase mb-3">
            Order Review
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-light tracking-tight italic text-[var(--color-on-surface)]">
            Checkout
          </h1>
          <p className="font-sans text-sm text-[var(--color-secondary)] mt-3 max-w-2xl">
            Confirm your delivery details and complete your payment securely via Razorpay.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          <div className="lg:col-span-12">
            <CheckoutClient items={items} addresses={addresses} subtotal={subtotal} />
          </div>
        </div>
      </main>
    </div>
  );
}
