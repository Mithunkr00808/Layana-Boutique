import React from "react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="border-b border-gray-200 bg-white px-8 py-4 sticky top-0 z-50">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <Link href="/admin/catalog" className="font-serif text-2xl text-gray-900 tracking-tight">
            Layana Backend
          </Link>
          <nav className="flex gap-6 font-sans text-xs tracking-widest uppercase text-gray-500 font-semibold">
            <Link href="/admin/catalog" className="hover:text-black transition-colors">Catalog</Link>
            <Link href="/admin/orders" className="hover:text-black transition-colors">Orders</Link>
            <Link href="/" className="hover:text-black transition-colors" target="_blank">Storefront</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-8 py-10 w-full flex-grow">
        {children}
      </main>
    </div>
  );
}
