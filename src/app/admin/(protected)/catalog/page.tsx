import { adminDb } from "@/lib/firebase/admin";
import {
  PRODUCT_CATEGORY_OPTIONS,
  formatProductCategory,
} from "@/lib/catalog/categories";
import CatalogRowActions from "./_components/CatalogRowActions";
import Link from "next/link";
import Image from "next/image";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Search,
  Settings,
  ShieldQuestion,
} from "lucide-react";

export const dynamic = "force-dynamic";

type CatalogProduct = {
  id: string;
  name?: string;
  category?: string;
  price?: string;
  discountPrice?: string;
  quantity?: number;
  image?: string;
  alt?: string;
};

function getStockState(quantity?: number) {
  if (typeof quantity !== "number") {
    return {
      dotClass: "bg-neutral-400",
      textClass: "text-neutral-500",
      label: "Unknown",
    };
  }

  if (quantity === 0) {
    return {
      dotClass: "bg-[var(--color-error)]",
      textClass: "text-[var(--color-error)]",
      label: "Out of Stock",
    };
  }

  if (quantity <= 8) {
    return {
      dotClass: "bg-amber-500",
      textClass: "text-[#1b1c1c]",
      label: `${quantity} Low Stock`,
    };
  }

  return {
    dotClass: "bg-emerald-500",
    textClass: "text-[#1b1c1c]",
    label: `${quantity} in Stock`,
  };
}

function getSku(product: CatalogProduct) {
  return `AN-${product.id.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 10)}`;
}

