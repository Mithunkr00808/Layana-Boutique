"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SiteAccessControl({
  isLive,
  children,
}: {
  isLive: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const isRestrictedPath =
    !pathname?.startsWith("/admin") &&
    !pathname?.startsWith("/api") &&
    pathname !== "/";

  useEffect(() => {
    if (!isLive && isRestrictedPath) {
      router.replace("/");
    }
  }, [isLive, isRestrictedPath, router]);

  // To prevent hydration mismatch, only render block after mount if needed.
  if (!isLive && isRestrictedPath && mounted) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <div className="flex gap-4 justify-center">
          <span className="h-2 w-2 rounded-full bg-[var(--color-primary)] opacity-30 animate-pulse"></span>
          <span
            className="h-2 w-2 rounded-full bg-[var(--color-primary)] opacity-30 animate-pulse"
            style={{ animationDelay: "0.2s" }}
          ></span>
          <span
            className="h-2 w-2 rounded-full bg-[var(--color-primary)] opacity-30 animate-pulse"
            style={{ animationDelay: "0.4s" }}
          ></span>
        </div>
      </div>
    );
  }

  // Before hydration, we return children. But the UI flash is minimal since useEffect will redirect.
  // We avoid returning null initially to prevent hydration errors for layouts.
  return <>{children}</>;
}
