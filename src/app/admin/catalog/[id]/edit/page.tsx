import ProductForm from "../../_components/ProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { adminDb } from "@/lib/firebase/admin";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  if (!process.env.FIREBASE_PROJECT_ID) {
    return <div>Firebase not configured.</div>;
  }

  // Fetch from the details collection to get the exhaustive list of data
  let doc = await adminDb.collection("productDetails").doc(id).get();
  
  // If no details exist yet, try to fetch the summary representation to bootstrap the form
  if (!doc.exists) {
    doc = await adminDb.collection("products").doc(id).get();
  }

  if (!doc.exists) {
     return notFound();
  }

  const initialData = { id, ...doc.data() };

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/catalog" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 hover:text-black mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to Catalog
        </Link>
        <h2 className="font-serif text-3xl text-gray-900 mb-2">Refine Catalog Data</h2>
        <p className="text-sm text-gray-500 font-sans tracking-wide">Update the detailed specifications for item: {id}</p>
      </div>

      <ProductForm initialData={initialData} />
    </div>
  );
}
