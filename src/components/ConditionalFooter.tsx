"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function ConditionalFooter({ children, isLive = true }: { children: ReactNode, isLive?: boolean }) {
  const pathname = usePathname();
  
  if (
    pathname?.startsWith("/admin") || 
    pathname === "/login" || 
    pathname === "/signup" ||
    (!isLive && pathname === "/")
  ) {
    return null;
  }
  
  return <>{children}</>;
}
