import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartItems from "@/components/CartItems";
import CartSummary from "@/components/CartSummary";
import { cartItemsMock } from "@/data/mockData";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Selection",
  description: "Explore the items currently curated in your selection.",
};

export default function CartPage() {
  // In a future step when user authentication is active,
  // we would fetch the user's specific cart from Firestore here.
  const activeCart = cartItemsMock;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow max-w-[1440px] mx-auto px-10 w-full pt-16 mt-20 min-h-[calc(100vh-400px)]">
        {/* Editorial Header */}
        <header className="mb-20">
          <h1 className="font-serif text-5xl font-light tracking-tighter mb-4 italic text-[var(--color-on-surface)]">
            The Selection
          </h1>
          <p className="font-sans text-[var(--color-secondary)] text-sm tracking-widest uppercase">
            Items currently in your curated collection
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          <CartItems items={activeCart} />
          <CartSummary items={activeCart} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
