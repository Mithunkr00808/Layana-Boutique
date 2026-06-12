/**
 * Account page skeleton loader.
 * Mirrors: navbar, sidebar, welcome header, latest order card, wishlist grid,
 * and quick-link cards.
 */

function S({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export default function AccountLoading() {
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

      <main className="pt-28 pb-20 px-6 md:px-10 max-w-screen-2xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
          {/* Sidebar skeleton */}
          <div className="hidden md:block md:col-span-3 lg:col-span-2 space-y-6">
            <S className="w-full h-4" />
            <S className="w-3/4 h-4" />
            <S className="w-2/3 h-4" />
            <S className="w-3/4 h-4" />
            <S className="w-1/2 h-4" />
            <div className="mt-8 pt-6 border-t border-[var(--color-outline-variant)]/20">
              <S className="w-full h-3" />
            </div>
          </div>

          {/* Main content */}
          <div className="md:col-span-9 lg:col-span-10 space-y-16">
            {/* Welcome header */}
            <section className="max-w-3xl space-y-4">
              <S className="h-14 w-full max-w-lg" />
              <S className="h-5 w-80" />
              <S className="h-3 w-48" />
            </section>

            {/* Latest order card */}
            <section>
              <div className="bg-[var(--color-surface-container-low)] rounded-lg p-8 border border-[var(--color-outline-variant)]/20 min-h-[380px] space-y-8">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <S className="h-7 w-36" />
                    <S className="h-4 w-48" />
                  </div>
                  <S className="h-6 w-20 rounded-full" />
                </div>
                <div className="flex gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex-shrink-0 w-32 space-y-3">
                      <S className="aspect-[3/4] w-full rounded" />
                      <S className="h-3 w-full" />
                      <S className="h-3 w-1/2" />
                    </div>
                  ))}
                </div>
                <div className="border-t border-[var(--color-outline-variant)]/20 pt-6 flex justify-between items-center">
                  <S className="h-4 w-40" />
                  <S className="h-4 w-24" />
                </div>
              </div>
            </section>

            {/* Saved for later */}
            <section className="space-y-10">
              <div className="flex justify-between items-end">
                <S className="h-8 w-48" />
                <S className="h-3 w-16" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-4">
                    <S className="aspect-[3/4] w-full rounded" />
                    <S className="h-4 w-3/4" />
                    <S className="h-3 w-1/3" />
                  </div>
                ))}
              </div>
            </section>

            {/* Quick links */}
            <section className="border-t border-[var(--color-outline-variant)]/20 pt-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-6 items-start">
                    <S className="w-12 h-12 rounded-full shrink-0" />
                    <div className="space-y-3 flex-1">
                      <S className="h-5 w-48" />
                      <S className="h-3 w-full" />
                      <S className="h-3 w-28" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
