export default function CollectionLoading() {
  return (
    <div className="min-h-screen animate-pulse bg-[var(--color-surface)] px-10 pt-20">
      <div className="mx-auto max-w-[1440px] space-y-10">
        <div className="h-14 w-80 rounded bg-zinc-200/70" />
        <div className="h-5 w-[36rem] rounded bg-zinc-200/60" />
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="space-y-4">
              <div className="aspect-[3/4] rounded-2xl bg-zinc-200/60" />
              <div className="h-4 w-3/4 rounded bg-zinc-200/70" />
              <div className="h-3 w-1/2 rounded bg-zinc-200/60" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
