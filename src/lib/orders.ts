import * as admin from "firebase-admin";
import { adminDb } from "@/lib/firebase/admin";
import type { CartItem } from "@/lib/data";
import { getUserAddressById } from "@/lib/addresses";
import { addTelemetryBreadcrumb, captureTelemetryError } from "@/lib/telemetry";
import { sendOrderConfirmationEmail } from "@/lib/email/actions";

// ── Types ───────────────────────────────────────────────────────────────────

interface PendingOrderData {
  uid: string;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  shippingMethod: string;
  amount: number; // paise
  currency: string;
  addressId: string;
  status: string;
  createdAt: string;
}

export type FulfillResult =
  | { success: true; orderId: string; alreadyFulfilled: boolean }
  | { success: false; error: string };

interface FulfillmentLockData {
  orderId?: string;
  status?: "fulfilled";
}

function isAlreadyExistsError(error: unknown): boolean {
  const code = (error as { code?: string | number })?.code;
  const message = String((error as { message?: string })?.message || "").toLowerCase();
  return code === "already-exists" || code === 6 || message.includes("already exists");
}

// ── Core Fulfillment ────────────────────────────────────────────────────────

/**
 * Fulfills a Razorpay order atomically. This function is designed to be called
 * from both the client-initiated `verifyPayment` Server Action AND the
 * asynchronous Razorpay Webhook. It is fully idempotent — calling it twice
 * with the same orderId will safely return the existing order.
 *
 * Operations performed in a single Firestore batch:
 *  1. Create the final `orders` document.
 *  2. Deduct inventory from `products` and `productDetails` collections.
 *  3. Clear the user's cart.
 *  4. Delete the temporary `pendingOrders` document.
 */
