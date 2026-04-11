'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search, ShoppingBag } from 'lucide-react';

type CustomerRecord = {
  id: string;
  email?: string;
  name?: string;
  phone?: string;
};

type CustomerOrder = {
  id: string;
  total: number;
  status: string;
  createdAt: string | null;
  itemCount: number;
};

function getStatusStyle(status: string) {
  switch (status) {
    case 'delivered':
      return 'bg-green-50 text-green-700';
    case 'shipped':
      return 'bg-blue-50 text-blue-700';
    case 'processing':
      return 'bg-indigo-50 text-indigo-700';
    case 'cancelled':
      return 'bg-red-50 text-red-700';
    default:
      return 'bg-amber-50 text-amber-700';
  }
}

const formatInr = (value: number) =>
  `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function CustomersClient({
  customers,
  customerOrders,
}: {
  customers: CustomerRecord[];
  customerOrders: Record<string, CustomerOrder[]>;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;

    const q = searchQuery.toLowerCase();
    return customers.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
    );
  }, [customers, searchQuery]);

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-outline-variant)]/15 bg-white shadow-sm">
      <div className="border-b border-[var(--color-outline-variant)]/10 px-6 py-5 flex items-center justify-between">
        <h2 className="font-serif text-2xl text-[var(--color-on-surface)]">
          Customer Profiles
        </h2>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full rounded-lg bg-gray-50 py-2 pl-10 pr-4 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#0051C3]"
            placeholder="Search by name, email, or phone..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--color-outline-variant)]/10 bg-[var(--color-surface-container-low)]/60">
              <th className="w-10 px-4 py-4" />
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-outline)]">
                Customer
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-outline)]">
                Email
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-outline)]">
                Phone
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-outline)]">
                Orders
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-outline)]">
                Total Spent
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => {
                const orders = customerOrders[customer.id] || [];
                const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
                const isExpanded = expandedId === customer.id;

                return (
                  <CustomerRow
                    key={customer.id}
                    customer={customer}
                    orders={orders}
                    totalSpent={totalSpent}
                    isExpanded={isExpanded}
                    onToggle={() => setExpandedId(isExpanded ? null : customer.id)}
                  />
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-14 text-center text-sm text-[var(--color-on-surface-variant)]"
                >
                  {customers.length === 0
                    ? 'No customer profiles are available in Firebase yet.'
                    : 'No customers match your search.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-[var(--color-outline-variant)]/10 px-6 py-3">
        <p className="text-xs text-gray-400">
          Showing {filteredCustomers.length} of {customers.length} customers
        </p>
      </div>
    </div>
  );
}

function CustomerRow({
  customer,
  orders,
  totalSpent,
  isExpanded,
  onToggle,
}: {
  customer: CustomerRecord;
  orders: CustomerOrder[];
  totalSpent: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        className="border-b border-[var(--color-outline-variant)]/5 transition-colors hover:bg-[var(--color-surface-container-lowest)] cursor-pointer"
        onClick={onToggle}
      >
        <td className="px-4 py-4">
          {orders.length > 0 ? (
            isExpanded ? (
              <ChevronUp className="size-4 text-gray-400" />
            ) : (
              <ChevronDown className="size-4 text-gray-400" />
            )
          ) : (
            <span className="size-4" />
          )}
        </td>
        <td className="px-6 py-4 text-sm font-medium text-[var(--color-on-surface)]">
          {customer.name || 'Unnamed customer'}
        </td>
        <td className="px-6 py-4 text-sm text-[var(--color-on-surface-variant)]">
          {customer.email || 'No email'}
        </td>
        <td className="px-6 py-4 text-sm text-[var(--color-on-surface-variant)]">
          {customer.phone || 'No phone'}
        </td>
        <td className="px-6 py-4 text-sm text-[var(--color-on-surface-variant)]">
          <div className="flex items-center gap-1.5">
            <ShoppingBag className="size-3.5 text-gray-400" />
            <span>{orders.length}</span>
          </div>
        </td>
        <td className="px-6 py-4 text-sm font-semibold text-[var(--color-on-surface)]">
          {totalSpent > 0 ? formatInr(totalSpent) : '—'}
        </td>
      </tr>

      {/* Expanded order history */}
      {isExpanded && orders.length > 0 && (
        <tr className="bg-gray-50/80">
          <td colSpan={6} className="px-10 py-5">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
              Purchase History ({orders.length} order{orders.length !== 1 ? 's' : ''})
            </h4>
            <div className="space-y-2">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg bg-white p-3 border border-gray-100 text-sm"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs text-[#0051C3]">
                      {order.id.substring(0, 10)}...
                    </span>
                    <span className="text-gray-500">
                      {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(order.status)}`}
                    >
                      {order.status}
                    </span>
                    <span className="font-semibold text-gray-800">{formatInr(order.total)}</span>
                    <span className="text-xs text-gray-400">{order.createdAt || '—'}</span>
                  </div>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
