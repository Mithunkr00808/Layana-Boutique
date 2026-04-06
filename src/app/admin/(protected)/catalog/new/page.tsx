import ProductForm from "../_components/ProductForm";
import { Bell, Search, UserCircle2 } from "lucide-react";

export default async function NewProductPage() {
  return (
    <div className="-m-10 min-h-screen bg-[var(--color-surface)] text-[var(--color-on-surface)]">
      <header className="fixed right-0 top-0 z-40 flex w-[calc(100%-16rem)] items-center justify-between bg-[#fbf9f8]/80 px-10 py-4 shadow-[0px_24px_48px_rgba(27,28,28,0.06)] backdrop-blur-md">
        <div className="flex items-center gap-4">
          <span className="font-serif text-lg font-semibold italic text-[#1b1c1c] lg:text-xl">
            Layana Boutique
          </span>
          <div className="mx-2 h-4 w-px bg-[var(--color-outline-variant)]/30" />
          <span className="text-sm text-[var(--color-on-surface-variant)]">New Creation</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="group relative flex items-center">
            <Search className="absolute left-3 size-4 text-[var(--color-on-surface-variant)] transition-colors group-focus-within:text-[var(--color-primary)]" />
            <input
              type="text"
              placeholder="Search catalog..."
              className="w-64 rounded-lg bg-[var(--color-surface-container-low)] py-2 pl-10 pr-4 text-sm placeholder:text-[var(--color-on-surface-variant)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            />
          </div>
          <div className="flex items-center gap-4 text-[var(--color-on-surface-variant)]">
            <button type="button" className="transition-colors hover:text-[var(--color-primary)]">
              <Bell className="size-5" />
            </button>
            <button type="button" className="transition-colors hover:text-[var(--color-primary)]">
              <UserCircle2 className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-10 pb-28 pt-24">
        <div className="mb-16">
          <h2 className="mb-4 font-serif text-5xl font-bold tracking-tight text-[var(--color-on-surface)]">
            New Curated Product
          </h2>
          <p className="max-w-2xl text-lg leading-relaxed text-[var(--color-on-surface-variant)]">
            Define the essence of your next masterpiece. Craft details that resonate with
            exclusivity and timeless design.
          </p>
        </div>

        <ProductForm />
      </main>
    </div>
  );
}
