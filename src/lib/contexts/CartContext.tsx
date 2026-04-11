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

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: any) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  refreshCart: () => Promise<void>;
  isPending: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isPending, startTransition] = useTransition();

  const refreshCart = async () => {
    const data = await fetchCartItems();
    setItems(data as CartItem[]);
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.rawPrice * item.quantity, 0);

  const addItem = async (input: any) => {
    // Optimistic Logic: Check if exists
    const docId = `${input.productId}-${input.size || "onesize"}`;
    const existingIndex = items.findIndex((i) => i.id === docId);
    
    const newItems = [...items];
    if (existingIndex > -1) {
      newItems[existingIndex].quantity += (input.quantity || 1);
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
      await addCartItem(input);
      await refreshCart();
    });
  };

  const removeItem = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    startTransition(async () => {
      await removeCartItem(id);
      await refreshCart();
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
      await updateCartItemQuantity(id, quantity);
      await refreshCart();
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
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
