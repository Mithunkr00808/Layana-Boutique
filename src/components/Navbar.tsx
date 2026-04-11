"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Menu, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useCart } from "@/lib/contexts/CartContext";
import { usePathname } from "next/navigation";
import { PRODUCT_CATEGORY_OPTIONS, getCategoryHref } from "@/lib/catalog/categories";
import MiniCart from "./MiniCart";
import CartDrawer from "./CartDrawer";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isCartHovered, setIsCartHovered] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { user } = useAuth();
  const { itemCount } = useCart();
  const pathname = usePathname();
  const currentPath = pathname || "/";

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const isHome = currentPath === "/";
  const useWhiteText = isHome && !scrolled;
  const shadowClass = useWhiteText ? "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" : "";

  return (
    <header className={`fixed top-0 w-full z-50 transform-gpu transition duration-500 ${scrolled || !isHome ? 'glass ambient-shadow' : 'bg-transparent'}`}>
      <nav className="flex justify-between items-center px-4 md:px-10 py-4 max-w-[1440px] mx-auto w-full">
        <div className="flex items-center gap-4 md:gap-14">
          <Link 
            href="/" 
            className={`font-serif text-2xl md:text-3xl font-light tracking-tighter uppercase transition-colors duration-500 shrink-0 ${useWhiteText ? 'text-white' : 'text-zinc-900 hover:opacity-70'} ${shadowClass}`}
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
        <div className="flex items-center gap-4 md:gap-8">
          <Link 
            href="/account/wishlist" 
            className={`transform-gpu transition duration-500 active:scale-90 ${useWhiteText ? 'text-white hover:text-white/70' : 'text-zinc-900 hover:opacity-70'} ${shadowClass}`} 
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
            className={`transform-gpu transition duration-500 active:scale-90 ${useWhiteText ? 'text-white hover:text-white/70' : 'text-zinc-900 hover:opacity-70'} ${shadowClass}`}
            aria-label="Account"
          >
            <UserIcon strokeWidth={1.5} size={20} />
          </Link>
          <div 
            className="relative group hidden md:flex items-center"
            onMouseEnter={() => setIsCartHovered(true)}
            onMouseLeave={() => setIsCartHovered(false)}
          >
            <Link 
              href="/cart" 
              className={`block transform-gpu transition duration-500 active:scale-90 ${useWhiteText ? 'text-white hover:text-white/70' : 'text-zinc-900 hover:opacity-70'}`} 
              aria-label="Shopping Bag"
            >
              <div className="relative">
                <ShoppingBag strokeWidth={1.5} size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-zinc-900 text-white text-[9px] flex items-center justify-center font-bold animate-in fade-in zoom-in duration-300">
                    {itemCount}
                  </span>
                )}
              </div>
            </Link>
            <MiniCart isOpen={isCartHovered && isDesktop} />
          </div>

          {/* Mobile Bag Icon */}
          <button
            onClick={() => setIsCartOpen(true)}
            className={`md:hidden transform-gpu transition duration-500 active:scale-90 ${useWhiteText ? 'text-white hover:text-white/70' : 'text-zinc-900 hover:opacity-70'} ${shadowClass}`}
            aria-label="Shopping Bag Mobile"
          >
            <div className="relative">
              <ShoppingBag strokeWidth={1.5} size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-zinc-900 text-white text-[9px] flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </div>
          </button>

          <button 
            className={`md:hidden transition-colors duration-500 ${useWhiteText ? 'text-white' : 'text-zinc-900'}`} 
            aria-label="Menu"
          >
            <Menu strokeWidth={1.5} size={20} />
          </button>
        </div>
      </nav>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}
