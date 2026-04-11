"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/contexts/WishlistContext";
import { WishlistItem } from "@/app/account/actions";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  item: WishlistItem;
  className?: string;
  size?: number;
}

export default function WishlistButton({ item, className, size = 18 }: WishlistButtonProps) {
  const { isWishlisted, toggle, isPending } = useWishlist();
  const active = isWishlisted(item.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(item);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "group p-2.5 rounded-full bg-white/60 backdrop-blur-md transition-all duration-300",
        "hover:bg-white hover:scale-110 active:scale-95 shadow-sm hover:shadow-md",
        className
      )}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        size={size}
        strokeWidth={1.5}
        className={cn(
          "transition-all duration-300",
          active 
            ? "fill-[var(--color-primary)] stroke-[var(--color-primary)]" 
            : "stroke-zinc-600 group-hover:stroke-[var(--color-primary)]"
        )}
      />
    </button>
  );
}
