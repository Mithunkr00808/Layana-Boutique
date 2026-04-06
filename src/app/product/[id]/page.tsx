import Navbar from "@/components/Navbar";
import ProductGallery from "@/components/ProductGallery";
import ProductDetails from "@/components/ProductDetails";
import RelatedProducts from "@/components/RelatedProducts";
import { getProductDetail, getRelatedProducts } from "@/lib/data";
import { notFound } from "next/navigation";

import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductDetail(id);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }
  return {
    title: `${product.name} | Layana Boutique`,
    description: product.description,
    openGraph: {
      type: "website",
      title: product.name,
      description: product.description,
      images: product.images?.[0] ? [{ url: product.images[0].src }] : [],
    },
    alternates: {
      canonical: `/product/${id}`,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const product = await getProductDetail(id);

  if (!product) {
    notFound();
  }

  const related = await getRelatedProducts();
  const primaryMedia = product.images?.[0];
  const primaryImage =
    primaryMedia?.resourceType === "video"
      ? primaryMedia.poster || ""
      : primaryMedia?.src || "";

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow max-w-[1440px] mx-auto px-10 w-full pt-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-20">
          <ProductGallery images={product.images} />
          <ProductDetails {...product} id={product.id} primaryImage={primaryImage} />
        </div>
        {related.length > 0 ? <RelatedProducts products={related} /> : null}
      </main>
    </div>
  );
}
