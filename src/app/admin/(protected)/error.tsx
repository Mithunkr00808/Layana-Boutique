"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, ShieldAlert } from "lucide-react";

type AdminErrorProps = {
  error: Error & { digest?: string };
  unstable_retry?: () => void;
  reset?: () => void;
};

export default function AdminError({
  error,
  unstable_retry,
  reset,
}: AdminErrorProps) {
  useEffect(() => {
    console.error("Admin route error:", error);
  }, [error]);

  const retry = unstable_retry ?? reset;

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-[var(--color-surface)]">
      <div className="max-w-2xl space-y-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-error-container)] text-[var(--color-error)]">
          <ShieldAlert className="size-6" />
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--color-outline)]">
            Admin Recovery
          </p>
          <h1 className="font-serif text-5xl tracking-tight text-[var(--color-on-surface)]">
            This page hit an interruption
          </h1>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-[var(--color-on-surface-variant)]">
            We kept the failure inside the admin workspace so the rest of your session remains
            intact. You can retry this view or continue from the catalog while we recover.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => retry?.()}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all hover:opacity-90 active:scale-95"
          >
            <RotateCcw className="size-4" />
            Retry Page
          </button>
          <Link
            href="/admin/catalog"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-outline-variant)]/25 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-container-low)]"
          >
            Back to Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
