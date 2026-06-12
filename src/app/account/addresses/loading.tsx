/**
 * Account addresses page skeleton loader.
 * Mirrors: sidebar + address cards grid.
 */

function S({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export default function AddressesLoading() {
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
            <div className="flex justify-between items-center">
              <S className="h-10 w-48" />
              <S className="h-10 w-36 rounded-sm" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg border border-[var(--color-outline-variant)]/20 p-6 space-y-4">
                  <div className="flex justify-between">
                    <S className="h-5 w-32" />
                    <S className="h-5 w-16 rounded-full" />
                  </div>
                  <S className="h-4 w-full" />
                  <S className="h-4 w-3/4" />
                  <S className="h-4 w-1/2" />
                  <div className="flex gap-3 pt-4 border-t border-[var(--color-outline-variant)]/20">
                    <S className="h-8 w-16" />
                    <S className="h-8 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
