/**
 * Account preferences page skeleton loader.
 * Mirrors: sidebar + settings form sections.
 */

function S({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export default function PreferencesLoading() {
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
          <div className="md:col-span-9 lg:col-span-10 space-y-12">
            <div className="space-y-4">
              <S className="h-10 w-56" />
              <S className="h-4 w-80" />
            </div>

            {/* Profile section */}
            <div className="rounded-lg border border-[var(--color-outline-variant)]/20 p-6 md:p-8 space-y-6">
              <S className="h-6 w-32" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <S className="h-3 w-20" />
                  <S className="h-12 w-full rounded-lg" />
                </div>
                <div className="space-y-2">
                  <S className="h-3 w-20" />
                  <S className="h-12 w-full rounded-lg" />
                </div>
              </div>
              <div className="space-y-2">
                <S className="h-3 w-20" />
                <S className="h-12 w-full rounded-lg" />
              </div>
              <S className="h-10 w-32 rounded-sm" />
            </div>

            {/* Password section */}
            <div className="rounded-lg border border-[var(--color-outline-variant)]/20 p-6 md:p-8 space-y-6">
              <S className="h-6 w-40" />
              <div className="space-y-4">
                <div className="space-y-2">
                  <S className="h-3 w-28" />
                  <S className="h-12 w-full rounded-lg" />
                </div>
                <div className="space-y-2">
                  <S className="h-3 w-28" />
                  <S className="h-12 w-full rounded-lg" />
                </div>
              </div>
              <S className="h-10 w-40 rounded-sm" />
            </div>

            {/* Notifications section */}
            <div className="rounded-lg border border-[var(--color-outline-variant)]/20 p-6 md:p-8 space-y-6">
              <S className="h-6 w-36" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-[var(--color-outline-variant)]/10">
                    <div className="space-y-1">
                      <S className="h-4 w-40" />
                      <S className="h-3 w-64" />
                    </div>
                    <S className="h-6 w-12 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
