'use client';

import { useState, useMemo } from 'react';
import { PRODUCT_CATEGORY_OPTIONS, formatProductCategory } from '@/lib/catalog/categories';
import CatalogRowActions from './CatalogRowActions';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, ShieldQuestion } from 'lucide-react';

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
  if (typeof quantity !== 'number') {
    return { dotClass: 'bg-neutral-400', textClass: 'text-neutral-500', label: 'Unknown', bucket: 'unknown' as const };
  }
  if (quantity === 0) {
    return { dotClass: 'bg-[var(--color-error)]', textClass: 'text-[var(--color-error)]', label: 'Out of Stock', bucket: 'out' as const };
  }
  if (quantity <= 8) {
    return { dotClass: 'bg-amber-500', textClass: 'text-[#1b1c1c]', label: `${quantity} Low Stock`, bucket: 'low' as const };
  }
  return { dotClass: 'bg-emerald-500', textClass: 'text-[#1b1c1c]', label: `${quantity} in Stock`, bucket: 'in' as const };
}

function getSku(product: CatalogProduct) {
  return `AN-${product.id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10)}`;
}

export default function CatalogClient({ products }: { products: CatalogProduct[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');

  const filteredProducts = useMemo(() => {
    let result = products;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          (p.name || '').toLowerCase().includes(q) ||
          getSku(p).toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q)
      );
    }

    // Category filter
    if (categoryFilter) {
      result = result.filter((p) => p.category === categoryFilter);
    }

    // Stock filter
    if (stockFilter) {
      result = result.filter((p) => {
        const state = getStockState(p.quantity);
        if (stockFilter === 'in') return state.bucket === 'in';
        if (stockFilter === 'low') return state.bucket === 'low';
        if (stockFilter === 'out') return state.bucket === 'out';
        return true;
      });
    }

    return result;
  }, [products, searchQuery, categoryFilter, stockFilter]);

  const activeFilterCount = [searchQuery.trim(), categoryFilter, stockFilter].filter(Boolean).length;

  return (
    <div className="-m-10 min-h-screen bg-[var(--color-surface)] text-[var(--color-on-surface)]">
      <main className="min-h-screen pt-6">
        <div className="mx-auto max-w-[1400px] p-10">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h3 className="mb-2 font-serif text-4xl tracking-tight">Master Inventory</h3>
              <p className="max-w-md font-light leading-relaxed text-[var(--color-on-surface-variant)]">
                Manage stock availability and product records with precision.
              </p>
            </div>

            <Link
              href="/admin/catalog/new"
              className="group flex items-center gap-2 rounded-lg bg-[#1b1c1c] px-8 py-3 text-white transition-all duration-300 hover:bg-[#434653] hover:shadow-lg"
            >
              <Plus className="size-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Add New Product</span>
            </Link>
          </div>

          {/* Filters Bar */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-6 rounded-xl bg-white p-6 shadow-[0px_4px_24px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-10">
              {/* Search */}
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                <input
                  className="w-full rounded-lg bg-[var(--color-surface-container-low)] py-2 pl-10 pr-4 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  placeholder="Search by name or SKU..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-col gap-1.5 border-l border-[var(--color-outline-variant)]/10 pl-10">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Category
                </label>
                <select
                  className="min-w-[120px] cursor-pointer bg-transparent p-0 text-sm font-semibold focus:outline-none"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {PRODUCT_CATEGORY_OPTIONS.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock Status Filter */}
              <div className="flex flex-col gap-1.5 border-l border-[var(--color-outline-variant)]/10 pl-10">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Stock Status
                </label>
                <select
                  className="min-w-[120px] cursor-pointer bg-transparent p-0 text-sm font-semibold focus:outline-none"
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="in">In Stock</option>
                  <option value="low">Low Stock</option>
                  <option value="out">Out of Stock</option>
                </select>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setCategoryFilter(''); setStockFilter(''); }}
                className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] hover:underline"
              >
                Clear {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
              </button>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[var(--color-outline-variant)]/10">
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
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="space-y-3">
                        <p className="font-serif text-2xl">
                          {products.length === 0 ? 'No products found' : 'No matching products'}
                        </p>
                        <p className="mx-auto max-w-lg text-sm text-neutral-500">
                          {products.length === 0
                            ? 'Start by adding your first catalog entry.'
                            : 'Try adjusting your search or filter criteria.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const stockState = getStockState(product.quantity);
                    const displayPrice = product.discountPrice || product.price || '—';

                    return (
                      <tr
                        key={product.id}
                        className="group transition-all duration-500 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] hover:bg-[var(--color-surface-container-lowest)]"
                      >
                        <td className="py-6">
                          <div className="flex items-center gap-4">
                            <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-[var(--color-surface-container-low)] transition-transform duration-500 group-hover:scale-[1.02]">
                              {product.image ? (
                                <Image
                                  src={product.image}
                                  alt={product.alt || product.name || 'Product image'}
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
                                {product.name || 'Unnamed Product'}
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

          {/* Footer count */}
          <div className="mt-12">
            <p className="text-xs uppercase tracking-wide text-neutral-400">
              Showing {filteredProducts.length} of {products.length} products
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
