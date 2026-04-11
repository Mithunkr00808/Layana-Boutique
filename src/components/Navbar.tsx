"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Menu, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { PRODUCT_CATEGORY_OPTIONS, getCategoryHref } from "@/lib/catalog/categories";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();
  const currentPath = pathname || "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHome = currentPath === "/";
  const useWhiteText = isHome && !scrolled;

  return (
    <header className={`fixed top-0 w-full z-50 transform-gpu transition duration-500 ${scrolled || !isHome ? 'glass ambient-shadow' : 'bg-transparent'}`}>
      <nav className="flex justify-between items-center px-6 md:px-10 py-4 max-w-[1440px] mx-auto w-full">
        <div className="flex items-center gap-14">
          <Link 
            href="/" 
            className={`font-serif text-3xl font-light tracking-tighter uppercase transition-colors duration-500 ${useWhiteText ? 'text-white' : 'text-zinc-900 hover:opacity-70'}`}
          >
            Layana Boutique
          </Link>
          <div className="hidden md:flex gap-10 items-center">
            {PRODUCT_CATEGORY_OPTIONS.map((category) => (
              <Link
                key={category.value}
                href={getCategoryHref(category.value)}
                className={`font-sans tracking-[0.2em] text-xs uppercase font-semibold antialiased transition-all duration-300 ease-out hover:scale-110 inline-block ${useWhiteText ? 'text-white/80 hover:text-white' : 'text-zinc-700 hover:text-zinc-900'}`}
              >
                {category.label}
              </Link>
            ))}

          </div>
        </div>
        <div className="flex items-center gap-8">
          <Link 
            href="/account/wishlist" 
            className={`transform-gpu transition duration-500 active:scale-90 ${useWhiteText ? 'text-white hover:text-white/70' : 'text-zinc-900 hover:opacity-70'}`} 
            aria-label="Favorites"
          >
            <Heart strokeWidth={1.5} size={20} />
          </Link>
          <Link
            href={
              user
                ? "/account"
                : `/login?returnUrl=${encodeURIComponent(currentPath)}`
            }
            className={`transform-gpu transition duration-500 active:scale-90 ${useWhiteText ? 'text-white hover:text-white/70' : 'text-zinc-900 hover:opacity-70'}`}
            aria-label="Account"
          >
            <UserIcon strokeWidth={1.5} size={20} />
          </Link>
          <Link 
            href="/cart" 
            className={`transform-gpu transition duration-500 active:scale-90 ${useWhiteText ? 'text-white hover:text-white/70' : 'text-zinc-900 hover:opacity-70'}`} 
            aria-label="Shopping Bag"
          >
            <ShoppingBag strokeWidth={1.5} size={20} />
          </Link>
          <button 
            className={`md:hidden transition-colors duration-500 ${useWhiteText ? 'text-white' : 'text-zinc-900'}`} 
            aria-label="Menu"
          >
            <Menu strokeWidth={1.5} size={20} />
          </button>
        </div>
      </nav>
    </header>
  );
}
