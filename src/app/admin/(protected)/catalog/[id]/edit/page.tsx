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
    notFound();
  }

  const serializedData = JSON.parse(JSON.stringify(doc.data() || {})) as Record<string, unknown>;
  const initialData = {
    id,
    name: typeof serializedData.name === "string" ? serializedData.name : undefined,
    image: typeof serializedData.image === "string" ? serializedData.image : undefined,
    images: Array.isArray(serializedData.images) ? serializedData.images : undefined,
    sizes: Array.isArray(serializedData.sizes) ? serializedData.sizes : undefined,
    materials: Array.isArray(serializedData.materials) ? serializedData.materials : undefined,
    options: typeof serializedData.options === "string" ? serializedData.options : undefined,
    description:
      typeof serializedData.description === "string" ? serializedData.description : undefined,
    discountPrice:
      typeof serializedData.discountPrice === "string" ? serializedData.discountPrice : undefined,
    quantity: typeof serializedData.quantity === "number" ? serializedData.quantity : undefined,
    categoryPath:
      typeof serializedData.categoryPath === "string" ? serializedData.categoryPath : undefined,
    category: typeof serializedData.category === "string" ? serializedData.category : undefined,
    sustainability:
      typeof serializedData.sustainability === "string" ? serializedData.sustainability : undefined,
    price: typeof serializedData.price === "string" ? serializedData.price : undefined,
  };

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
