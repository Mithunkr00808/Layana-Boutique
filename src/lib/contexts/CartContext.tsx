"use client";

import React, { createContext, useContext, useEffect, useState, useTransition } from "react";
import { fetchCartItems, addCartItem, removeCartItem, updateCartItemQuantity } from "@/app/cart/actions";

export interface CartItem {
  id: string;
  name: string;
  variant: string;
  size: string;
  quantity: number;
  price: string;
  rawPrice: number;
  image: string;
  alt: string;
  originalPrice?: string;
  rawOriginalPrice?: number;
}

type AddCartItemInput = Parameters<typeof addCartItem>[0];

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: AddCartItemInput) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  refreshCart: () => Promise<void>;
  isPending: boolean;
}

const fallbackCartContext: CartContextType = {
  items: [],
  itemCount: 0,
  subtotal: 0,
  addItem: async () => {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Cart action skipped because CartProvider is unavailable.");
    }
  },
  removeItem: async () => {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Cart action skipped because CartProvider is unavailable.");
    }
  },
  updateQuantity: async () => {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Cart action skipped because CartProvider is unavailable.");
    }
  },
  refreshCart: async () => {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Cart refresh skipped because CartProvider is unavailable.");
    }
  },
  isPending: false,
};

const CartContext = createContext<CartContextType>(fallbackCartContext);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isPending, startTransition] = useTransition();

  const refreshCart = async () => {
    const data = await fetchCartItems();
    setItems(data as CartItem[]);
  };

  useEffect(() => {
    let isActive = true;

    void fetchCartItems().then((data) => {
      if (isActive) {
        setItems(data as CartItem[]);
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.rawPrice * item.quantity, 0);

  const addItem = async (input: AddCartItemInput) => {
    // Optimistic Logic: Check if exists
    const docId = `${input.productId}-${input.size || "onesize"}`;
    const existingIndex = items.findIndex((i) => i.id === docId);
    
    const newItems = [...items];
    if (existingIndex > -1) {
      newItems[existingIndex] = {
        ...newItems[existingIndex],
        quantity: newItems[existingIndex].quantity + (input.quantity || 1)
      };
    } else {
      newItems.push({
        id: docId,
        name: input.name,
        variant: input.variant || "",
        size: input.size || "One Size",
        quantity: input.quantity || 1,
        price: input.priceDisplay || `₹${input.price.toLocaleString("en-IN")}`,
        rawPrice: input.price,
        image: input.image || "",
        alt: input.alt || input.name,
        originalPrice: input.originalPriceDisplay,
        rawOriginalPrice: input.originalPrice
      });
    }
    setItems(newItems);

    startTransition(async () => {
      const result = await addCartItem(input);
      // Only refresh from server for authenticated users.
      // For guests, the cookie isn't readable in the same request cycle,
      // so we trust the optimistic update above.
      if (!result.isGuest) {
        await refreshCart();
      }
    });
  };

  const removeItem = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    startTransition(async () => {
      const result = await removeCartItem(id);
      if (!result.isGuest) {
        await refreshCart();
      }
    });
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) {
      return removeItem(id);
    }
    
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );

    startTransition(async () => {
      const result = await updateCartItemQuantity(id, quantity);
      if (!result.isGuest) {
        await refreshCart();
      }
    });
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        refreshCart,
        isPending,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  return context;
}
