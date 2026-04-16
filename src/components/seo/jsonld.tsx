import type { ProductDetail } from "@/lib/data";
import { getSiteUrl } from "@/lib/site-url";

const BASE_URL = getSiteUrl();

// ── Organization (Brand identity for Google Knowledge Panel) ────────────

export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Layana Boutique",
    url: BASE_URL,
    logo: `${BASE_URL}/opengraph-image`,
    description:
      "Premium Indian ethnic wear boutique specializing in designer sarees, kurties, and kids wear.",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English", "Hindi"],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ── WebSite (Enables sitelinks search box in Google) ────────────────────

export function WebSiteJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Layana Boutique",
    url: BASE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/collections/sarees?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ── Product (Rich snippet with price, availability, brand) ──────────────

interface ProductJsonLdProps {
  product: ProductDetail;
  productId: string;
}

export function ProductJsonLd({ product, productId }: ProductJsonLdProps) {
  const price = parseFloat((product.price || "0").replace(/[^0-9.]/g, ""));
  const image = product.images?.[0]?.src || `${BASE_URL}/opengraph-image`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `Premium ${product.name} from Layana Boutique.`,
    image,
    brand: {
      "@type": "Brand",
      name: "Layana Boutique",
    },
    sku: productId,
    url: `${BASE_URL}/product/${productId}`,
    offers: {
      "@type": "Offer",
      price: price.toFixed(2),
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: `${BASE_URL}/product/${productId}`,
      seller: {
        "@type": "Organization",
        name: "Layana Boutique",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ── Breadcrumb (Navigation path in Google search results) ────────────────

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.href}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
