/**
 * Order confirmation page skeleton loader.
 * Mirrors: success header, order summary, items list, delivery info.
 */

function S({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export default function ConfirmationLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
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

      <main className="mx-auto w-full max-w-3xl px-6 pt-28 pb-20 md:px-10">
        {/* Success header */}
        <div className="text-center space-y-6 mb-16">
          <S className="w-16 h-16 rounded-full mx-auto" />
          <S className="h-10 w-72 mx-auto" />
          <S className="h-4 w-96 mx-auto" />
          <S className="h-3 w-48 mx-auto" />
        </div>

        {/* Order details card */}
        <div className="rounded-xl border border-[var(--color-outline-variant)]/20 p-6 md:p-8 space-y-8">
          {/* Order info row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <S className="h-3 w-20" />
                <S className="h-5 w-28" />
              </div>
            ))}
          </div>

          <div className="border-t border-[var(--color-outline-variant)]/20" />

          {/* Items list */}
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-4 py-4 border-b border-[var(--color-outline-variant)]/10">
              <S className="w-20 h-24 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <S className="h-4 w-3/4" />
                <S className="h-3 w-1/3" />
                <S className="h-3 w-1/4" />
              </div>
              <S className="h-5 w-20" />
            </div>
          ))}

          {/* Totals */}
          <div className="space-y-3 pt-4">
            <div className="flex justify-between">
              <S className="h-3 w-20" />
              <S className="h-3 w-16" />
            </div>
            <div className="flex justify-between">
              <S className="h-3 w-20" />
              <S className="h-3 w-16" />
            </div>
            <div className="flex justify-between pt-4 border-t border-[var(--color-outline-variant)]/20">
              <S className="h-5 w-16" />
              <S className="h-5 w-24" />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <S className="h-12 w-48 rounded-sm" />
          <S className="h-12 w-48 rounded-sm" />
        </div>
      </main>
    </div>
  );
}
