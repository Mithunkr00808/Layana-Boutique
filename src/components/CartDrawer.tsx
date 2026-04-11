"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/contexts/CartContext";
import { X, ShoppingBag, Minus, Plus } from "lucide-react";

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, subtotal, removeItem, updateQuantity, itemCount } = useCart();

  // Prevent scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const formatInr = (value: number) =>
    `₹${value.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-[100dvh] w-[85%] max-w-sm bg-white z-[70] shadow-2xl flex flex-col md:hidden border-l border-zinc-100"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h3 className="font-serif text-2xl italic leading-none mb-1">My Bag</h3>
                <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                  {itemCount} Items Saved
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center text-zinc-900"
              >
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto p-6 space-y-8 bg-white">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300">
                    <ShoppingBag size={32} strokeWidth={1} />
                  </div>
                  <div>
                    <p className="font-serif text-xl italic mb-2">Empty Bag</p>
                    <p className="text-sm text-zinc-500 max-w-[200px]">
                      Your curation is waiting for your signature pieces.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-8 py-3 bg-zinc-900 text-white text-[10px] uppercase tracking-[0.2em] font-bold rounded-lg"
                  >
                    Start Exploring
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="w-24 h-32 rounded-2xl bg-zinc-100 overflow-hidden shrink-0">
                      <Image
                        src={item.image}
                        alt={item.alt}
                        width={96}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col justify-between py-1 flex-grow">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-medium leading-[1.3] max-w-[140px]">
                            {item.name}
                          </h4>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-zinc-400 hover:text-red-500"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <p className="text-[10px] uppercase tracking-wider text-zinc-500 mt-1">
                          {item.variant} • {item.size}
                        </p>
                      </div>

                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-4 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-100">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="text-zinc-400 hover:text-zinc-900"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="text-zinc-400 hover:text-zinc-900"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="text-sm font-bold tracking-tight">
                          {formatInr(item.rawPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-zinc-100 space-y-4 bg-white">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
                    Subtotal
                  </span>
                  <span className="font-serif text-2xl">{formatInr(subtotal)}</span>
                </div>
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="block w-full py-4 bg-zinc-900 text-white text-[10px] uppercase tracking-[0.2em] font-bold rounded-xl text-center shadow-lg shadow-zinc-900/10 active:scale-[0.98] transition-transform"
                >
                  Checkout Selection
                </Link>
                <p className="text-[10px] text-zinc-400 text-center uppercase tracking-widest">
                  Shipping & taxes calculated at checkout
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
