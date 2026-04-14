export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-surface,#fbf9f8)]">
      <main className="mx-auto w-full max-w-[1440px] px-6 pt-28 pb-20 md:px-10">
        <div className="mb-12 space-y-4">
          <div className="h-3 w-32 animate-pulse rounded bg-zinc-200" />
          <div className="h-12 w-64 animate-pulse rounded bg-zinc-200" />
          <div className="h-4 w-80 animate-pulse rounded bg-zinc-100" />
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <section className="space-y-6 lg:col-span-2">
            <div className="h-10 w-48 animate-pulse rounded bg-zinc-200" />
            <div className="space-y-4">
              <div className="h-24 w-full animate-pulse rounded-xl bg-zinc-100" />
              <div className="h-24 w-full animate-pulse rounded-xl bg-zinc-100" />
            </div>
            <div className="h-10 w-52 animate-pulse rounded bg-zinc-200" />
            <div className="h-72 w-full animate-pulse rounded-xl bg-zinc-100" />
          </section>

          <aside className="space-y-4">
            <div className="h-10 w-32 animate-pulse rounded bg-zinc-200" />
            <div className="h-80 w-full animate-pulse rounded-xl bg-zinc-100" />
          </aside>
        </div>
      </main>
    </div>
  );
}
