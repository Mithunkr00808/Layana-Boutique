"use client";

import React, { createContext, useContext, useEffect, useState, useTransition } from "react";
import { getWishlistedIds, toggleWishlistItem, WishlistItem } from "@/app/account/actions";

interface WishlistContextType {
  wishlistIds: string[];
  isWishlisted: (id: string) => boolean;
  toggle: (item: WishlistItem) => Promise<void>;
  removeById: (id: string) => void;
  isPending: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getWishlistedIds().then(setWishlistIds);
  }, []);

  const isWishlisted = (id: string) => wishlistIds.includes(id);

  const removeById = (id: string) => {
    setWishlistIds((prev) => prev.filter((item) => item !== id));
  };

  const toggle = async (item: WishlistItem) => {
    // Optimistic toggle
    const alreadyWishlisted = isWishlisted(item.id);
    if (alreadyWishlisted) {
      removeById(item.id);
    } else {
      setWishlistIds((prev) => [...prev, item.id]);
    }

    startTransition(async () => {
      const result = await toggleWishlistItem(item);
      if (!result.success) {
        // Rollback on error
        if (alreadyWishlisted) {
          setWishlistIds((prev) => [...prev, item.id]);
        } else {
          setWishlistIds((prev) => prev.filter((id) => id !== item.id));
        }
      } else {
        // Sync with final server state if needed
        const updatedIds = await getWishlistedIds();
        setWishlistIds(updatedIds);
      }
    });
  };

  return (
    <WishlistContext.Provider value={{ wishlistIds, isWishlisted, toggle, removeById, isPending }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
