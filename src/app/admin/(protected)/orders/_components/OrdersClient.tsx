'use client';

import { useState, useMemo, useTransition } from 'react';
import { ChevronDown, ChevronUp, Search, Package, MapPin, CreditCard } from 'lucide-react';
import Image from 'next/image';
import { updateOrderStatus } from '../actions';

type CartItem = {
  id: string;
  name: string;
  variant: string;
  size: string;
  quantity: number;
  price: string;
  rawPrice: number;
  image: string;
  alt: string;
};

type Address = {
  id: string;
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
};

type Order = {
  id: string;
  userId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  status: string;
  address?: Address | null;
  createdAt: string | null;
};

const STATUS_OPTIONS = ['paid', 'processing', 'shipped', 'delivered', 'cancelled'] as const;

function getStatusStyle(status: string) {
  switch (status) {
    case 'delivered':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'shipped':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'processing':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'cancelled':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'paid':
    default:
      return 'bg-amber-50 text-amber-700 border-amber-200';
  }
}

const formatInr = (value: number) =>
  `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function OrdersClient({ orders }: { orders: Order[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    let result = orders;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.userId.toLowerCase().includes(q) ||
          (o.razorpayPaymentId || '').toLowerCase().includes(q) ||
          (o.address?.fullName || '').toLowerCase().includes(q)
      );
    }

    if (statusFilter) {
      result = result.filter((o) => o.status === statusFilter);
    }

    return result;
  }, [orders, searchQuery, statusFilter]);

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="font-serif text-3xl text-gray-900 mb-2">Orders</h2>
          <p className="text-sm text-gray-500 font-sans tracking-wide">
            Review, track, and manage customer purchases
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-6 rounded-xl bg-white p-5 shadow-sm border border-gray-100">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full rounded-lg bg-gray-50 py-2 pl-10 pr-4 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#0051C3]"
            placeholder="Search by ID, customer, or payment..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Status
          </label>
          <select
            className="min-w-[130px] cursor-pointer bg-transparent p-0 text-sm font-semibold focus:outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto text-xs text-gray-400">
          {filteredOrders.length} of {orders.length} orders
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden font-sans">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="w-10 py-4 px-4" />
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-400">
                  {orders.length === 0 ? 'No orders found.' : 'No matching orders for this filter.'}
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => {
                const isExpanded = expandedId === o.id;
                return (
                  <OrderRow
                    key={o.id}
                    order={o}
                    isExpanded={isExpanded}
                    onToggle={() => setExpandedId(isExpanded ? null : o.id)}
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrderRow({
  order,
  isExpanded,
  onToggle,
}: {
  order: Order;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [localStatus, setLocalStatus] = useState(order.status);
  const [statusMessage, setStatusMessage] = useState('');

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      setStatusMessage('');
      const result = await updateOrderStatus(order.id, newStatus);
      if (result.success) {
        setLocalStatus(newStatus);
        setStatusMessage('Updated');
        setTimeout(() => setStatusMessage(''), 2000);
      } else {
        setStatusMessage(result.error || 'Failed');
        setTimeout(() => setStatusMessage(''), 3000);
      }
    });
  };

  const statusStyle = getStatusStyle(localStatus);
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <tr
        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
        onClick={onToggle}
      >
        <td className="py-4 px-4">
          {isExpanded ? (
            <ChevronUp className="size-4 text-gray-400" />
          ) : (
            <ChevronDown className="size-4 text-gray-400" />
          )}
        </td>
        <td className="py-4 px-6 text-sm text-[#0051C3] font-mono font-medium">
          {order.id.substring(0, 10)}...
        </td>
        <td className="py-4 px-6 text-sm text-gray-700">
          {order.address?.fullName || order.userId.substring(0, 12) || '—'}
        </td>
        <td className="py-4 px-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Package className="size-3.5 text-gray-400" />
            <span>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
          </div>
        </td>
        <td className="py-4 px-6 text-sm" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            <select
              value={localStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isPending}
              className={`px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-widest cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#0051C3] ${statusStyle} ${isPending ? 'opacity-50' : ''}`}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {statusMessage && (
              <span className={`text-[10px] font-bold ${statusMessage === 'Updated' ? 'text-green-600' : 'text-red-500'}`}>
                {statusMessage}
              </span>
            )}
          </div>
        </td>
        <td className="py-4 px-6 text-sm text-gray-800 font-semibold">
          {formatInr(order.total ?? order.subtotal ?? 0)}
        </td>
        <td className="py-4 px-6 text-sm text-gray-500">{order.createdAt || '—'}</td>
      </tr>

      {/* Expanded detail row */}
      {isExpanded && (
        <tr className="bg-gray-50/80">
          <td colSpan={7} className="px-10 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Items */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                  Order Items
                </h4>
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 rounded-lg bg-white p-3 border border-gray-100"
                    >
                      {item.image && (
                        <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded bg-gray-100">
                          <Image src={item.image} alt={item.alt || item.name} fill sizes="80px" className="object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {[item.variant, item.size].filter(Boolean).join(' · ') || 'No variant'}
                          {' · '}Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-800">{item.price}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Address & Payment */}
              <div className="space-y-6">
                {order.address && (
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                      <MapPin className="size-3" /> Shipping Address
                    </h4>
                    <div className="rounded-lg bg-white p-4 border border-gray-100 text-sm space-y-1">
                      <p className="font-medium text-gray-900">{order.address.fullName}</p>
                      <p className="text-gray-600">{order.address.streetAddress}</p>
                      <p className="text-gray-600">
                        {order.address.city}, {order.address.state} {order.address.postalCode}
                      </p>
                      {order.address.phone && (
                        <p className="text-gray-500 text-xs mt-2">📞 {order.address.phone}</p>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                    <CreditCard className="size-3" /> Payment Details
                  </h4>
                  <div className="rounded-lg bg-white p-4 border border-gray-100 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Razorpay Order</span>
                      <span className="font-mono text-gray-700">{order.razorpayOrderId || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Payment ID</span>
                      <span className="font-mono text-gray-700">{order.razorpayPaymentId || '—'}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-100 pt-2 mt-2">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-semibold">{formatInr(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Shipping</span>
                      <span className="font-semibold">{formatInr(order.shipping)}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-100 pt-2">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="font-bold text-gray-900">{formatInr(order.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
