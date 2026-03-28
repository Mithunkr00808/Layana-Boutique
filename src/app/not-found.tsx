import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-surface)] px-10">
      <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-[var(--color-secondary)] mb-6">
        Page Not Found
      </span>
      <h1 className="font-serif text-7xl md:text-9xl font-light tracking-tighter text-[var(--color-on-surface)] mb-4">
        404
      </h1>
      <p className="font-sans text-sm text-[var(--color-secondary)] mb-12 max-w-md text-center leading-relaxed">
        The page you are looking for has been moved, is no longer available, or does not exist in our collection.
      </p>
      <Link
        href="/"
        className="px-10 py-4 bg-[var(--color-primary)] text-white text-xs tracking-[0.2em] uppercase font-semibold transition-all active:scale-95 hover:opacity-90"
      >
        Return to Atelier
      </Link>
    </div>
  );
}
