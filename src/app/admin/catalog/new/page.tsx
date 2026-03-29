import ProductForm from "../_components/ProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewProductPage() {
  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/catalog" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 hover:text-black mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to Catalog
        </Link>
        <h2 className="font-serif text-3xl text-gray-900 mb-2">Publish New Content</h2>
        <p className="text-sm text-gray-500 font-sans tracking-wide">Enter the high-fidelity details to list a new piece in the boutique.</p>
      </div>

      <ProductForm />
    </div>
  );
}
