"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Menu } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass ambient-shadow' : 'bg-transparent'}`}>
      <nav className="flex justify-between items-center px-6 md:px-10 py-4 max-w-[1440px] mx-auto w-full">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-serif text-2xl font-light tracking-tighter text-zinc-900">
            ATELIER
          </Link>
          <div className="hidden md:flex gap-6 items-center">
            <Link href="/ready-to-wear" className="font-sans tracking-tight text-sm uppercase text-zinc-900 font-semibold border-b border-zinc-900 pb-1">
              Ready-to-Wear
            </Link>
            <Link href="/ready-to-wear" className="font-sans tracking-tight text-sm uppercase text-zinc-500 hover:text-zinc-900 transition-colors">
              New Arrivals
            </Link>
            <Link href="/cart" className="font-sans tracking-tight text-sm uppercase text-zinc-500 hover:text-zinc-900 transition-colors">
              Your Bag
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button className="text-zinc-900 hover:opacity-70 transition-opacity active:scale-95" aria-label="Favorites">
            <Heart strokeWidth={1.5} size={24} />
          </button>
          <Link href="/cart" className="text-zinc-900 hover:opacity-70 transition-opacity active:scale-95" aria-label="Shopping Bag">
            <ShoppingBag strokeWidth={1.5} size={24} />
          </Link>
          <button className="md:hidden text-zinc-900" aria-label="Menu">
            <Menu strokeWidth={1.5} size={24} />
          </button>
        </div>
      </nav>
    </header>
  );
}
