/**
 * Account orders page skeleton loader.
 * Mirrors: sidebar + order list with item thumbnails.
 */

function S({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export default function OrdersLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-surface)]">
      {/* Navbar skeleton */}
      <header className="sticky top-0 z-50 w-full border-b border-[var(--color-outline-variant)]/20 bg-[var(--color-surface)]">
        <div className="flex items-center justify-between max-w-[1440px] mx-auto px-6 md:px-10 h-16">
          <S className="w-32 h-5 rounded" />
          <div className="flex gap-4">
            <S className="w-6 h-6 rounded-full" />
            <S className="w-6 h-6 rounded-full" />
          </div>
        </div>
      </header>

      <main className="pt-28 pb-20 px-6 md:px-10 max-w-screen-2xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
          {/* Sidebar */}
          <div className="hidden md:block md:col-span-3 lg:col-span-2 space-y-6">
            <S className="w-full h-4" />
            <S className="w-3/4 h-4" />
            <S className="w-2/3 h-4" />
            <S className="w-3/4 h-4" />
          </div>

          {/* Main content */}
          <div className="md:col-span-9 lg:col-span-10 space-y-10">
            <S className="h-10 w-48" />
            <S className="h-4 w-64" />

            {/* Order cards */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border border-[var(--color-outline-variant)]/20 p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <S className="h-5 w-32" />
                    <S className="h-3 w-48" />
                  </div>
                  <S className="h-6 w-20 rounded-full" />
                </div>
                <div className="flex gap-4">
                  {[1, 2].map((j) => (
                    <div key={j} className="flex-shrink-0 w-20 space-y-2">
                      <S className="aspect-[3/4] w-full rounded" />
                      <S className="h-3 w-full" />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between border-t border-[var(--color-outline-variant)]/20 pt-4">
                  <S className="h-4 w-32" />
                  <S className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
