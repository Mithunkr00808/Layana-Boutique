'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Package, Users, Activity, LogOut, Settings, Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const router = useRouter();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/admin/catalog', label: 'Inventory', icon: Package },
    { href: '/admin/customers', label: 'Customers', icon: Users },
    { href: '/admin/analytics', label: 'Analytics', icon: Activity },
    { href: '/admin/settings', label: 'Store Settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    router.replace('/admin/login');
  };

  const closeMobileNav = () => setIsMobileNavOpen(false);

  const navContent = (
    <>
      <div className="font-serif text-2xl font-bold text-[#1b1c1c] mb-8">
        Layana Boutique
        <p className="font-sans font-medium tracking-wide uppercase text-[10px] text-gray-500 mt-1 opacity-70">
          Management Suite
        </p>
      </div>
      <nav className="flex-grow space-y-2 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              onClick={closeMobileNav}
              className={`flex items-center gap-4 px-4 py-3 transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                isActive
                  ? 'bg-[#f6f3f2] text-[#0051C3] border-r-2 border-[#0051C3]'
                  : 'text-[#434653] opacity-70 hover:bg-[#eae8e7]'
              }`}
            >
              <Icon size={18} />
              <span className="font-sans font-medium tracking-wide uppercase text-xs">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col gap-2">
        <button
          onClick={() => {
            closeMobileNav();
            router.push('/admin/catalog/new');
          }}
          className="w-full bg-black text-white py-4 px-2 text-[10px] font-bold tracking-widest uppercase hover:opacity-90 transition-opacity"
        >
          Create New Product
        </button>
        <button
          onClick={handleLogout}
          className="w-full border border-black py-2 px-2 text-[10px] font-bold tracking-widest uppercase hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-[#fbf9f8] border-b border-[#c3c6d6]/20 px-4 flex items-center justify-between">
        <div>
          <p className="font-serif text-xl font-bold text-[#1b1c1c] leading-none">Layana Boutique</p>
          <p className="font-sans uppercase tracking-wider text-[9px] text-gray-500 mt-1">Management Suite</p>
        </div>
        <button
          onClick={() => setIsMobileNavOpen((open) => !open)}
          className="h-10 w-10 rounded-md border border-[#c3c6d6]/30 flex items-center justify-center text-[#1b1c1c]"
          aria-label={isMobileNavOpen ? "Close admin menu" : "Open admin menu"}
        >
          {isMobileNavOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {isMobileNavOpen && (
        <button
          type="button"
          className="md:hidden fixed inset-0 z-40 bg-black/35"
          onClick={closeMobileNav}
          aria-label="Close admin navigation overlay"
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-[84vw] max-w-xs bg-[#fbf9f8] border-r border-[#c3c6d6]/15 flex flex-col py-8 px-5 z-50 transform transition-transform duration-300 md:w-64 md:translate-x-0 ${
          isMobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {navContent}
      </aside>
    </>
  );
}
