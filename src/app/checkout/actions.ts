/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import crypto from "crypto";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import { getSessionUid } from "@/lib/auth/session-user";
import { getUserAddressById } from "@/lib/addresses";
import { getRazorpay } from "@/lib/razorpay";
import { fulfillOrder } from "@/lib/orders";
import { addTelemetryBreadcrumb, captureTelemetryError } from "@/lib/telemetry";
import { resolveProductPrice, formatINR } from "@/lib/priceUtils";
import type { CartItem } from "@/lib/data";

type OrderResponse =
  | { orderId: string; amount: number; currency: string }
  | { error: string };

type VerifyResponse =
  | { success: true; orderId: string }
  | { success: false; error: string };

const createOrderInputSchema = z.object({
  addressId: z.string().trim().min(1).max(128),
  shippingMethod: z.enum(["standard"]).default("standard"),
});

const verifyPaymentInputSchema = z.object({
  razorpay_order_id: z.string().trim().min(1).max(128),
  razorpay_payment_id: z.string().trim().min(1).max(128),
  razorpay_signature: z
    .string()
    .trim()
    .regex(/^[a-fA-F0-9]{64}$/, "Invalid signature format"),
  addressId: z.string().trim().min(1).max(128),
});

// parsePriceToNumber is imported from @/lib/priceUtils

function resolveCartProductId(
  data: Partial<CartItem> & { productId?: string },
  docId: string
): string {
  if (typeof data.productId === "string" && data.productId.trim()) {
    return data.productId.trim();
  }

  const rawId =
    (typeof data.id === "string" && data.id.trim() ? data.id.trim() : docId) || docId;

  // Legacy cart ids are often `${productId}-${size}`. Recover product id safely.
  const normalizedSize = (data.size || "").trim().toLowerCase();
  if (normalizedSize) {
    const sizeSuffix = `-${normalizedSize}`;
    if (rawId.toLowerCase().endsWith(sizeSuffix)) {
      return rawId.slice(0, -sizeSuffix.length);
    }
  }

  return rawId.replace(/-(onesize|one-size|os)$/i, "");
}

async function getAvailableStock(productId: string): Promise<number> {
  const [productDoc, detailDoc] = await Promise.all([
    adminDb.collection("products").doc(productId).get(),
    adminDb.collection("productDetails").doc(productId).get(),
  ]);

  const productQty =
    productDoc.exists && typeof productDoc.data()?.quantity === "number"
      ? productDoc.data()!.quantity
      : 0;
  const detailQty =
    detailDoc.exists && typeof detailDoc.data()?.quantity === "number"
      ? detailDoc.data()!.quantity
      : 0;

  return Math.max(productQty, detailQty);
}

async function getVerifiedPrice(productId: string): Promise<number> {
  const resolved = await resolveProductPrice(productId);
  return resolved?.rawPrice ?? 0;
}

