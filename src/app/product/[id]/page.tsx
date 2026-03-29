import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGallery from "@/components/ProductGallery";
import ProductDetails from "@/components/ProductDetails";
import RelatedProducts from "@/components/RelatedProducts";
import { getProductDetail, getRelatedProducts } from "@/lib/data";

import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductDetail(id);
  
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const product = await getProductDetail(id);
  const related = await getRelatedProducts();
  const primaryImage = product.images?.[0]?.src || "";

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow max-w-[1440px] mx-auto px-10 w-full pt-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-20">
          <ProductGallery images={product.images} />
          <ProductDetails {...product} id={product.id} primaryImage={primaryImage} />
        </div>
        <RelatedProducts products={related} />
      </main>
      <Footer />
    </div>
  );
}
