import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full pt-20 pb-10 bg-[var(--color-surface-low)]">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-10 max-w-[1440px] mx-auto">
        <div className="flex flex-col gap-6">
          <Link href="/" className="font-serif text-xl italic text-zinc-900">
            ATELIER
          </Link>
          <p className="font-sans text-xs text-[var(--color-secondary)] leading-relaxed uppercase tracking-widest">
            Curating the future of <br />
            conscious luxury.
          </p>
        </div>
        
        <div className="flex flex-col gap-4">
          <h4 className="font-sans text-xs font-bold tracking-widest uppercase text-zinc-900">
            Collection
          </h4>
          <Link href="/ready-to-wear" className="font-sans text-xs tracking-widest uppercase text-[var(--color-secondary)] hover:text-zinc-900 underline-offset-4 hover:underline transition-all">
            Ready-to-Wear
          </Link>
          <Link href="/ready-to-wear" className="font-sans text-xs tracking-widest uppercase text-[var(--color-secondary)] hover:text-zinc-900 underline-offset-4 hover:underline transition-all">
            New Arrivals
          </Link>
          <Link href="/cart" className="font-sans text-xs tracking-widest uppercase text-[var(--color-secondary)] hover:text-zinc-900 underline-offset-4 hover:underline transition-all">
            Your Bag
          </Link>
        </div>
        
        <div className="flex flex-col gap-4">
          <h4 className="font-sans text-xs font-bold tracking-widest uppercase text-zinc-900">
            Information
          </h4>
          <span className="font-sans text-xs tracking-widest uppercase text-[var(--color-secondary)] opacity-50 cursor-default">
            Sustainability — Coming Soon
          </span>
          <span className="font-sans text-xs tracking-widest uppercase text-[var(--color-secondary)] opacity-50 cursor-default">
            Shipping &amp; Returns — Coming Soon
          </span>
          <span className="font-sans text-xs tracking-widest uppercase text-[var(--color-secondary)] opacity-50 cursor-default">
            Contact — Coming Soon
          </span>
        </div>
        
        <div className="flex flex-col gap-6">
          <h4 className="font-sans text-xs font-bold tracking-widest uppercase text-zinc-900">
            Newsletter
          </h4>
          <div className="relative">
            <input 
              type="email" 
              placeholder="Email Address" 
              className="w-full bg-transparent border-b border-[var(--color-outline-variant)] py-2 text-xs uppercase tracking-widest focus:ring-0 focus:border-zinc-900 transition-colors outline-none"
            />
            <button className="absolute right-0 bottom-2 text-sm text-[var(--color-on-surface)]" aria-label="Subscribe">
              <ChevronRight strokeWidth={1.5} size={18} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-[1440px] mx-auto px-10 mt-20">
        <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-[var(--color-secondary)] text-center">
          © {currentYear} ATELIER NOIR. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
}
