"use client";

import { useTransition, useState } from "react";
import { saveCatalogItem, deleteCatalogItem } from "@/app/admin/actions";
import { useRouter } from "next/navigation";
import { Loader2, Trash } from "lucide-react";
import { uploadImage } from "@/lib/firebase/storage";

export default function ProductForm({ initialData }: { initialData?: any }) {
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const isEditing = !!initialData?.id;

  async function handleSubmit(formData: FormData) {
    setError(null);

    startTransition(async () => {
      try {
        const file = formData.get("imageFile") as File | null;
        const fallbackUrl = formData.get("image")?.toString() || initialData?.image || "";
        formData.delete("imageFile");

        if (file && file.size > 0) {
          setIsUploading(true);
          const uploadedUrl = await uploadImage(file);
          formData.set("image", uploadedUrl);
        } else if (fallbackUrl) {
          formData.set("image", fallbackUrl);
        }

        const result = await saveCatalogItem(formData, isEditing ? initialData.id : undefined);
        if (result.success) {
          router.push("/admin/catalog");
        } else {
          setError(result.error || "Failed to save product.");
        }
      } catch (err: any) {
        console.error(err);
        setError("Upload failed. Please try again.");
      } finally {
        setIsUploading(false);
      }
    });
  }

  async function handleDelete() {
    if (!isEditing || !confirm("Are you sure you want to permanently delete this product?")) return;
    
    startTransition(async () => {
      const result = await deleteCatalogItem(initialData.id);
      if (result.success) {
        router.push("/admin/catalog");
      }
    });
  }

  // Pre-fill fields for editing
  let sizesStr = "S, M, L";
  if (initialData?.sizes) {
    sizesStr = initialData.sizes.map((s: any) => s.label).join(", ");
  }

  let materialsStr = "";
  if (initialData?.materials) {
    materialsStr = initialData.materials.join(", ");
  }

  return (
    <form action={handleSubmit} className="bg-white border border-gray-100 p-10 rounded-xl font-sans max-w-4xl shadow-sm">
      {error && <div className="mb-6 bg-red-50 text-red-600 p-4 rounded text-sm">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Product Name</label>
          <input 
            type="text" 
            name="name" 
            required 
            defaultValue={initialData?.name}
            className="w-full border-b border-gray-200 py-2 focus:border-black outline-none transition-colors italic text-lg font-serif" 
            placeholder="e.g. Sculptural Wool Coat" 
          />
        </div>
        
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Price Label</label>
          <input 
            type="text" 
            name="price" 
            required 
            defaultValue={initialData?.price || "$"}
            className="w-full border-b border-gray-200 py-2 focus:border-black outline-none transition-colors" 
            placeholder="e.g. $1,250" 
          />
        </div>

        <div>
           <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Category Section</label>
           <select 
             name="category" 
             defaultValue={initialData?.categoryPath || initialData?.category || "new-arrivals"}
             className="w-full border-b border-gray-200 py-2 focus:border-black outline-none transition-colors"
           >
             <option value="new-arrivals">New Arrivals</option>
             <option value="ready-to-wear">Ready to Wear</option>
           </select>
        </div>

        <div>
           <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Upload Image</label>
           <input 
             type="file" 
             name="imageFile"
             accept="image/*"
             className="w-full border-b border-gray-200 py-2 focus:border-black outline-none transition-colors" 
           />
           <p className="text-[11px] text-gray-500 mt-1">You can also paste a URL below if you already have one.</p>
           <input 
             type="url" 
             name="image" 
             defaultValue={initialData?.images?.[0]?.src || initialData?.image}
             className="w-full border-b border-gray-200 py-2 focus:border-black outline-none transition-colors mt-2" 
             placeholder="https://images.unsplash.com/..." 
           />
        </div>

        <div className="md:col-span-2">
           <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Editorial Description</label>
           <textarea 
             name="description" 
             required
             defaultValue={initialData?.description}
             className="w-full border-b border-gray-200 py-4 focus:border-black outline-none transition-colors resize-y min-h-[100px]" 
             placeholder="Crafted from signature Italian double-faced cashmere..." 
           />
        </div>

        <div>
           <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Materials (Comma separated)</label>
           <input 
             type="text" 
             name="materials" 
             defaultValue={materialsStr}
             className="w-full border-b border-gray-200 py-2 focus:border-black outline-none transition-colors" 
             placeholder="100% Loro Piana Cashmere, Dry clean only" 
           />
        </div>

        <div>
           <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Available Sizes (Comma separated)</label>
           <input 
             type="text" 
             name="sizes" 
             defaultValue={sizesStr}
             className="w-full border-b border-gray-200 py-2 focus:border-black outline-none transition-colors" 
             placeholder="FR 34, FR 36, FR 38" 
           />
        </div>

      </div>

      <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
        {isEditing ? (
          <button 
            type="button" 
            onClick={handleDelete}
            className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm tracking-wide transition-colors"
          >
            <Trash size={16} /> Disable Product
          </button>
        ) : (
          <div></div>
        )}
        
        <div className="flex gap-4">
          <button 
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 text-sm text-gray-500 hover:text-black tracking-widest uppercase transition-colors"
          >
            Cancel
          </button>
          
          <button 
            type="submit" 
            disabled={isPending || isUploading}
            className="bg-black text-white px-8 py-3 text-xs tracking-widest uppercase hover:bg-black/80 transition-opacity active:scale-95 disabled:opacity-50 flex items-center justify-center min-w-[140px]"
          >
            {isPending || isUploading ? <Loader2 className="animate-spin" size={16} /> : (isEditing ? "Save Changes" : "Publish Product")}
          </button>
        </div>
      </div>
    </form>
  );
}
