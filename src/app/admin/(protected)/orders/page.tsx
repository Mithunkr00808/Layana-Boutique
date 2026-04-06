import { getAllOrders } from "@/lib/data";

export const dynamic = "force-dynamic";

const formatInr = (value: number) =>
  `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="font-serif text-3xl text-gray-900 mb-2">Orders</h2>
          <p className="text-sm text-gray-500 font-sans tracking-wide">Review and track customer purchases</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden font-sans">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment ID</th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-sm text-gray-500 font-mono">{o.id}</td>
                  <td className="py-4 px-6 text-sm text-gray-700">{o.userId || "—"}</td>
                  <td className="py-4 px-6 text-sm text-gray-700">{o.razorpayPaymentId || "—"}</td>
                  <td className="py-4 px-6 text-sm">
                    <span className="px-3 py-1 rounded-full border border-gray-200 uppercase tracking-widest text-xs">
                      {o.status ?? "paid"}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-800">
                    {formatInr(o.total ?? o.subtotal ?? 0)}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500">
                    {o.createdAt
                      ? new Date(o.createdAt.seconds ? o.createdAt.seconds * 1000 : o.createdAt).toLocaleDateString(
                          "en-IN"
                        )
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
