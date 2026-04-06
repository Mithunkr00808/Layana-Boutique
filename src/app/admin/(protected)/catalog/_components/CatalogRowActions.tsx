"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit3, Loader2, Trash2 } from "lucide-react";
import { deleteCatalogItem } from "@/app/admin/actions";

export default function CatalogRowActions({ id }: { id: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (isDeleting) return;

    const confirmed = confirm("Delete this inventory item permanently?");
    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const result = await deleteCatalogItem(id);
      if (result.success) {
        router.refresh();
      } else {
        alert("Failed to delete product.");
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <Link
        href={`/admin/catalog/${id}/edit`}
        className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 text-gray-500 hover:text-black"
        aria-label="Edit product"
      >
        <Edit3 size={16} />
      </Link>

      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-600 disabled:opacity-50"
        aria-label="Delete product"
      >
        {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
      </button>
    </div>
  );
}
