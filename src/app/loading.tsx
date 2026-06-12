/**
 * Root loading skeleton.
 * Used as the fallback during top-level route transitions (e.g. home page).
 * Mirrors: navbar + hero area + product grid hint.
 */

function S({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export default function Loading() {
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

      <main className="flex-grow">
        {/* Hero skeleton */}
        <div className="max-w-[1440px] mx-auto px-10 py-20">
          <S className="w-full h-[60vh] rounded-2xl" />
        </div>

        {/* Products section hint */}
        <div className="max-w-[1440px] mx-auto px-10 py-16 space-y-12">
          <div className="flex justify-between items-baseline">
            <S className="h-8 w-48" />
            <S className="h-3 w-28" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <S className="aspect-[3/4] w-full rounded-[20px]" />
                <S className="h-3 w-20" />
                <S className="h-5 w-3/4" />
                <S className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
