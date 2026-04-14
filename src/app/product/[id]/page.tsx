import Navbar from "@/components/Navbar";
import ProductGallery from "@/components/ProductGallery";
import ProductDetails from "@/components/ProductDetails";
import RelatedProducts from "@/components/RelatedProducts";
import { getProductDetail, getRelatedProducts } from "@/lib/data";
import { notFound } from "next/navigation";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/seo/jsonld";

import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://layanaboutique.com";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductDetail(id);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The product you are looking for is not available at Layana Boutique.",
    };
  }

  const priceNum = parseFloat((product.price || "0").replace(/[^0-9.]/g, ""));
  const priceStr = priceNum > 0 ? `₹${priceNum.toLocaleString("en-IN")}` : "";
  const descSnippet = product.description
    ? product.description.slice(0, 140).replace(/\s+\S*$/, "")
    : "Premium Indian ethnic wear";

  const title = `${product.name} — Buy Online`;
  const description = priceStr
    ? `Shop ${product.name} at ${priceStr}. ${descSnippet}. Free shipping at Layana Boutique.`
    : `Shop ${product.name}. ${descSnippet}. Free shipping at Layana Boutique.`;

  const ogImage = product.images?.[0]?.src || "/og-image.png";

  return {
    title,
    description,
    openGraph: {
      type: "website",
      title: `${product.name} | Layana Boutique`,
      description,
      url: `${BASE_URL}/product/${id}`,
      siteName: "Layana Boutique",
      images: [{ url: ogImage, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Layana Boutique`,
      description,
      images: [ogImage],
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

  const related = await getRelatedProducts(id, product.categoryPath);
  const primaryMedia = product.images?.[0];
  const primaryImage =
    primaryMedia?.resourceType === "video"
      ? primaryMedia.poster || ""
      : primaryMedia?.src || "";

  const priceNum = parseFloat((product.price || "0").replace(/[^0-9.]/g, ""));

  return (
    <div className="flex flex-col min-h-screen">
      <ProductJsonLd product={product} productId={id} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Shop", href: "/collections/sarees" },
          { name: product.name, href: `/product/${id}` },
        ]}
      />
      <Navbar />
      <main className="flex-grow max-w-[1440px] mx-auto px-6 md:px-10 w-full pt-24 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-20">
          <ProductGallery 
            images={product.images} 
            wishlistItem={{
              id: product.id,
              name: product.name,
              price: product.price,
              rawPrice: priceNum,
              image: primaryImage,
              alt: product.name,
              variant: product.categoryPath
            }}
          />
          <ProductDetails {...product} id={product.id} primaryImage={primaryImage} />
        </div>
        {related.length > 0 ? <RelatedProducts products={related} /> : null}
      </main>
    </div>
  );
}
