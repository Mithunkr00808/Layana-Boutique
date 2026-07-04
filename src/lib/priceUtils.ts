import { adminDb } from "@/lib/firebase/admin";

// ── Price Parsing ───────────────────────────────────────────────────────────

/**
 * Safely converts any price representation to a numeric value.
 * Handles: number, string (with currency symbols / commas), null, undefined.
 *
 * Returns 0 for any value that cannot be meaningfully parsed.
 */
export function parsePriceToNumber(price: unknown): number {
  if (typeof price === "number") {
    return Number.isFinite(price) && price >= 0 ? price : 0;
  }

  if (typeof price === "string") {
    // Strip everything except digits and decimal point
    const numeric = price.replace(/[^\d.]/g, "");
    const value = parseFloat(numeric);
    return Number.isFinite(value) && value >= 0 ? value : 0;
  }

  return 0;
}

// ── Price Formatting ────────────────────────────────────────────────────────

/**
 * Formats a numeric value as an Indian Rupee string.
 * Uses en-IN locale for proper lakh/crore grouping.
 *
 * Example: 1500 → "₹1,500.00"
 */
export function formatINR(value: number): string {
  if (!Number.isFinite(value) || value < 0) return "₹0.00";

  return `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ── Server-Side Price Resolution ────────────────────────────────────────────

export interface ResolvedPrice {
  /** The effective price the customer should pay (discountPrice if set, else base price). */
  rawPrice: number;
  /** Display string for the effective price. */
  displayPrice: string;
  /** The original (pre-discount) price, if a discount is active. */
  rawOriginalPrice?: number;
  /** Display string for the original price, if a discount is active. */
  displayOriginalPrice?: string;
}

/**
 * Resolves the canonical price for a product by reading directly from the
 * `products` and `productDetails` Firestore collections.
 *
 * Priority:
 *  1. If `discountPrice` exists and is > 0 → use it as the effective price,
 *     and set the base `price` as the original (struck-through) price.
 *  2. Otherwise → use `price` (or `rawPrice` if stored as a number) as the
 *     effective price with no original price.
 *
 * Returns `null` if the product cannot be found or has no valid price.
 */
export async function resolveProductPrice(
  productId: string
): Promise<ResolvedPrice | null> {
  // Try `products` collection first (primary source)
  const productDoc = await adminDb.collection("products").doc(productId).get();
  if (productDoc.exists) {
    const result = extractPriceFromDoc(productDoc.data());
    if (result) return result;
  }

  // Fallback to `productDetails` collection
  const detailDoc = await adminDb
    .collection("productDetails")
    .doc(productId)
    .get();
  if (detailDoc.exists) {
    const result = extractPriceFromDoc(detailDoc.data());
    if (result) return result;
  }

  return null;
}

/**
 * Internal helper: extracts and normalises price data from a Firestore
 * document's data object.
 */
function extractPriceFromDoc(
  data: FirebaseFirestore.DocumentData | undefined
): ResolvedPrice | null {
  if (!data) return null;

  const basePrice = parsePriceToNumber(data.rawPrice || data.price);
  const discountPrice = parsePriceToNumber(data.discountPrice);

  // If there is a valid discount price that is less than the base price,
  // treat it as the effective price.
  if (discountPrice > 0 && basePrice > 0 && discountPrice < basePrice) {
    return {
      rawPrice: discountPrice,
      displayPrice: formatINR(discountPrice),
      rawOriginalPrice: basePrice,
      displayOriginalPrice: formatINR(basePrice),
    };
  }

  // If discountPrice exists but equals or exceeds basePrice, ignore it.
  // If only discountPrice exists (base is 0), use it as-is.
  if (discountPrice > 0 && basePrice <= 0) {
    return {
      rawPrice: discountPrice,
      displayPrice: formatINR(discountPrice),
    };
  }

  if (basePrice > 0) {
    return {
      rawPrice: basePrice,
      displayPrice: formatINR(basePrice),
    };
  }

  return null;
}
