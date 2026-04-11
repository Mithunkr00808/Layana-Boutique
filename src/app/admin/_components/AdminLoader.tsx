'use client';

export default function AdminLoader({ 
  title = "Loading management suite", 
  subtitle = "Please wait" 
}: { 
  title?: string; 
  subtitle?: string; 
}) {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-[var(--color-surface)]">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="h-12 w-12 animate-[spin_3s_linear_infinite] border border-[var(--color-outline-variant)]/40" />
        <div className="space-y-2">
          <p className="font-serif text-xl tracking-tight text-[var(--color-on-surface)]">
            {title}
          </p>
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-on-surface-variant)]">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
