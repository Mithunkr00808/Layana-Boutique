import Link from "next/link";
import { ArrowLeft, LayoutDashboard, PackageSearch } from "lucide-react";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-[var(--color-surface)]">
      <div className="max-w-2xl space-y-8 text-center">
        <div className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--color-outline)]">
            Admin Route Not Found
          </p>
          <h1 className="font-serif text-5xl tracking-tight text-[var(--color-on-surface)]">
            This view is unavailable
          </h1>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-[var(--color-on-surface-variant)]">
            The page or record you requested no longer exists, or this admin route has not been
            created yet. Your session is still active, and you can safely continue working from
            the catalog or dashboard.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/admin/catalog"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all hover:opacity-90 active:scale-95"
          >
            <PackageSearch className="size-4" />
            Back to Catalog
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-outline-variant)]/25 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-container-low)]"
          >
            <LayoutDashboard className="size-4" />
            Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)] transition-colors hover:text-[var(--color-primary)]"
          >
            <ArrowLeft className="size-4" />
            Return to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
