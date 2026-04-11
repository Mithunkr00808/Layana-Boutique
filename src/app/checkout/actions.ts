/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import crypto from "crypto";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { razorpay } from "@/lib/razorpay";
import { fulfillOrder } from "@/lib/orders";
import type { CartItem } from "@/lib/data";

type OrderResponse =
  | { orderId: string; amount: number; currency: string }
  | { error: string };

type VerifyResponse =
  | { success: true; orderId: string }
  | { success: false; error: string };

async function getUidFromSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decoded?.uid ?? null;
  } catch (error) {
    console.error("Failed to verify session cookie:", error);
    return null;
  }
}

function parsePriceToNumber(price: unknown): number {
  if (typeof price === "number") return price;
  if (typeof price === "string") {
    const numeric = price.replace(/[^0-9.]/g, "");
    const value = parseFloat(numeric);
    return Number.isNaN(value) ? 0 : value;
  }
  return 0;
}

async function getVerifiedPrice(productId: string): Promise<number> {
  const productDoc = await adminDb.collection("products").doc(productId).get();
  if (productDoc.exists) {
    const data = productDoc.data();
    // Prioritize discountPrice if available, then fall back to price/rawPrice
    const price = parsePriceToNumber(data?.discountPrice || data?.rawPrice || data?.price);
    if (price > 0) return price;
  }

  const detailDoc = await adminDb.collection("productDetails").doc(productId).get();
  if (detailDoc.exists) {
    const data = detailDoc.data();
    const price = parsePriceToNumber(data?.discountPrice || data?.rawPrice || data?.price);
    if (price > 0) return price;
  }

  return 0;
}

async function getVerifiedCart(uid: string): Promise<{ items: CartItem[]; subtotal: number }> {
  const snapshot = await adminDb.collection("users").doc(uid).collection("cart").get();
  if (snapshot.empty) return { items: [], subtotal: 0 };

  const itemsResults = await Promise.all(
    snapshot.docs.map(async (doc) => {
      const data = doc.data() as Partial<CartItem> & { productId?: string };
      
      // The cart doc ID is a composite key (e.g. "product-abc-onesize"),
      // so we must use the stored productId field for product lookups.
      const productId = data.productId || data.id || doc.id;
      
      // Security: Strictly verify price from server, no client fallback
      const verifiedPrice = await getVerifiedPrice(productId);
      if (verifiedPrice <= 0) return null;

      // Best-effort stock check
      const productDoc = await adminDb.collection("products").doc(productId).get();
      const stock = productDoc.exists ? (productDoc.data()?.quantity ?? 0) : 0;
      const quantity = data.quantity ?? 1;

      // If stock is 0 but item is in cart, we filter it out to prevent purchase
      if (stock <= 0) return null;

      const finalPrice = verifiedPrice;
      return {
        id: data.id ?? doc.id,
        name: data.name ?? "Item",
        variant: data.variant ?? "",
        size: data.size ?? "",
        quantity: Math.min(quantity, stock), // Cap at available stock
        price: `₹${finalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        rawPrice: finalPrice,
        image: data.image ?? "",
        alt: data.alt ?? "",
      } as CartItem;
    })
  );

  const items = itemsResults.filter((item): item is CartItem => item !== null);
  const subtotal = items.reduce((acc, item) => acc + item.rawPrice * item.quantity, 0);
  return { items, subtotal };
}

const SHIPPING_COSTS: Record<string, number> = {
  standard: 0,
  express: 250,
};

export async function createOrder(
  addressId: string,
  shippingMethod: "standard" | "express" = "standard"
): Promise<OrderResponse> {
  if (!process.env.FIREBASE_PROJECT_ID) {
    return { error: "Firebase is not configured" };
  }

  try {
    const uid = await getUidFromSession();
    if (!uid) {
      return { error: "Unauthenticated" };
    }

    const { items, subtotal } = await getVerifiedCart(uid);
    if (!items.length || subtotal <= 0) {
      return { error: "Cart is empty or items are no longer available" };
    }

    // Security: Validate address existence and ownership before creating order
    const userDoc = await adminDb.collection("users").doc(uid).get();
    const userData = userDoc.data();
    const addresses = (userData?.addresses as any[]) || [];
    const addressExists = addresses.some((addr) => addr.id === addressId);

    if (!addressExists) {
      return { error: "Delivery address not found. Please select a valid address." };
    }

    const shippingCost = SHIPPING_COSTS[shippingMethod] ?? 0;
    const total = subtotal + shippingCost;
    const amountPaise = Math.round(total * 100);

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    } as any);

    await adminDb.collection("pendingOrders").doc(order.id).set({
      uid,
      items,
      subtotal,
      shippingCost,
      shippingMethod,
      amount: order.amount,
      currency: order.currency,
      addressId,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    return { orderId: order.id, amount: Number(order.amount), currency: String(order.currency) };
  } catch (error) {
    console.error("Failed to create Razorpay order:", error);
    return { error: "Failed to create order" };
  }
}

export async function verifyPayment(data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  addressId: string;
}): Promise<VerifyResponse> {
  if (!process.env.FIREBASE_PROJECT_ID) {
    return { success: false, error: "Firebase is not configured" };
  }

  try {
    const uid = await getUidFromSession();
    if (!uid) return { success: false, error: "Unauthenticated" };

    // ── HMAC Signature Verification ───────────────────────────────────
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
      .update(`${data.razorpay_order_id}|${data.razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== data.razorpay_signature) {
      return { success: false, error: "Invalid signature" };
    }

    // ── Ownership Verification ────────────────────────────────────────
    // Verify the pending order belongs to this user before fulfilling.
    const pendingRef = adminDb.collection("pendingOrders").doc(data.razorpay_order_id);
    const pendingDoc = await pendingRef.get();

    if (pendingDoc.exists) {
      const pending = pendingDoc.data();
      if (pending?.uid && pending.uid !== uid) {
        return { success: false, error: "Order does not belong to user" };
      }
    }

    // ── Delegate to Centralized Fulfillment Core ──────────────────────
    // fulfillOrder is idempotent — safe to call even if the webhook
    // already processed this order. It handles:
    //   • Idempotency guard (returns existing order if already fulfilled)
    //   • Atomic batch: order creation + inventory deduction + pending cleanup
    //   • Graceful cart cleanup (non-critical, won't roll back on failure)
    const result = await fulfillOrder(
      data.razorpay_order_id,
      data.razorpay_payment_id,
      data.razorpay_signature
    );

    if (result.success) {
      return { success: true, orderId: result.orderId };
    }

    return { success: false, error: result.error };
  } catch (error) {
    console.error("Failed to verify Razorpay payment:", error);
    return { success: false, error: "Verification failed" };
  }
}
