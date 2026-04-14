export default function AccountLoading() {
  return (
    <div className="min-h-screen animate-pulse bg-[var(--color-surface,#fbf9f8)] px-6 pt-28 md:px-10">
      <div className="mx-auto w-full max-w-screen-2xl space-y-8">
        <div className="h-5 w-28 rounded bg-zinc-200/70" />
        <div className="h-14 w-80 rounded bg-zinc-200/70" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-72 rounded-xl bg-zinc-200/60 lg:col-span-2" />
          <div className="h-72 rounded-xl bg-zinc-200/60" />
        </div>
        <div className="h-72 rounded-xl bg-zinc-200/60" />
      </div>
    </div>
  );
}
