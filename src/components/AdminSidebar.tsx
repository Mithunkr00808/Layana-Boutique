'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Package, Users, Activity, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const router = useRouter();

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

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-[#fbf9f8] border-r border-[#c3c6d6]/15 flex flex-col py-10 px-6 z-50">
      <div className="font-serif text-2xl font-bold text-[#1b1c1c] mb-8">
        Layana Boutique
        <p className="font-sans font-medium tracking-wide uppercase text-[10px] text-gray-500 mt-1 opacity-70">
          Management Suite
        </p>
      </div>
      <nav className="flex-grow space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.href}
              href={item.href}
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
          onClick={() => router.push('/admin/catalog/new')}
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
    </aside>
  );
}
