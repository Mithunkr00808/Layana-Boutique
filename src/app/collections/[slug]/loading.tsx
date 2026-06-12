/**
 * Collections page skeleton loader.
 * Mirrors the collection page layout: navbar, header, filter bar, product grid.
 */

function S({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export default function CollectionLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-surface)] font-sans text-[var(--color-on-surface)]">
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

      <main className="mx-auto max-w-[1440px] px-10 pt-20">
        {/* Collection header */}
        <header className="max-w-4xl py-20 md:py-32 space-y-6">
          <S className="h-14 w-80 md:w-[28rem]" />
          <S className="h-5 w-full max-w-2xl" />
          <S className="h-5 w-3/4 max-w-xl" />
        </header>

        {/* Filter bar */}
        <section className="mb-12 flex flex-col items-start justify-between gap-6 py-8 md:flex-row md:items-center border-b border-[var(--color-outline-variant)]/20">
          <div className="flex items-center gap-10">
            <S className="w-16 h-4" />
            <div className="hidden md:flex gap-8">
              <S className="w-20 h-3" />
              <S className="w-20 h-3" />
              <S className="w-20 h-3" />
            </div>
          </div>
          <S className="w-28 h-4" />
        </section>

        {/* Product grid */}
        <section className="mb-40 grid grid-cols-1 gap-x-6 gap-y-20 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="space-y-4">
              <S className="aspect-[3/4] w-full rounded-2xl" />
              <div className="flex items-start justify-between gap-3">
                <S className="h-5 w-3/4" />
                <S className="h-4 w-16" />
              </div>
              <S className="h-3 w-1/3" />
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
