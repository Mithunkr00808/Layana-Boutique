"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { PRODUCT_CATEGORY_OPTIONS, getCategoryHref } from "@/lib/catalog/categories";

export default function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  // Prevent scroll when menu is open
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

          {/* Menu Panel */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-[100dvh] w-[85%] max-w-sm bg-white z-[70] shadow-2xl flex flex-col md:hidden border-r border-zinc-100"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h3 className="font-serif text-2xl italic leading-none mb-1">Menu</h3>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center text-zinc-900 -mr-2"
                aria-label="Close menu"
              >
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto p-6 bg-white">
              <div className="flex flex-col gap-6">
                {PRODUCT_CATEGORY_OPTIONS.map((category) => (
                  <Link
                    key={category.value}
                    href={getCategoryHref(category.value)}
                    onClick={onClose}
                    className="font-sans tracking-[0.2em] text-sm uppercase font-semibold antialiased text-zinc-700 hover:text-zinc-900"
                  >
                    {category.label}
                  </Link>
                ))}
              </div>

              <div className="border-t border-zinc-100 mt-8 pt-8 flex flex-col gap-6">
                <Link
                  href="/account"
                  onClick={onClose}
                  className="font-sans tracking-[0.2em] text-sm uppercase font-semibold antialiased text-zinc-700 hover:text-zinc-900"
                >
                  Account
                </Link>
                <Link
                  href="/account/wishlist"
                  onClick={onClose}
                  className="font-sans tracking-[0.2em] text-sm uppercase font-semibold antialiased text-zinc-700 hover:text-zinc-900"
                >
                  Wishlist
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