export default async function CatalogPage() {
  let products: CatalogProduct[] = [];

  if (process.env.FIREBASE_PROJECT_ID) {
    const snapshot = await adminDb.collection("products").get();
    products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<CatalogProduct, "id">),
    }));
  }

  return (
    <div className="-m-10 min-h-screen bg-[var(--color-surface)] text-[var(--color-on-surface)]">
      <header className="fixed left-64 right-0 top-0 z-40 flex h-20 items-center justify-between bg-neutral-50/80 px-10 shadow-[0px_24px_48px_rgba(27,28,28,0.06)] backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <h2 className="font-serif text-xl font-bold tracking-tight text-[var(--color-on-surface)]">
            Inventory
          </h2>
          <span className="text-neutral-300">/</span>
          <span className="text-sm text-neutral-500">Autumn/Winter 2024</span>
        </div>

        <div className="flex items-center gap-8">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <input
              className="w-full rounded-lg bg-[var(--color-surface-container-low)] py-2 pl-10 pr-4 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
              placeholder="Search product or SKU..."
              type="text"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-neutral-500 transition-colors hover:text-[var(--color-primary)]" type="button">
              <Bell className="size-5" />
            </button>
            <button className="p-2 text-neutral-500 transition-colors hover:text-[var(--color-primary)]" type="button">
              <Settings className="size-5" />
            </button>
            <div className="h-8 w-8 overflow-hidden rounded-full bg-[var(--color-surface-container)]">
              <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-600">
                JV
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-screen pt-20">
        <div className="mx-auto max-w-[1400px] p-10">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h3 className="mb-2 font-serif text-4xl tracking-tight">Master Inventory</h3>
              <p className="max-w-md font-light leading-relaxed text-[var(--color-on-surface-variant)]">
                Curating the finest pieces of the current season. Manage stock availability
                and archival records with precision.
              </p>
            </div>

            <div className="flex gap-4">
              <button className="group flex items-center gap-2 rounded-lg border border-[var(--color-outline-variant)]/20 px-6 py-3 transition-all duration-300 hover:bg-[var(--color-surface-container-low)]" type="button">
                <Download className="size-4 text-neutral-400 transition-colors group-hover:text-[var(--color-primary)]" />
                <span className="text-xs font-bold uppercase tracking-widest">Export CSV</span>
              </button>
              <Link
                href="/admin/catalog/new"
                className="group flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-8 py-3 text-white transition-all duration-300 hover:bg-[var(--color-primary-container)] hover:shadow-lg"
              >
                <Plus className="size-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Add New Product</span>
              </Link>
            </div>
          </div>

          <div className="mb-8 flex flex-wrap items-center justify-between gap-6 rounded-xl bg-white p-6 shadow-[0px_4px_24px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-10">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Collection
                </label>
                <select className="min-w-[140px] cursor-pointer bg-transparent p-0 text-sm font-semibold focus:outline-none">
                  <option>All Collections</option>
                  <option>AW 24 Couture</option>
                  <option>Essentials</option>
                  <option>Leather Archive</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 border-l border-[var(--color-outline-variant)]/10 pl-10">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Category
                </label>
                <select className="min-w-[120px] cursor-pointer bg-transparent p-0 text-sm font-semibold focus:outline-none">
                  <option>Everything</option>
                  {PRODUCT_CATEGORY_OPTIONS.map((category) => (
                    <option key={category.value}>{category.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5 border-l border-[var(--color-outline-variant)]/10 pl-10">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Stock Status
                </label>
                <select className="min-w-[120px] cursor-pointer bg-transparent p-0 text-sm font-semibold focus:outline-none">
                  <option>All Status</option>
                  <option>In Stock</option>
                  <option>Low Stock</option>
                  <option>Out of Stock</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="mr-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                Bulk Actions
              </span>
              <button className="rounded-lg bg-[var(--color-surface-container-low)] p-2 text-neutral-500 transition-colors hover:bg-[var(--color-surface-container-high)]" title="Update Prices" type="button">
                <Settings className="size-5" />
              </button>
              <button className="rounded-lg bg-[var(--color-surface-container-low)] p-2 text-neutral-500 transition-colors hover:bg-[var(--color-surface-container-high)]" title="Edit Inventory" type="button">
                <Download className="size-5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[var(--color-outline-variant)]/10">
                  <th className="w-12 pb-6 pt-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    <input className="rounded border-[var(--color-outline-variant)]/30 text-[var(--color-primary)]" type="checkbox" />
                  </th>
                  <th className="pb-6 pt-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    Product Details
                  </th>
                  <th className="pb-6 pt-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    SKU
                  </th>
                  <th className="pb-6 pt-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    Category
                  </th>
                  <th className="pb-6 pt-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    Stock Level
                  </th>
                  <th className="pb-6 pt-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    Price
                  </th>
                  <th className="pb-6 pt-2 text-right text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--color-outline-variant)]/5">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="space-y-3">
                        <p className="font-serif text-2xl">No products found</p>
                        <p className="mx-auto max-w-lg text-sm text-neutral-500">
                          Start by adding your first catalog entry. The existing edit and delete
                          logic will continue to work with this new design.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const stockState = getStockState(product.quantity);
                    const displayPrice = product.discountPrice || product.price || "—";

                    return (
                      <tr
                        key={product.id}
                        className="group transition-all duration-500 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] hover:bg-[var(--color-surface-container-lowest)]"
                      >
                        <td className="py-6">
                          <input className="rounded border-[var(--color-outline-variant)]/30 text-[var(--color-primary)]" type="checkbox" />
                        </td>
                        <td className="py-6">
                          <div className="flex items-center gap-4">
                            <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-[var(--color-surface-container-low)] transition-transform duration-500 group-hover:scale-[1.02]">
                              {product.image ? (
                                <Image
                                  src={product.image}
                                  alt={product.alt || product.name || "Product image"}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-[var(--color-surface-container-low)] text-neutral-400">
                                  <ShieldQuestion className="size-5" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="mb-0.5 text-sm font-semibold transition-colors group-hover:text-[var(--color-primary)]">
                                {product.name || "Unnamed Product"}
                              </p>
                              <p className="text-[10px] uppercase tracking-wider text-neutral-400">
                                {product.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-6 font-mono text-xs text-[var(--color-on-surface-variant)]">
                          {getSku(product)}
                        </td>
                        <td className="py-6">
                          <span className="rounded-full bg-[var(--color-surface-container)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                            {formatProductCategory(product.category)}
                          </span>
                        </td>
                        <td className="py-6">
                          <div className="flex items-center gap-2">
                            <div className={`h-1.5 w-1.5 rounded-full ${stockState.dotClass}`} />
                            <span className={`text-sm font-medium ${stockState.textClass}`}>
                              {stockState.label}
                            </span>
                          </div>
                        </td>
                        <td className="py-6 text-sm font-semibold">{displayPrice}</td>
                        <td className="py-6 text-right">
                          <div className="flex justify-end">
                            <CatalogRowActions id={product.id} />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-12 flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-neutral-400">
              Showing 1 to {products.length} of {products.length} products
            </p>
            <div className="flex items-center gap-2">
              <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-outline-variant)]/10 text-neutral-400 transition-all hover:bg-[var(--color-surface-container-low)]" type="button">
                <ChevronLeft className="size-4" />
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)] text-xs font-bold text-white" type="button">
                1
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold transition-all hover:bg-[var(--color-surface-container-low)]" type="button">
                2
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold transition-all hover:bg-[var(--color-surface-container-low)]" type="button">
                3
              </button>
              <span className="px-2 text-neutral-300">...</span>
              <button className="flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold transition-all hover:bg-[var(--color-surface-container-low)]" type="button">
                32
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-outline-variant)]/10 text-neutral-400 transition-all hover:bg-[var(--color-surface-container-low)]" type="button">
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-10 right-10">
        <button className="flex items-center justify-center rounded-full bg-[var(--color-on-surface)] p-5 text-[var(--color-surface)] shadow-2xl transition-all duration-300 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] hover:scale-110 active:scale-95" type="button">
          <ShieldQuestion className="size-6" />
        </button>
      </div>
    </div>
  );
}