export async function fulfillOrder(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature?: string
): Promise<FulfillResult> {
  addTelemetryBreadcrumb("fulfillOrder invoked", "orders", {
    razorpayOrderId,
    hasSignature: Boolean(razorpaySignature),
  });
  const fulfillmentRef = adminDb.collection("orderFulfillments").doc(razorpayOrderId);
  const pendingRef = adminDb.collection("pendingOrders").doc(razorpayOrderId);

  // ── Idempotency Guard ─────────────────────────────────────────────────
  // If this order was already fulfilled (e.g. webhook fired after client
  // already completed), return success immediately without touching the DB.
  const existingSnapshot = await adminDb
    .collection("orders")
    .where("razorpayOrderId", "==", razorpayOrderId)
    .limit(1)
    .get();

  if (!existingSnapshot.empty) {
    return {
      success: true,
      orderId: existingSnapshot.docs[0].id,
      alreadyFulfilled: true,
    };
  }

  // ── Load Pending Order ────────────────────────────────────────────────
  const pendingDoc = await pendingRef.get();

  if (!pendingDoc.exists) {
    const fulfillmentDoc = await fulfillmentRef.get().catch(() => null);
    const fulfillmentData = fulfillmentDoc?.data() as FulfillmentLockData | undefined;
    if (fulfillmentData?.orderId) {
      return {
        success: true,
        orderId: fulfillmentData.orderId,
        alreadyFulfilled: true,
      };
    }

    // Edge case: pending doc already cleaned up but order wasn't found above.
    // This can happen if Firestore eventually-consistent reads lag slightly.
    // Re-check orders one more time before failing.
    const retrySnapshot = await adminDb
      .collection("orders")
      .where("razorpayOrderId", "==", razorpayOrderId)
      .limit(1)
      .get();

    if (!retrySnapshot.empty) {
      return {
        success: true,
        orderId: retrySnapshot.docs[0].id,
        alreadyFulfilled: true,
      };
    }

    return { success: false, error: "Pending order not found" };
  }

  const pending = pendingDoc.data() as PendingOrderData;

  // ── Amount Cross-Validation ───────────────────────────────────────────
  // Security: Verify that the amount actually captured by Razorpay matches
  // the amount we expected in the pending order.
  try {
    const { getRazorpay } = await import("@/lib/razorpay");
    const rzp = getRazorpay();
    const payment = await rzp.payments.fetch(razorpayPaymentId);
    
    // Amount in Razorpay is returned in paise (or subunits of currency)
    // and must strictly match the pending order amount.
    if (Number(payment.amount) !== pending.amount) {
      const errorMsg = `Amount mismatch: expected ${pending.amount}, got ${payment.amount}`;
      console.error("Fulfillment rejected:", errorMsg);
      captureTelemetryError(new Error(errorMsg), "orders_fulfillment_amount_mismatch", {
        razorpayOrderId,
        razorpayPaymentId,
        expected: pending.amount,
        received: payment.amount
      });
      return { success: false, error: "Payment amount does not match order amount" };
    }
  } catch (error) {
    console.error("Failed to fetch Razorpay payment details:", error);
    return { success: false, error: "Unable to verify payment details" };
  }

  // ── Resolve Address ───────────────────────────────────────────────────
  const address = await getUserAddressById(pending.uid, pending.addressId);

  // ── Recalculate Totals ────────────────────────────────────────────────
  const subtotal = pending.items.reduce(
    (acc, item) => acc + item.rawPrice * item.quantity,
    0
  );
  const shippingCost = pending.shippingCost ?? 0;
  const total = subtotal + shippingCost;

  // ── Atomic Batch Write ────────────────────────────────────────────────
  const batch = adminDb.batch();

  // 1. Create the final order document
  const orderRef = adminDb.collection("orders").doc();
  batch.set(orderRef, {
    userId: pending.uid,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature: razorpaySignature ?? null,
    status: "paid",
    items: pending.items,
    amount: pending.amount,
    subtotal,
    shipping: shippingCost,
    total,
    currency: pending.currency ?? "INR",
    receipt: razorpayPaymentId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    address,
  });
  batch.create(fulfillmentRef, {
    razorpayOrderId,
    orderId: orderRef.id,
    status: "fulfilled",
    paymentId: razorpayPaymentId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // 2. Deduct inventory from `products` and `productDetails` (if docs exist)
  for (const item of pending.items) {
    const targetProductId = item.productId || item.id.replace(/-[^-]+$/, "");
    
    // Process products collection
    const productRef = adminDb.collection("products").doc(targetProductId);
    const productDoc = await productRef.get();
    if (productDoc.exists) {
      const currentQty = (productDoc.data()?.quantity as number) || 0;
      const newQty = Math.max(0, currentQty - item.quantity);
      batch.update(productRef, { quantity: newQty });
    }

    // Process productDetails collection
    const detailRef = adminDb.collection("productDetails").doc(targetProductId);
    const detailDoc = await detailRef.get();
    if (detailDoc.exists) {
      const currentQty = (detailDoc.data()?.quantity as number) || 0;
      const newQty = Math.max(0, currentQty - item.quantity);
      batch.update(detailRef, { quantity: newQty });
    }
  }

  // 3. Delete the pending order
  batch.delete(pendingRef);

  // Commit all writes atomically
  try {
    await batch.commit();
  } catch (error) {
    if (isAlreadyExistsError(error)) {
      const fulfillmentDoc = await fulfillmentRef.get().catch(() => null);
      const fulfillmentData = fulfillmentDoc?.data() as FulfillmentLockData | undefined;
      if (fulfillmentData?.orderId) {
        return {
          success: true,
          orderId: fulfillmentData.orderId,
          alreadyFulfilled: true,
        };
      }

      const retrySnapshot = await adminDb
        .collection("orders")
        .where("razorpayOrderId", "==", razorpayOrderId)
        .limit(1)
        .get();
      if (!retrySnapshot.empty) {
        return {
          success: true,
          orderId: retrySnapshot.docs[0].id,
          alreadyFulfilled: true,
        };
      }
    }

    captureTelemetryError(error, "orders_fulfillment_batch_commit_failed", {
      razorpayOrderId,
    });
    throw error;
  }

  // ── Cart Cleanup (non-critical) ───────────────────────────────────────
  // Done outside the batch because cart cleanup failure should not
  // roll back the order. The cart will naturally be empty on next visit.
  try {
    const cartSnapshot = await adminDb
      .collection("users")
      .doc(pending.uid)
      .collection("cart")
      .get();

    if (!cartSnapshot.empty) {
      const cartBatch = adminDb.batch();
      cartSnapshot.forEach((doc) => cartBatch.delete(doc.ref));
      await cartBatch.commit();
    }
  } catch (cartError) {
    // Log but don't fail — order is already secured
    console.warn("Cart cleanup failed (non-critical):", cartError);
    captureTelemetryError(cartError, "orders_cart_cleanup_failed", {
      razorpayOrderId,
      uid: pending.uid,
    });
  }

  // ── Dispatch Confirmation Email ─────
  // We explicitly await this. In Server Actions (and serverless environments),
  // floating promises are often aggressively terminated when the response returns.
  try {
    await sendOrderConfirmationEmail(orderRef.id);
  } catch (err) {
    console.error("Email dispatch failed:", err);
    captureTelemetryError(err, "email_dispatch_failed", { orderId: orderRef.id });
  }

  return {
    success: true,
    orderId: orderRef.id,
    alreadyFulfilled: false,
  };
}
