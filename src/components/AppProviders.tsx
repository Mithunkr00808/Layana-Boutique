"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { WishlistProvider } from "@/lib/contexts/WishlistContext";
import { CartProvider } from "@/lib/contexts/CartContext";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  // Admin surfaces do not need storefront cart/wishlist state.
  if (isAdminRoute) {
    return <AuthProvider>{children}</AuthProvider>;
  }

  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>{children}</CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}

