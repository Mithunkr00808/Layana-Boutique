/**
 * Cart page skeleton loader.
 * Mirrors: navbar, editorial header, cart item rows (3), summary sidebar.
 */

function S({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export default function CartLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-surface)]">
      {/* Navbar skeleton */}
      <header className="sticky top-0 z-50 w-full border-b border-[var(--color-outline-variant)]/20 bg-[var(--color-surface)]">
        <div className="flex items-center justify-between max-w-[1440px] mx-auto px-6 md:px-10 h-16">
          <S className="w-32 h-5 rounded" />
          <div className="hidden md:flex gap-8">
            <S className="w-16 h-3 rounded" />
            <S className="w-16 h-3 rounded" />
            <S className="w-16 h-3 rounded" />
          </div>
          <div className="flex gap-4">
            <S className="w-6 h-6 rounded-full" />
            <S className="w-6 h-6 rounded-full" />
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-[1440px] mx-auto px-10 w-full pt-16 mt-20 min-h-[calc(100vh-400px)]">
        {/* Editorial Header */}
        <header className="mb-20 space-y-4">
          <S className="h-12 w-64" />
          <S className="h-4 w-96" />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            {/* Table Header */}
            <div className="grid grid-cols-6 pb-6 border-b border-[var(--color-outline-variant)]/20">
              <S className="col-span-3 h-3 w-20" />
              <S className="h-3 w-12 mx-auto" />
              <S className="h-3 w-20 mx-auto" />
              <S className="h-3 w-16 ml-auto" />
            </div>

            {/* Cart item rows */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="grid grid-cols-6 items-center py-10 border-b border-[var(--color-outline-variant)]/10">
                <div className="col-span-3 flex items-center gap-8">
                  <S className="w-24 h-32 rounded-[20px] shrink-0" />
                  <div className="space-y-3 flex-1">
                    <S className="h-5 w-3/4" />
                    <S className="h-3 w-1/4" />
                    <S className="h-3 w-16 mt-4" />
                  </div>
                </div>
                <S className="h-4 w-8 mx-auto" />
                <S className="h-8 w-24 rounded-full mx-auto" />
                <S className="h-5 w-20 ml-auto" />
              </div>
            ))}

            {/* Shipping notice */}
            <div className="mt-12 p-8 bg-[var(--color-surface-container-low)] rounded-xl flex items-start gap-4">
              <S className="size-6 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <S className="h-4 w-1/3" />
                <S className="h-3 w-2/3" />
              </div>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-4 sticky top-32 h-fit">
            <div className="bg-[var(--color-surface-container-low)] p-10 rounded-[32px] space-y-8">
              <S className="h-8 w-40" />
              <div className="space-y-4">
                <div className="flex justify-between">
                  <S className="h-4 w-20" />
                  <S className="h-4 w-24" />
                </div>
                <div className="flex justify-between">
                  <S className="h-4 w-20" />
                  <S className="h-4 w-24" />
                </div>
              </div>
              <div className="pt-6 border-t border-[var(--color-outline-variant)]/20 flex justify-between items-center">
                <S className="h-6 w-16" />
                <S className="h-8 w-32" />
              </div>
              <S className="h-14 w-full rounded-full" />
              <div className="flex items-center justify-center gap-4 py-4">
                <S className="h-8 w-12 rounded" />
                <S className="h-8 w-12 rounded" />
                <S className="h-8 w-12 rounded" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
