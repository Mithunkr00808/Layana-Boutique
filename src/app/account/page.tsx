"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, MapPin, Heart, Package, User as UserIcon } from "lucide-react";
import { useEffect } from "react";

export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse flex space-x-2">
          <div className="w-2 h-2 bg-zinc-400 rounded-full"></div>
          <div className="w-2 h-2 bg-zinc-400 rounded-full"></div>
          <div className="w-2 h-2 bg-zinc-400 rounded-full"></div>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-24 min-h-[80vh]">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="font-serif text-4xl tracking-tight text-zinc-900 mb-2">My Account</h1>
          <p className="text-zinc-500">Welcome back, {user?.displayName || user?.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/account/orders" className="group p-6 border border-zinc-200 rounded-xl hover:border-zinc-900 transition-colors bg-white shadow-sm">
            <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center mb-4 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
              <Package size={24} strokeWidth={1.5} />
            </div>
            <h3 className="font-semibold text-lg mb-1">Orders</h3>
            <p className="text-zinc-500 text-sm">Track, return, or buy items again</p>
          </Link>

          <Link href="/account/addresses" className="group p-6 border border-zinc-200 rounded-xl hover:border-zinc-900 transition-colors bg-white shadow-sm">
            <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center mb-4 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
              <MapPin size={24} strokeWidth={1.5} />
            </div>
            <h3 className="font-semibold text-lg mb-1">Addresses</h3>
            <p className="text-zinc-500 text-sm">Edit delivery and billing addresses</p>
          </Link>

          <Link href="/account/wishlist" className="group p-6 border border-zinc-200 rounded-xl hover:border-zinc-900 transition-colors bg-white shadow-sm">
            <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center mb-4 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
              <Heart size={24} strokeWidth={1.5} />
            </div>
            <h3 className="font-semibold text-lg mb-1">Wishlist</h3>
            <p className="text-zinc-500 text-sm">View your favorite curated pieces</p>
          </Link>

          <div className="group p-6 border border-zinc-200 rounded-xl hover:border-zinc-900 transition-colors bg-white shadow-sm cursor-pointer" onClick={handleLogout}>
            <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center mb-4 group-hover:bg-red-600 group-hover:text-white transition-colors text-zinc-900">
              <LogOut size={24} strokeWidth={1.5} />
            </div>
            <h3 className="font-semibold text-lg mb-1 text-red-600">Sign Out</h3>
            <p className="text-zinc-500 text-sm">Securely log out of your account</p>
          </div>
        </div>
      </div>
    </div>
  );
}
