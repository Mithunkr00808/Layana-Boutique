import { NextResponse } from "next/server";
import { getReadyToWearProducts } from "@/lib/data";
import { getSiteUrl } from "@/lib/site-url";
import { parsePriceToNumber } from "@/lib/priceUtils";

export const revalidate = 3600; // Cache for 1 hour

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}

/**
 * Google Merchant Center product category IDs for apparel.
 * @see https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt
 */
function getGoogleProductCategory(category: string | undefined): string {
  switch (category?.toLowerCase()) {
    case "sarees":
      return "2271"; // Apparel & Accessories > Clothing > Traditional & Ceremonial Clothing > Saris & Lehengas
    case "kurties":
      return "212"; // Apparel & Accessories > Clothing > Tops
    case "kids-wear":
      return "5408"; // Apparel & Accessories > Clothing > Baby & Toddler Clothing
    default:
      return "1604"; // Apparel & Accessories > Clothing
  }
}

export async function GET() {
  try {
    const products = await getReadyToWearProducts();
    const siteUrl = getSiteUrl();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Layana Boutique</title>
    <link>${siteUrl}</link>
    <description>Luxury designer sarees, premium kurties and ethnic kids wear</description>`;

    for (const product of products) {
      const basePrice = parsePriceToNumber(product.price);
      const discountPrice = product.discountPrice
        ? parsePriceToNumber(product.discountPrice)
        : 0;

      const hasDiscount =
        discountPrice > 0 && basePrice > 0 && discountPrice < basePrice;
      const effectivePrice = hasDiscount ? basePrice : basePrice;
      const priceString = `${effectivePrice.toFixed(2)} INR`;

      const availability =
        product.quantity > 0 ? "in_stock" : "out_of_stock";
      const productLink = `${siteUrl}/product/${product.id}`;

      const title = escapeXml(product.name || "Product");
      const description = escapeXml(
        product.options
          ? `Made from ${product.options}. Luxury Indian fashion from Layana Boutique.`
          : "Shop luxury designer sarees, premium kurties and ethnic kids wear at Layana Boutique."
      );

      const googleCategory = getGoogleProductCategory(product.category);

      xml += `
    <item>
      <g:id>${escapeXml(product.id)}</g:id>
      <g:title>${title}</g:title>
      <g:description>${description}</g:description>
      <g:link>${productLink}</g:link>
      <g:image_link>${escapeXml(product.image || "")}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${priceString}</g:price>${hasDiscount ? `
      <g:sale_price>${discountPrice.toFixed(2)} INR</g:sale_price>` : ""}
      <g:brand>Layana Boutique</g:brand>
      <g:google_product_category>${googleCategory}</g:google_product_category>${product.category ? `
      <g:product_type>${escapeXml(product.category)}</g:product_type>` : ""}
      <g:identifier_exists>false</g:identifier_exists>
      <g:shipping>
        <g:country>IN</g:country>
        <g:price>0.00 INR</g:price>
      </g:shipping>
    </item>`;
    }

    xml += `
  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate",
      },
    });
  } catch (error) {
    console.error("Error generating XML feed:", error);
    return new NextResponse("Error generating feed", { status: 500 });
  }
}
