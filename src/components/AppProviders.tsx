"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { WishlistProvider } from "@/lib/contexts/WishlistContext";
import { CartProvider } from "@/lib/contexts/CartContext";

// Ensure useLayoutEffect doesn't throw during SSR
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

function ScrollToTop() {
  const pathname = usePathname();
  useIsomorphicLayoutEffect(() => {
    // Force scroll to top using multiple methods to override Next.js defaults synchronously before paint
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const timeoutId = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [pathname]);
  return null;
}

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  // Admin surfaces do not need storefront cart/wishlist state.
  if (isAdminRoute) {
    return (
      <AuthProvider>
        <ScrollToTop />
        {children}
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <ScrollToTop />
          {children}
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
