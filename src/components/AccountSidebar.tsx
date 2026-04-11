"use client";

import Link from "next/link";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  User as UserIcon,
  Receipt,
  MapPin,
  Heart,
  CreditCard,
  LogOut,
  Settings,
} from "lucide-react";

type ActiveItem =
  | "profile"
  | "orders"
  | "addresses"
  | "wishlist"
  | "payments"
  | "preferences";

interface Props {
  active: ActiveItem;
  email?: string;
}

const baseLink =
  "flex items-center gap-3 uppercase tracking-[0.2em] text-xs transition-colors";

export default function AccountSidebar({ active, email }: Props) {
  const { logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const linkClass = (key: ActiveItem) =>
    [
      baseLink,
      active === key
        ? "text-[var(--color-primary,#003b93)] font-semibold"
        : "text-[var(--color-on-surface-variant,#434653)] hover:text-[var(--color-on-surface,#1b1c1c)]",
    ].join(" ");

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      window.location.href = "/";
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="w-full md:w-64 flex-shrink-0">
      <div className="space-y-8 sticky top-40">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-outline,#737785)] mb-6">
            Account Overview
          </p>
          <ul className="space-y-4">
            <li>
              <Link href="/account" className={linkClass("profile")}>
                <UserIcon size={16} strokeWidth={1.5} /> Profile
              </Link>
            </li>
            <li>
              <Link href="/account/orders" className={linkClass("orders")}>
                <Receipt size={16} strokeWidth={1.5} /> Orders
              </Link>
            </li>
            <li>
              <Link href="/account/addresses" className={linkClass("addresses")}>
                <MapPin size={16} strokeWidth={1.5} /> Addresses
              </Link>
            </li>
            <li>
              <Link href="/account/preferences" className={linkClass("preferences")}>
                <Settings size={16} strokeWidth={1.5} /> Preferences
              </Link>
            </li>
            <li>
              <div className={linkClass("payments") + " cursor-not-allowed"}>
                <CreditCard size={16} strokeWidth={1.5} /> Payment
              </div>
            </li>
          </ul>
        </div>

        <div className="pt-8 border-t border-[var(--color-outline-variant,#c3c6d6)]/20">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-outline,#737785)] mb-6">
            Preference
          </p>
          <ul className="space-y-4">
            <li>
              <Link href="/account/wishlist" className={linkClass("wishlist")}>
                <Heart size={16} strokeWidth={1.5} /> Saved Items
              </Link>
            </li>
            <li className={baseLink + " text-[var(--color-on-surface-variant,#434653)]"}>
              {/* Placeholder for sustainability */}
              <span className="text-[10px]">Sustainability</span>
            </li>
          </ul>
        </div>

        <div className="pt-4">
          <button
            onClick={handleLogout}
            disabled={loading}
            className="text-[var(--color-error,#ba1a1a)] text-sm font-medium hover:opacity-70 transition-opacity inline-flex items-center gap-2 disabled:opacity-50"
          >
            <LogOut size={16} strokeWidth={1.5} /> Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
