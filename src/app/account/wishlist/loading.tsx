/**
 * Account wishlist page skeleton loader.
 * Mirrors: sidebar + wishlist product grid.
 */

function S({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export default function WishlistLoading() {
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
            <S className="h-10 w-56" />
            <S className="h-4 w-80" />

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <S className="aspect-[3/4] w-full rounded" />
                  <S className="h-4 w-3/4" />
                  <S className="h-3 w-1/3" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
