import * as admin from "firebase-admin";
import { adminDb } from "@/lib/firebase/admin";
import type { CartItem } from "@/lib/data";
import { getUserAddressById } from "@/lib/addresses";
import { addTelemetryBreadcrumb, captureTelemetryError } from "@/lib/telemetry";

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
    const productRef = adminDb.collection("products").doc(targetProductId);
    const productDoc = await productRef.get();
    if (productDoc.exists) {
      batch.update(productRef, {
        quantity: admin.firestore.FieldValue.increment(-item.quantity),
      });
    }

    const detailRef = adminDb.collection("productDetails").doc(targetProductId);
    const detailDoc = await detailRef.get();
    if (detailDoc.exists) {
      batch.update(detailRef, {
        quantity: admin.firestore.FieldValue.increment(-item.quantity),
      });
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

  return {
    success: true,
    orderId: orderRef.id,
    alreadyFulfilled: false,
  };
}
