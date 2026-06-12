/**
 * Product page skeleton loader.
 *
 * This is a **server component** (no "use client") so Next.js can stream it
 * instantly during navigation without waiting for JS hydration.
 *
 * The skeleton mirrors the real product page layout (Navbar placeholder,
 * gallery, details, about section) so that:
 *   1. The page occupies full viewport height — the footer is never visible.
 *   2. The user sees a professional shimmer effect while data loads.
 */

function SkeletonBox({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export default function ProductLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-surface)]">
      {/* ── Navbar skeleton ────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-[var(--color-outline-variant)]/20 bg-[var(--color-surface)]">
        <div className="flex items-center justify-between max-w-[1440px] mx-auto px-6 md:px-10 h-16">
          <SkeletonBox className="w-32 h-5 rounded" />
          <div className="hidden md:flex gap-8">
            <SkeletonBox className="w-16 h-3 rounded" />
            <SkeletonBox className="w-16 h-3 rounded" />
            <SkeletonBox className="w-16 h-3 rounded" />
          </div>
          <div className="flex gap-4">
            <SkeletonBox className="w-6 h-6 rounded-full" />
            <SkeletonBox className="w-6 h-6 rounded-full" />
          </div>
        </div>
      </header>

      {/* ── Main content skeleton ──────────────────────────────── */}
      <main className="flex-grow max-w-[1440px] mx-auto px-6 md:px-10 w-full pt-24 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-20">
          {/* Gallery skeleton — left 7 columns */}
          <div className="md:col-span-7">
            <SkeletonBox className="w-full aspect-[3/4] rounded-2xl" />
            {/* Thumbnail strip */}
            <div className="mt-4 flex gap-2">
              <SkeletonBox className="w-16 h-20 md:w-20 md:h-24 rounded-md flex-shrink-0" />
              <SkeletonBox className="w-16 h-20 md:w-20 md:h-24 rounded-md flex-shrink-0" />
              <SkeletonBox className="w-16 h-20 md:w-20 md:h-24 rounded-md flex-shrink-0" />
              <SkeletonBox className="w-16 h-20 md:w-20 md:h-24 rounded-md flex-shrink-0" />
            </div>
          </div>

          {/* Details skeleton — right 5 columns */}
          <div className="md:col-span-5 space-y-12">
            {/* Category + SKU */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <SkeletonBox className="w-20 h-3" />
                <SkeletonBox className="w-24 h-3" />
              </div>
              {/* Product name */}
              <SkeletonBox className="w-3/4 h-10" />
              <SkeletonBox className="w-1/2 h-10" />
              {/* Price */}
              <SkeletonBox className="w-28 h-6" />
            </div>

            {/* Description */}
            <div className="space-y-3">
              <SkeletonBox className="w-full h-3" />
              <SkeletonBox className="w-full h-3" />
              <SkeletonBox className="w-5/6 h-3" />
              <SkeletonBox className="w-2/3 h-3" />
            </div>

            {/* Material & Care accordion */}
            <div className="space-y-3">
              <SkeletonBox className="w-full h-12 rounded-none border-b border-[var(--color-outline-variant)]/20" />
              <SkeletonBox className="w-full h-12 rounded-none border-b border-[var(--color-outline-variant)]/20" />
            </div>

            {/* Size grid */}
            <div className="space-y-4">
              <SkeletonBox className="w-20 h-3" />
              <div className="grid grid-cols-4 gap-3">
                <SkeletonBox className="h-12" />
                <SkeletonBox className="h-12" />
                <SkeletonBox className="h-12" />
                <SkeletonBox className="h-12" />
              </div>
            </div>

            {/* Add to bag + quantity */}
            <div className="flex items-center gap-4">
              <SkeletonBox className="flex-1 h-14 rounded-sm" />
              <SkeletonBox className="w-32 h-14 rounded-sm" />
            </div>

            {/* Shipping text */}
            <SkeletonBox className="w-64 h-3 mx-auto" />
          </div>
        </div>

        {/* ── About section skeleton ──────────────────────────── */}
        <div className="mt-16 rounded-2xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] p-6 md:p-8 space-y-4">
          <SkeletonBox className="w-48 h-7" />
          <SkeletonBox className="w-full h-3" />
          <SkeletonBox className="w-full h-3" />
          <SkeletonBox className="w-3/4 h-3" />
          <div className="mt-6 flex gap-3">
            <SkeletonBox className="w-40 h-9 rounded-full" />
            <SkeletonBox className="w-32 h-9 rounded-full" />
            <SkeletonBox className="w-32 h-9 rounded-full" />
          </div>
        </div>

        {/* ── Related products skeleton ────────────────────────── */}
        <div className="mt-20 space-y-8">
          <SkeletonBox className="w-48 h-7" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <SkeletonBox className="w-full aspect-[3/4] rounded-2xl" />
                <SkeletonBox className="w-3/4 h-4" />
                <SkeletonBox className="w-1/3 h-3" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
