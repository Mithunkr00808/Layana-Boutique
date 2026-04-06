import { adminDb } from "@/lib/firebase/admin";
import {
  formatProductCategory,
  isKnownProductCategory,
} from "@/lib/catalog/categories";
import { getAllOrders, type Order, type Product } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  Download,
  Search,
  TrendingUp,
  UserCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

type RevenueMonth = {
  key: string;
  label: string;
  revenue: number;
};

type CategoryMetric = {
  name: string;
  revenue: number;
  percentage: number;
};

type MarketMetric = {
  label: string;
  revenue: number;
};

type BestsellerMetric = {
  id: string;
  name: string;
  category: string;
  image: string;
  alt: string;
  unitsSold: number;
  revenue: number;
};

function toDate(value: Order["createdAt"]): Date | null {
  if (!value) return null;

  if (typeof (value as { toDate?: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate();
  }

  if (typeof (value as { seconds?: number }).seconds === "number") {
    return new Date((value as { seconds: number }).seconds * 1000);
  }

  if (typeof value === "number" || typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCompactCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatPercent(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function getGrowth(current: number, previous: number) {
  if (previous <= 0) {
    return current > 0 ? 100 : 0;
  }

  return ((current - previous) / previous) * 100;
}

function getDateRangeLabel(dates: Date[]) {
  if (dates.length === 0) {
    return "No sales data yet";
  }

  const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
  const formatter = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return `${formatter.format(sorted[0])} — ${formatter.format(sorted[sorted.length - 1])}`;
}

function buildRevenueMonths(orders: Order[]): RevenueMonth[] {
  const now = new Date();
  const months: RevenueMonth[] = [];

  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    months.push({
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleDateString("en-IN", { month: "short" }).toUpperCase(),
      revenue: 0,
    });
  }

  const monthMap = new Map(months.map((month) => [month.key, month]));

  for (const order of orders) {
    const date = toDate(order.createdAt);
    if (!date) continue;

    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const target = monthMap.get(key);
    if (target) {
      target.revenue += order.total ?? order.subtotal ?? 0;
    }
  }

  return months;
}

function getRegionalMetrics(orders: Order[]): MarketMetric[] {
  const revenueByMarket = new Map<string, number>();

  for (const order of orders) {
    const address = order.address;
    const label =
      address?.city?.trim() ||
      address?.state?.trim() ||
      address?.postalCode?.trim() ||
      "Online";
    const total = order.total ?? order.subtotal ?? 0;
    revenueByMarket.set(label, (revenueByMarket.get(label) ?? 0) + total);
  }

  return Array.from(revenueByMarket.entries())
    .map(([label, revenue]) => ({ label, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4);
}

function buildCategoryMetrics(orders: Order[], productMap: Map<string, Product>): CategoryMetric[] {
  const revenueByCategory = new Map<string, number>();

  for (const order of orders) {
    for (const item of order.items) {
      const product = productMap.get(item.id);
      const category = isKnownProductCategory(product?.category) ? product.category : "unsorted";
      const lineRevenue = item.rawPrice * item.quantity;
      revenueByCategory.set(category, (revenueByCategory.get(category) ?? 0) + lineRevenue);
    }
  }

  const totalRevenue = Array.from(revenueByCategory.values()).reduce((sum, value) => sum + value, 0);

  return Array.from(revenueByCategory.entries())
    .map(([name, revenue]) => ({
      name,
      revenue,
      percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4);
}

function buildBestsellers(orders: Order[], productMap: Map<string, Product>): BestsellerMetric[] {
  const aggregates = new Map<string, BestsellerMetric>();

  for (const order of orders) {
    for (const item of order.items) {
      const existing = aggregates.get(item.id);
      const product = productMap.get(item.id);
      const revenue = item.rawPrice * item.quantity;

      if (existing) {
        existing.unitsSold += item.quantity;
        existing.revenue += revenue;
      } else {
        aggregates.set(item.id, {
          id: item.id,
          name: item.name || product?.name || "Untitled Piece",
          category: isKnownProductCategory(product?.category) ? product.category : "unsorted",
          image: item.image || product?.image || "",
          alt: item.alt || product?.alt || "Product image",
          unitsSold: item.quantity,
          revenue,
        });
      }
    }
  }

  return Array.from(aggregates.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 3);
}

export default async function AdminAnalyticsPage() {
  const [orders, productsSnapshot] = await Promise.all([
    getAllOrders(500),
    process.env.FIREBASE_PROJECT_ID ? adminDb.collection("products").get() : Promise.resolve(null),
  ]);

  const products = productsSnapshot
    ? productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Product, "id">),
      }))
    : [];

  const productMap = new Map(products.map((product) => [product.id, product]));
  const validDates = orders.map((order) => toDate(order.createdAt)).filter((date): date is Date => Boolean(date));
  const currency = orders[0]?.currency || "INR";
  const months = buildRevenueMonths(orders);
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total ?? order.subtotal ?? 0), 0);
  const previousMonthRevenue = months[4]?.revenue ?? 0;
  const currentMonthRevenue = months[5]?.revenue ?? 0;
  const revenueGrowth = getGrowth(currentMonthRevenue, previousMonthRevenue);
  const maxMonthRevenue = Math.max(...months.map((month) => month.revenue), 1);
  const categoryMetrics = buildCategoryMetrics(orders, productMap);
  const regionalMetrics = getRegionalMetrics(orders);
  const bestsellingPieces = buildBestsellers(orders, productMap);
  const generatedAt = new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC";

  return (
    <div className="-m-10 min-h-screen bg-[var(--color-surface)] text-[var(--color-on-surface)]">
      <header className="fixed right-0 top-0 z-40 flex w-[calc(100%-16rem)] items-center justify-between bg-[#fbf9f8]/80 px-10 py-4 backdrop-blur-md">
        <div>
          <h2 className="font-serif text-lg font-semibold italic text-[#1b1c1c] lg:text-xl">
            Layana Boutique Management
          </h2>
        </div>

        <div className="flex items-center gap-8">
          <div className="hidden items-center rounded-full bg-[var(--color-surface-container)] px-4 py-2 transition-all focus-within:ring-1 focus-within:ring-[var(--color-primary)] md:flex">
            <Search className="size-4 text-[var(--color-outline)]" />
            <input
              type="text"
              placeholder="Search analytics..."
              className="ml-2 w-48 border-none bg-transparent text-sm placeholder:text-[var(--color-outline)] focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-4 text-[#434653]">
            <button className="transition-colors duration-300 hover:text-[#0051c3]" type="button">
              <Bell className="size-5" />
            </button>
            <button className="transition-colors duration-300 hover:text-[#0051c3]" type="button">
              <UserCircle2 className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="min-h-screen px-10 pb-20 pt-24">
        <div className="mb-16 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <span className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-[var(--color-outline)]">
              Performance Overview
            </span>
            <h1 className="font-serif text-5xl font-bold tracking-tight text-[var(--color-on-surface)]">
              Sales Analytics
            </h1>
            <p className="mt-4 max-w-lg leading-relaxed text-[var(--color-on-surface-variant)]">
              A comprehensive view of Layana Boutique&apos;s commercial health. Monitoring
              distribution, category dominance, and seasonal revenue trajectories from live
              order and product data.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="editorial-shadow group flex cursor-pointer items-center gap-4 bg-[var(--color-surface-container-lowest)] px-6 py-3 transition-colors hover:bg-[var(--color-surface-container-low)]">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-widest text-[var(--color-outline)]">
                  Date Range
                </span>
                <span className="text-sm font-medium">{getDateRangeLabel(validDates)}</span>
              </div>
            </div>

            <button className="editorial-shadow flex items-center gap-3 rounded-lg bg-[var(--color-primary)] px-8 py-4 text-[var(--color-on-primary)] transition-all hover:opacity-90 active:scale-95" type="button">
              <Download className="size-4" />
              <span className="text-sm font-bold tracking-wide">Export Data</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="editorial-shadow col-span-12 flex min-h-[500px] flex-col bg-[var(--color-surface-container-lowest)] p-10 lg:col-span-8">
            <div className="mb-12 flex items-start justify-between">
              <div>
                <h3 className="mb-1 font-serif text-2xl font-semibold">Revenue Trajectory</h3>
                <p className="text-sm text-[var(--color-on-surface-variant)]">
                  Monthly comparison across all channels
                </p>
              </div>
              <div className="text-right">
                <div className="font-serif text-3xl font-bold text-[var(--color-primary)]">
                  {formatCurrency(totalRevenue, currency)}
                </div>
                <div className="mt-1 flex items-center justify-end gap-1 text-xs font-bold text-green-600">
                  <TrendingUp className="size-3.5" />
                  <span>{formatPercent(revenueGrowth)} vs prior period</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-1 items-end justify-between gap-4">
              {months.map((month, index) => {
                const heightPercent = Math.max((month.revenue / maxMonthRevenue) * 100, month.revenue > 0 ? 12 : 6);
                const isCurrent = index === months.length - 1;

                return (
                  <div key={month.key} className="group flex flex-1 flex-col items-center gap-4">
                    <div className="relative h-64 w-full overflow-hidden bg-[var(--color-surface-container-low)]">
                      <div
                        className={`absolute bottom-0 w-full transition-all ${
                          isCurrent
                            ? "bg-[var(--color-primary)]"
                            : "bg-[var(--color-secondary-container)] group-hover:bg-[var(--color-primary-container)]"
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-bold ${
                        isCurrent ? "text-[var(--color-primary)]" : "text-[var(--color-outline)]"
                      }`}
                    >
                      {month.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="editorial-shadow col-span-12 flex flex-col bg-[var(--color-primary)] p-10 text-[var(--color-on-primary)] lg:col-span-4">
            <h3 className="mb-8 font-serif text-2xl font-semibold">Category Dominance</h3>
            <div className="flex flex-1 flex-col justify-center">
              <div className="space-y-8">
                {categoryMetrics.length > 0 ? (
                  categoryMetrics.map((metric, index) => (
                    <div
                      key={metric.name}
                      className={`flex items-end justify-between pb-4 ${
                        index < categoryMetrics.length - 1 ? "border-b border-white/10" : "opacity-60"
                      }`}
                    >
                      <div>
                        <p className="mb-1 text-[10px] uppercase tracking-widest text-white/60">
                          {index === 0 ? "Top Tier" : index === 1 ? "Growth" : index === 2 ? "Stable" : "Emerging"}
                        </p>
                        <p className="font-serif text-xl">{formatProductCategory(metric.name)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{Math.round(metric.percentage)}%</p>
                        <p className="text-[10px] text-white/60">
                          {formatCompactCurrency(metric.revenue, currency)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-white/80">No category revenue data available yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-12 flex h-auto flex-col gap-1 bg-[var(--color-surface-container-low)] p-1 lg:h-[400px] lg:flex-row">
            <div className="relative flex-1 overflow-hidden bg-[var(--color-surface-container-lowest)] p-10">
              <h3 className="mb-2 font-serif text-2xl font-semibold">Regional Market Share</h3>
              <p className="mb-8 text-sm text-[var(--color-on-surface-variant)]">
                Performance across top ordering destinations
              </p>
              <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                {regionalMetrics.length > 0 ? (
                  regionalMetrics.map((market, index) => (
                    <div key={market.label}>
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-outline)]">
                        {market.label}
                      </p>
                      <p className="font-serif text-2xl font-bold">
                        {formatCompactCurrency(market.revenue, currency)}
                      </p>
                      <div
                        className="mt-4 h-1 bg-[var(--color-primary)]"
                        style={{ width: `${Math.max(25, 100 - index * 18)}%` }}
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[var(--color-on-surface-variant)]">
                    Regional data will appear once orders contain address information.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-[var(--color-surface-container-lowest)] p-1 lg:w-1/3">
              <div className="flex h-full min-h-[240px] items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(0,81,195,0.14),_transparent_55%),linear-gradient(180deg,rgba(228,226,225,0.45),rgba(255,255,255,0.9))] p-10 text-center">
                <div>
                  <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-[var(--color-outline)]">
                    Live Coverage
                  </p>
                  <p className="font-serif text-2xl text-[var(--color-on-surface)]">
                    {regionalMetrics.length} active market
                    {regionalMetrics.length === 1 ? "" : "s"}
                  </p>
                  <p className="mt-3 text-sm text-[var(--color-on-surface-variant)]">
                    Geography updates automatically from order address data in Firestore.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="editorial-shadow col-span-12 bg-[var(--color-surface-container-lowest)] p-10">
            <div className="mb-12 flex items-center justify-between">
              <h3 className="font-serif text-2xl font-semibold">Bestselling Pieces</h3>
              <Link
                href="/admin/catalog"
                className="border-b border-[var(--color-on-surface)] pb-1 text-sm font-bold transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                View All Products
              </Link>
            </div>

            <div className="space-y-12">
              {bestsellingPieces.length > 0 ? (
                bestsellingPieces.map((piece) => (
                  <div key={piece.id} className="group flex flex-col items-center gap-10 md:flex-row">
                    <div className="h-40 w-32 overflow-hidden bg-[var(--color-surface-container)]">
                      {piece.image ? (
                        <Image
                          src={piece.image}
                          alt={piece.alt}
                          width={128}
                          height={160}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[var(--color-surface-container)] text-[var(--color-outline)]">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <span className="font-mono text-[10px] tracking-tighter text-[var(--color-outline)]">
                        SKU-{piece.id.toUpperCase()}
                      </span>
                      <h4 className="mt-1 font-serif text-xl font-bold">{piece.name}</h4>
                      <p className="mt-2 max-w-md text-sm text-[var(--color-on-surface-variant)]">
                        {piece.unitsSold} units sold with {formatCurrency(piece.revenue, currency)} in
                        gross revenue. Category: {formatProductCategory(piece.category)}.
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-[var(--color-on-surface)]">
                        {formatCurrency(piece.revenue / Math.max(piece.unitsSold, 1), currency)}
                      </div>
                      <div className="mt-1 text-xs text-[var(--color-outline)]">
                        {piece.unitsSold} Units Sold
                      </div>
                    </div>

                    <div className="hidden h-12 w-px bg-[var(--color-surface-container)] md:block" />

                    <div className="min-w-[120px] text-right">
                      <div className="font-serif text-xl font-bold text-[var(--color-primary)]">
                        {formatCurrency(piece.revenue, currency)}
                      </div>
                      <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[var(--color-outline)]">
                        Total Gross
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--color-on-surface-variant)]">
                  Bestselling products will appear once paid orders are recorded.
                </p>
              )}
            </div>
          </div>
        </div>

        <footer className="mt-20 flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-outline)]">
          <p>© Layana Boutique. Confidential.</p>
          <p>Generated at: {generatedAt}</p>
        </footer>
      </main>
    </div>
  );
}
