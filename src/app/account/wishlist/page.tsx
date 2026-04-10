"use client";

import { useEffect, useState, useTransition } from "react";
import Navbar from "@/components/Navbar";
import AccountSidebar from "@/components/AccountSidebar";
import { useAuth } from "@/lib/contexts/AuthContext";
import { getWishlistItems, removeWishlistItem } from "@/app/account/actions";
import type { WishlistItem } from "@/app/account/actions";
import { addCartItem } from "@/app/cart/actions";
import { Info } from "lucide-react";
import Image from "next/image";

export default function WishlistPage() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function fetchWishlist() {
      if (!user) return;
      try {
        const data = await getWishlistItems();
        setItems(data);
      } catch (error) {
        console.error("Failed to load wishlist:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchWishlist();
  }, [user]);

  const removeItem = async (id: string) => {
    if (!user) return;
    try {
      const result = await removeWishlistItem(id);
      if (result.success) {
        setItems((prev) => prev.filter((i) => i.id !== id));
      }
    } catch (error) {
      console.error("Failed to remove wishlist item:", error);
    }
  };

  const handleAddToBag = (item: WishlistItem) => {
    startTransition(async () => {
      await addCartItem({
        productId: item.id,
        name: item.name,
        variant: item.variant || "",
        size: item.size || "",
        price: item.rawPrice ?? 0,
        priceDisplay:
          item.price ||
          `₹${(item.rawPrice ?? 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
        image: item.image || "",
        alt: item.alt || item.name,
      });
    });
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-sm text-zinc-500">Loading wishlist…</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-surface,#fbf9f8)] text-[var(--color-on-surface,#1b1c1c)]">
      <Navbar />

      <main className="pt-28 pb-20 px-6 md:px-10 max-w-screen-2xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
          <div className="hidden md:block md:col-span-3 lg:col-span-2">
            <AccountSidebar active="wishlist" email={user?.email || ""} />
          </div>

          <section className="md:col-span-9 lg:col-span-10 pb-12">
            <header className="mb-12">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-sans uppercase tracking-[0.3em] text-zinc-500">
                  Your Selection
                </span>
                <div className="flex items-baseline justify-between">
                  <h1 className="text-5xl md:text-6xl font-serif italic text-[var(--color-on-surface,#1b1c1c)] leading-none">
                    Saved Items
                  </h1>
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                    {items.length} items curated
                  </p>
                </div>
              </div>
            </header>

            {items.length === 0 ? (
              <div className="border border-dashed border-zinc-300 rounded-xl p-12 text-center bg-white">
                <p className="font-serif text-2xl mb-3">Your wishlist is empty</p>
                <p className="text-sm text-zinc-500 mb-6">
                  Save products to curate your look. They will appear here.
                </p>
                <a
                  href="/ready-to-wear"
                  className="inline-flex px-6 py-3 bg-blue-900 text-white rounded-full text-xs tracking-[0.2em] uppercase hover:opacity-90 transition"
                >
                  Browse collection
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-y-16 gap-x-10">
                {items.map((item) => (
                  <article key={item.id} className="group relative">
                    <div className="overflow-hidden bg-[var(--color-surface-container-low,#f6f3f2)] aspect-[3/4] mb-6 rounded relative">
                      <Image
                        className="object-cover group-hover:scale-105 duration-300 ease-out"
                        src={item.image || "/placeholder.png"}
                        alt={item.alt || item.name}
                        fill
                      />
                      <div className="absolute inset-0 flex flex-col items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-zinc-700 hover:text-red-600 transition-colors mb-2"
                          aria-label="Remove from wishlist"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium tracking-tight">{item.name}</h3>
                          <p className="text-xs uppercase tracking-widest text-zinc-500 mt-1">
                            {item.variant || "Curated Piece"}
                          </p>
                        </div>
                        <span className="text-sm font-semibold">
                          {item.price ||
                            `₹${(item.rawPrice ?? 0).toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-4 text-[10px] uppercase text-zinc-500">
                          {item.size && <span>Size: {item.size}</span>}
                          <span>In Stock</span>
                        </div>
                        <button
                          onClick={() => handleAddToBag(item)}
                          disabled={isPending}
                          className="text-[11px] font-sans uppercase tracking-[0.2em] border-b border-zinc-300 pb-1 hover:border-zinc-900 transition-colors disabled:opacity-50"
                        >
                          {isPending ? "Adding..." : "Add to Bag"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}

                <div className="xl:col-span-2 flex flex-col items-center justify-center border border-zinc-200 bg-[var(--color-surface-container-low,#f6f3f2)] min-h-[320px] p-10 text-center">
                  <Info className="text-zinc-400 mb-4" size={32} />
                  <h4 className="font-serif italic text-2xl mb-3">Complete your look</h4>
                  <p className="text-sm text-zinc-500 max-w-xs mb-6">
                    Discover pieces curated based on your recently saved aesthetic.
                  </p>
                  <a
                    href="/ready-to-wear"
                    className="px-8 py-3 bg-blue-900 text-white text-[11px] font-sans uppercase tracking-widest rounded-lg hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/10"
                  >
                    Explore Recommendations
                  </a>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
