"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "name-asc", label: "Name: A → Z" },
];

export default function SortSelect({ activeSort }: { activeSort: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const activeLabel = SORT_OPTIONS.find((o) => o.value === activeSort)?.label || "Newest";

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (value: string) => {
    setOpen(false);
    const params = new URLSearchParams();
    if (value && value !== "newest") params.set("sort", value);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 font-sans text-xs uppercase tracking-widest text-zinc-600 hover:text-zinc-900 transition-colors"
      >
        <span className="text-zinc-400">Sort:</span>
        <span className="text-zinc-900 font-medium">{activeLabel}</span>
        <ChevronDown
          size={14}
          strokeWidth={1.5}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 min-w-[180px] bg-white border border-zinc-200 rounded-lg shadow-lg py-1 animate-in fade-in slide-in-from-top-1 duration-150">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`block w-full text-left px-4 py-2.5 font-sans text-xs tracking-wide transition-colors ${
                opt.value === activeSort
                  ? "text-zinc-900 font-semibold bg-zinc-50"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
