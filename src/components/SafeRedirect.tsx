"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SafeRedirect({ to }: { to: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(to);
  }, [router, to]);

  // Show a blank/transparent loading state while the client router kicks in
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)]">
      <div className="w-8 h-8 rounded-full border-2 border-transparent border-t-[var(--color-primary)] animate-spin" />
    </div>
  );
}
