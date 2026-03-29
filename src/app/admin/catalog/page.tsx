import { adminDb } from "@/lib/firebase/admin";
import Link from "next/link";
import { Plus, Edit3, Trash2 } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function CatalogPage() {
  let products: any[] = [];
  
  if (process.env.FIREBASE_PROJECT_ID) {
    const snapshot = await adminDb.collection("products").get();
    products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="font-serif text-3xl text-gray-900 mb-2">Product Catalog</h2>
          <p className="text-sm text-gray-500 font-sans tracking-wide">Manage your central inventory and details</p>
        </div>
        <Link 
          href="/admin/catalog/new"
          className="flex items-center gap-2 bg-black text-white px-6 py-3 text-xs tracking-widest uppercase hover:bg-black/90 transition-colors"
        >
          <Plus size={16} />
          <span>New Product</span>
        </Link>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden font-sans">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product ID</th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-400">
                  No products found. Start by adding one to your catalog!
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-sm text-gray-500 font-mono">{p.id}</td>
                  <td className="py-4 px-6 text-sm font-medium text-gray-900">{p.name || "Unnamed"}</td>
                  <td className="py-4 px-6 text-sm text-gray-500 capitalize">{p.category?.replace('-', ' ')}</td>
                  <td className="py-4 px-6 text-sm text-gray-500">{p.price}</td>
                  <td className="py-4 px-6 text-right">
                    <Link href={`/admin/catalog/${p.id}/edit`} className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 text-gray-500 hover:text-black">
                      <Edit3 size={16} />
                    </Link>
                    {/* Delete action skipped for UI brevity, handled inside Edit if needed */}
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
