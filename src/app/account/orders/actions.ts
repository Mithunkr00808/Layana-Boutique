"use server";

import * as admin from "firebase-admin";
import { adminDb } from "@/lib/firebase/admin";
import { requireSessionUid } from "@/lib/auth/session-user";
import { getRazorpay } from "@/lib/razorpay";
import { revalidatePath } from "next/cache";
import { sendOrderStatusEmail } from "@/lib/email/actions";
import { captureTelemetryError } from "@/lib/telemetry";

export async function cancelUserOrder(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const uid = await requireSessionUid();

    const orderRef = adminDb.collection("orders").doc(orderId);
    const doc = await orderRef.get();

    if (!doc.exists) {
      return { success: false, error: "Order not found." };
    }

    const order = doc.data()!;

    if (order.userId !== uid) {
      return { success: false, error: "Unauthorized access: You don't own this order." };
    }

    const currentStatus = (order.status || "").toLowerCase();
    const validStatuses = ["paid", "processing"];
    if (!validStatuses.includes(currentStatus)) {
      return {
        success: false,
        error: "This order cannot be cancelled anymore as it has already moved past processing.",
      };
    }

    // 1. Process Financial Refund First
    const paymentId = order.razorpayPaymentId;
    let refundId = null;

    if (paymentId) {
      try {
        const rzp = getRazorpay();
        // amount is passed in currency subunits (paise for INR). We pass it fully exactly as it was charged.
        const refundResponse = await rzp.payments.refund(paymentId, { amount: order.amount });
        refundId = refundResponse.id;
      } catch (rzpError: any) {
        console.error("Razorpay refund failed:", rzpError);
        captureTelemetryError(rzpError, "razorpay_refund_failed", { orderId, paymentId });
        return {
          success: false,
          error:
            "We were unable to process the refund with our payment gateway at this exact moment. Please try again in a few minutes.",
        };
      }
    }

    // 2. Prepare Atomic Database Sync
    const batch = adminDb.batch();

    batch.update(orderRef, {
      status: "cancelled",
      refundId: refundId || null,
      cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 3. Restore Product Inventory Safely & Optimally
    if (order.items && Array.isArray(order.items)) {
      for (const item of order.items) {
        const quantityToRestore = item.quantity || 1;
        const targetProductId = item.productId || item.id.replace(/-[^-]+$/, "");

        const productRef = adminDb.collection("products").doc(targetProductId);
        batch.set(
          productRef,
          { quantity: admin.firestore.FieldValue.increment(quantityToRestore) },
          { merge: true }
        );

        const detailRef = adminDb.collection("productDetails").doc(targetProductId);
        batch.set(
          detailRef,
          { quantity: admin.firestore.FieldValue.increment(quantityToRestore) },
          { merge: true }
        );
      }
    }

    // 4. Commit Database Reversal
    await batch.commit();

    // 5. Dispatch Confirmation Email
    try {
      await sendOrderStatusEmail(orderId, "cancelled");
    } catch (err) {
      console.error("Cancel order email failed:", err);
      captureTelemetryError(err, "email_dispatch_failed", { orderId, type: "cancel" });
    }

    revalidatePath("/account/orders");
    return { success: true };
  } catch (error) {
    console.error("Cancel order error:", error);
    captureTelemetryError(error, "cancel_order_failed", { orderId });
    return { success: false, error: "An unexpected internal error occurred." };
  }
}
