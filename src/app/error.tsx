"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-surface)] px-10">
      <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-[var(--color-secondary)] mb-6">
        Something went wrong
      </span>
      <h1 className="font-serif text-4xl md:text-6xl font-light tracking-tight text-[var(--color-on-surface)] mb-6 text-center">
        An Unexpected <br />
        <i>Interruption</i>
      </h1>
      <p className="font-sans text-sm text-[var(--color-secondary)] mb-12 max-w-md text-center leading-relaxed">
        We apologise for the inconvenience. Our digital Layana-Boutique encountered an issue.
        Please try again.
      </p>
      <button
        onClick={() => reset()}
        className="px-10 py-4 bg-[var(--color-primary)] text-white text-xs tracking-[0.2em] uppercase font-semibold transition-all active:scale-95 hover:opacity-90"
      >
        Try Again
      </button>
    </div>
  );
}
