"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function ConditionalFooter({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  if (pathname?.startsWith("/admin") || pathname === "/login" || pathname === "/signup") {
    return null;
  }
  
  return <>{children}</>;
}
