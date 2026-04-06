import { Metadata } from 'next';
import { adminDb } from "@/lib/firebase/admin";
import { Package, ShoppingBag, Users, TrendingUp, Search, Bell, Activity } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Dashboard | Layana Boutique Admin',
};

export const dynamic = 'force-dynamic';

type DashboardProduct = {
  id: string;
  name?: string;
  quantity?: number;
  stock?: number;
};

type RecentOrderRow = {
  id: string;
  name: string;
  amount: string;
  status: string;
  sColor: string;
};

export default async function AdminDashboard() {
  let totalSales = 0;
  let productCount = 0;
  let orderCount = 0;
  let userCount = 0;
  let lowStockProducts: DashboardProduct[] = [];
  let recentOrders: RecentOrderRow[] = [];
  let pendingOrdersCount = 0;

  if (process.env.FIREBASE_PROJECT_ID) {
    const [productsSnap, ordersSnap, usersSnap, recentOrdersSnap] = await Promise.all([
      adminDb.collection("products").get(),
      adminDb.collection("orders").get(),
      adminDb.collection("users").get(),
      adminDb.collection("orders").orderBy('createdAt', 'desc').limit(5).get(),
    ]);

    productCount = productsSnap.size;
    orderCount = ordersSnap.size;
    userCount = usersSnap.size;

    // Calculate totals
    ordersSnap.docs.forEach(doc => {
      const data = doc.data();
      totalSales += data.totalAmount || 0;
      if (data.status === 'pending' || data.status === 'processing') {
        pendingOrdersCount++;
      }
    });

    const allProducts = productsSnap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<DashboardProduct, "id">),
    }));
    lowStockProducts = allProducts
      .filter((product) => (product.quantity || product.stock || 0) <= 5)
      .slice(0, 3);
    
    recentOrders = recentOrdersSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id.substring(0, 8).toUpperCase(),
        name: data.shippingAddress?.fullName || data.customerName || 'Guest Customer',
        amount: `₹${(data.totalAmount || 0).toLocaleString()}`,
        status: data.status || 'Pending',
        sColor: data.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                (data.status === 'processing' || data.status === 'shipped') ? 'bg-blue-100 text-blue-700' : 
                'bg-amber-100 text-amber-700'
      };
    });
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header with Search and Profile */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-[#c3c6d6]/10">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search metrics, orders, or items..."
            className="w-full pl-10 pr-4 py-2 bg-[#fbf9f8] border-none rounded-lg text-sm focus:ring-1 focus:ring-[#0051C3] transition-all"
          />
        </div>
        <div className="flex items-center gap-6">
          <button className="relative text-gray-500 hover:text-black transition-colors">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="flex items-center gap-3 border-l pl-6 border-gray-100">
            <div className="text-right">
              <p className="text-xs font-bold text-[#1b1c1c]">LB Admin</p>
              <p className="text-[10px] text-gray-400">Store Manager</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1b1c1c] to-[#434653] flex items-center justify-center text-white text-xs font-bold shadow-inner">
              AA
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Sales', value: `₹${totalSales.toLocaleString()}`, change: '+12.5%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Orders Received', value: orderCount.toString(), change: `${pendingOrdersCount} pending`, icon: ShoppingBag, color: 'text-[#0051C3]', bg: 'bg-blue-50' },
          { label: 'Active Catalog', value: productCount.toString(), change: 'Real-time', icon: Package, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Total Reach', value: userCount.toString(), change: '+18%', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className="group bg-white p-6 rounded-xl shadow-sm border border-[#c3c6d6]/10 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-colors group-hover:bg-opacity-80`}>
                <stat.icon size={22} />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-[#1b1c1c] tracking-tight">{stat.value}</h3>
            </div>
            <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
              <span className="font-bold text-green-600">{stat.change}</span>
              <span className="opacity-60 font-medium">vs last month</span>
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-[#c3c6d6]/10 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-[#c3c6d6]/10 flex justify-between items-center bg-[#fbf9f8]/30">
            <h2 className="font-serif text-xl font-bold text-[#1b1c1c]">Recent Activity</h2>
            <Link href="/admin/orders" className="text-[10px] font-bold uppercase tracking-widest text-[#0051C3] hover:underline transition-all">
              View All Orders
            </Link>
          </div>
          <div className="overflow-x-auto flex-grow">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#fbf9f8] text-left">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Order ID</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Customer</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c3c6d6]/10">
                {recentOrders.length > 0 ? recentOrders.map((order, i) => (
                  <tr key={i} className="hover:bg-[#fbf9f8] transition-colors cursor-pointer group">
                    <td className="px-6 py-4 text-xs font-bold text-[#0051C3] group-hover:underline">#{order.id}</td>
                    <td className="px-6 py-4 font-medium text-[#1b1c1c] truncate max-w-[150px]">{order.name}</td>
                    <td className="px-6 py-4 font-semibold text-[#1b1c1c]">{order.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.sColor}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-400 italic">No recent orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inventory Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-[#c3c6d6]/10 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-[#c3c6d6]/10 bg-[#fbf9f8]/30">
            <h2 className="font-serif text-xl font-bold text-[#1b1c1c]">Inventory Alerts</h2>
          </div>
          <div className="p-6 space-y-8 flex-grow">
            {lowStockProducts.length > 0 ? lowStockProducts.map((item, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between text-xs items-center">
                  <span className="font-bold text-[#1b1c1c] truncate max-w-[150px]">{item.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${(item.quantity || item.stock || 0) === 0 ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                     {item.quantity || item.stock || 0} left
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className={`h-full transition-all duration-1000 ${(item.quantity || item.stock || 0) === 0 ? 'bg-red-500' : 'bg-orange-500'}`} 
                    style={{ width: `${Math.min(((item.quantity || item.stock || 0) / 10) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {(item.quantity || item.stock || 0) === 0 ? 'Restock Required' : 'Low Stock'}
                  </span>
                  <Link href={`/admin/catalog/${item.id}/edit`} className="text-[10px] font-bold uppercase text-[#0051C3] hover:underline">Manage</Link>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-10">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <Activity size={24} />
                </div>
                <p className="text-sm text-gray-500">Stock levels are healthy across all categories.</p>
              </div>
            )}
          </div>
          <div className="p-6 pt-0 mt-auto border-t border-gray-50 bg-[#fbf9f8]/20">
            <Link 
              href="/admin/catalog" 
              className="group flex items-center justify-center w-full py-4 border border-[#c3c6d6]/30 rounded-lg text-[10px] font-bold uppercase tracking-widest text-[#434653] hover:bg-black hover:text-white hover:border-black transition-all"
            >
              Full Inventory Management
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
