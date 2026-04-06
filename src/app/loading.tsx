export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-surface)]">
      <div className="relative flex flex-col items-center gap-8">
        {/* Animated logo mark */}
        <div className="w-12 h-12 border border-[var(--color-outline-variant)]/40 animate-[spin_3s_linear_infinite]" />
        <span className="font-serif text-xl tracking-tighter text-[var(--color-on-surface)] animate-pulse">
          Layana Boutique
        </span>
      </div>
    </div>
  );
}
