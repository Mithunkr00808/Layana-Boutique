"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/contexts/CartContext";
import { X, ShoppingBag } from "lucide-react";

export default function MiniCart({ isOpen }: { isOpen: boolean }) {
  const { items, subtotal, removeItem, itemCount } = useCart();

  const formatInr = (value: number) =>
    `₹${value.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute top-full right-0 mt-4 w-96 bg-white border border-zinc-200/50 rounded-2xl shadow-2xl z-50 overflow-hidden ambient-shadow origin-top-right whitespace-normal"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-xl italic">The Selection</h3>
              <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                {itemCount} Items
              </span>
            </div>

            {items.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300">
                  <ShoppingBag size={24} strokeWidth={1} />
                </div>
                <p className="text-sm text-zinc-500 font-serif">Your bag is currently empty.</p>
                <Link
                  href="/collections/sarees"
                  className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-900 border-b border-blue-900/20 hover:border-blue-900 transition-colors"
                >
                  Discover the collection
                </Link>
              </div>
            ) : (
              <>
                <div className="max-h-[400px] overflow-y-auto space-y-6 pr-2 scrollbar-hide">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 group relative">
                      <div className="w-20 h-24 rounded-xl bg-zinc-100 overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.alt}
                          width={80}
                          height={96}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex flex-col justify-between py-1 flex-grow">
                        <div>
                          <h4 className="text-sm font-medium leading-tight mb-1">{item.name}</h4>
                          <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                            {item.variant} • {item.size}
                          </p>
                        </div>
                        <div className="flex justify-between items-end">
                          <span className="text-xs font-bold">{formatInr(item.rawPrice)}</span>
                          <span className="text-[10px] text-zinc-400">Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-white shadow-sm border border-zinc-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-100">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
                      Subtotal
                    </span>
                    <span className="font-serif text-lg">{formatInr(subtotal)}</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/cart"
                      className="w-full py-4 bg-zinc-900 text-white text-[10px] uppercase tracking-[0.2em] font-bold rounded-xl text-center hover:bg-zinc-800 transition-colors"
                    >
                      View Full Bag
                    </Link>
                    <Link
                      href="/checkout"
                      className="w-full py-4 border border-zinc-900 text-zinc-900 text-[10px] uppercase tracking-[0.2em] font-bold rounded-xl text-center hover:bg-zinc-50 transition-colors"
                    >
                      Checkout
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
