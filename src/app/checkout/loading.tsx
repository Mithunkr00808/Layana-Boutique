/**
 * Checkout page skeleton loader.
 * Mirrors: navbar, breadcrumb, header, address/payment forms, order summary.
 */

function S({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      {/* Navbar skeleton */}
      <header className="sticky top-0 z-50 w-full border-b border-[var(--color-outline-variant)]/20 bg-[var(--color-surface)]">
        <div className="flex items-center justify-between max-w-[1440px] mx-auto px-6 md:px-10 h-16">
          <S className="w-32 h-5 rounded" />
          <div className="hidden md:flex gap-8">
            <S className="w-16 h-3 rounded" />
            <S className="w-16 h-3 rounded" />
          </div>
          <div className="flex gap-4">
            <S className="w-6 h-6 rounded-full" />
            <S className="w-6 h-6 rounded-full" />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] px-6 pt-28 pb-20 md:px-10">
        {/* Breadcrumb + header */}
        <div className="mb-12 space-y-4">
          <S className="h-3 w-32" />
          <S className="h-12 w-64" />
          <S className="h-4 w-80" />
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Left column — forms */}
          <section className="space-y-8 lg:col-span-2">
            {/* Shipping address section */}
            <S className="h-8 w-48" />
            <div className="space-y-4 rounded-xl border border-[var(--color-outline-variant)]/20 p-6">
              <div className="grid grid-cols-2 gap-4">
                <S className="h-12 w-full rounded-lg" />
                <S className="h-12 w-full rounded-lg" />
              </div>
              <S className="h-12 w-full rounded-lg" />
              <S className="h-12 w-full rounded-lg" />
              <div className="grid grid-cols-3 gap-4">
                <S className="h-12 w-full rounded-lg" />
                <S className="h-12 w-full rounded-lg" />
                <S className="h-12 w-full rounded-lg" />
              </div>
              <S className="h-12 w-full rounded-lg" />
            </div>

            {/* Payment section */}
            <S className="h-8 w-52" />
            <div className="space-y-4 rounded-xl border border-[var(--color-outline-variant)]/20 p-6">
              <S className="h-14 w-full rounded-lg" />
              <S className="h-14 w-full rounded-lg" />
            </div>

            {/* Place order button */}
            <S className="h-14 w-full rounded-sm" />
          </section>

          {/* Right column — order summary */}
          <aside className="space-y-6">
            <S className="h-8 w-32" />
            <div className="rounded-xl border border-[var(--color-outline-variant)]/20 p-6 space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-4">
                  <S className="w-16 h-20 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <S className="h-4 w-3/4" />
                    <S className="h-3 w-1/2" />
                    <S className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
              <div className="border-t border-[var(--color-outline-variant)]/20 pt-4 space-y-3">
                <div className="flex justify-between">
                  <S className="h-3 w-20" />
                  <S className="h-3 w-16" />
                </div>
                <div className="flex justify-between">
                  <S className="h-3 w-20" />
                  <S className="h-3 w-16" />
                </div>
                <div className="flex justify-between pt-3 border-t border-[var(--color-outline-variant)]/20">
                  <S className="h-5 w-16" />
                  <S className="h-5 w-24" />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