async function getVerifiedCart(uid: string): Promise<{ items: CartItem[]; subtotal: number }> {
  const snapshot = await adminDb.collection("users").doc(uid).collection("cart").get();
  if (snapshot.empty) return { items: [], subtotal: 0 };

  const itemsResults = await Promise.all(
    snapshot.docs.map(async (doc) => {
      const data = doc.data() as Partial<CartItem> & { productId?: string };

      const productId = resolveCartProductId(data, doc.id);
      
      // Security: Strictly verify price from server, no client fallback
      const verifiedPrice = await getVerifiedPrice(productId);
      if (verifiedPrice <= 0) return null;

      // Best-effort stock check
      const stock = await getAvailableStock(productId);
      const quantity = data.quantity ?? 1;

      // If stock is 0 but item is in cart, we filter it out to prevent purchase
      if (stock <= 0) return null;

      const finalPrice = verifiedPrice;
      return {
        id: data.id ?? doc.id,
        productId: productId,
        name: data.name ?? "Item",
        variant: data.variant ?? "",
        size: data.size ?? "",
        quantity: Math.min(quantity, stock), // Cap at available stock
        price: formatINR(finalPrice),
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
};

export async function createOrder(
  addressId: string,
  shippingMethod: "standard" = "standard"
): Promise<OrderResponse> {
  if (!process.env.FIREBASE_PROJECT_ID) {
    return { error: "Firebase is not configured" };
  }

  try {
    const parsedInput = createOrderInputSchema.safeParse({ addressId, shippingMethod });
    if (!parsedInput.success) {
      return { error: "Invalid checkout input" };
    }
    const input = parsedInput.data;

    const uid = await getSessionUid();
    if (!uid) {
      return { error: "Unauthenticated" };
    }
    addTelemetryBreadcrumb("checkout createOrder started", "checkout", { uid });

    const { items, subtotal } = await getVerifiedCart(uid);
    if (!items.length || subtotal <= 0) {
      return { error: "Cart is empty or items are no longer available" };
    }

    // Security: Validate address existence and ownership before creating order.
    // Supports both address models during migration:
    //   1) users/{uid}/addresses/{addressId}
    //   2) users/{uid}.addresses[]
    const address = await getUserAddressById(uid, input.addressId);
    if (!address) {
      return { error: "Delivery address not found. Please select a valid address." };
    }

    // Housekeeping: clean up stale pending orders for this user.
    // These are created when a user starts checkout but abandons the Razorpay popup.
    // Without cleanup, the pendingOrders collection grows indefinitely.
    try {
      const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const allPending = await adminDb
        .collection("pendingOrders")
        .where("uid", "==", uid)
        .limit(20) // avoid fetching too many
        .get();

      // Perform the time filter in memory to avoid requiring a composite index on [uid, createdAt]
      const staleDocs = allPending.docs.filter((doc) => {
        const data = doc.data();
        return data.createdAt && data.createdAt < thirtyMinAgo;
      });

      if (staleDocs.length > 0) {
        const cleanupBatch = adminDb.batch();
        staleDocs.forEach((doc) => cleanupBatch.delete(doc.ref));
        await cleanupBatch.commit();
      }
    } catch (cleanupError) {
      // Non-critical — log and continue with order creation
      console.warn("Stale pending order cleanup failed (non-critical):", cleanupError);
    }

    const shippingCost = SHIPPING_COSTS[input.shippingMethod] ?? 0;
    const total = subtotal + shippingCost;
    const amountPaise = Math.round(total * 100);

    const order = await getRazorpay().orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    } as any);

    await adminDb.collection("pendingOrders").doc(order.id).set({
      uid,
      items,
      subtotal,
      shippingCost,
      shippingMethod: input.shippingMethod,
      amount: order.amount,
      currency: order.currency,
      addressId: input.addressId,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    return { orderId: order.id, amount: Number(order.amount), currency: String(order.currency) };
  } catch (error) {
    console.error("Failed to create Razorpay order:", error);
    captureTelemetryError(error, "checkout_create_order_failed");
    return { error: "Failed to create order. Please try again later." };
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
    const parsedInput = verifyPaymentInputSchema.safeParse(data);
    if (!parsedInput.success) {
      return { success: false, error: "Invalid payment payload" };
    }
    const input = parsedInput.data;

    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error("RAZORPAY_KEY_SECRET is not configured");
      captureTelemetryError(new Error("Missing RAZORPAY_KEY_SECRET"), "checkout_missing_key_secret");
      return { success: false, error: "Payment verification unavailable" };
    }

    const uid = await getSessionUid();
    if (!uid) return { success: false, error: "Unauthenticated" };
    addTelemetryBreadcrumb("checkout verifyPayment started", "checkout", {
      uid,
      orderId: input.razorpay_order_id,
    });

    // ── HMAC Signature Verification ───────────────────────────────────
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
      .update(`${input.razorpay_order_id}|${input.razorpay_payment_id}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const receivedBuffer = Buffer.from(input.razorpay_signature, "hex");
    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return { success: false, error: "Invalid signature" };
    }

    // ── Ownership Verification ────────────────────────────────────────
    // Verify the pending order belongs to this user before fulfilling.
    const pendingRef = adminDb.collection("pendingOrders").doc(input.razorpay_order_id);
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
      input.razorpay_order_id,
      input.razorpay_payment_id,
      input.razorpay_signature
    );

    if (result.success) {
      addTelemetryBreadcrumb("checkout verifyPayment fulfilled", "checkout", {
        orderId: input.razorpay_order_id,
      });
      return { success: true, orderId: result.orderId };
    }

    return { success: false, error: result.error };
  } catch (error) {
    console.error("Failed to verify Razorpay payment:", error);
    captureTelemetryError(error, "checkout_verify_payment_failed", {
      orderId: data.razorpay_order_id,
    });
    return { success: false, error: "Verification failed" };
  }
}
