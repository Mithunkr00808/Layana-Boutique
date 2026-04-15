import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fulfillOrder } from "@/lib/orders";
import { addTelemetryBreadcrumb, captureTelemetryError } from "@/lib/telemetry";
import {
  checkRateLimit,
  getRateLimitKey,
  purgeExpiredRateLimitBuckets,
  rateLimitResponse,
} from "@/lib/security/rate-limit";

// ── Types ───────────────────────────────────────────────────────────────────

interface RazorpayOrderPaidPayload {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment: {
      entity: {
        id: string;
        order_id: string;
        status: string;
        amount: number;
        currency: string;
      };
    };
    order: {
      entity: {
        id: string;
        status: string;
        amount: number;
        receipt: string;
      };
    };
  };
}

const razorpayWebhookSchema = z.object({
  entity: z.string().optional(),
  account_id: z.string().optional(),
  event: z.string(),
  contains: z.array(z.string()).optional(),
  payload: z.object({
    payment: z.object({
      entity: z.object({
        id: z.string(),
        order_id: z.string(),
        status: z.string().optional(),
        amount: z.number().optional(),
        currency: z.string().optional(),
      }),
    }).optional(),
    order: z.object({
      entity: z.object({
        id: z.string().optional(),
        status: z.string().optional(),
        amount: z.number().optional(),
        receipt: z.string().optional(),
      }),
    }).optional(),
  }),
});

// ── Signature Verification ──────────────────────────────────────────────────

function verifyWebhookSignature(
  rawBody: string,
  receivedSignature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "hex"),
      Buffer.from(receivedSignature, "hex")
    );
  } catch {
    return false;
  }
}

// ── POST Handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  purgeExpiredRateLimitBuckets();
  // Keep webhook limit intentionally high to avoid disrupting gateway retries.
  const rateLimitKey = getRateLimitKey(request, "api:webhook:razorpay");
  const rateLimitResult = checkRateLimit(rateLimitKey, {
    keyPrefix: "api:webhook:razorpay",
    windowMs: 60_000,
    maxRequests: 300,
  });
  if (!rateLimitResult.allowed) {
    return rateLimitResponse(rateLimitResult);
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("RAZORPAY_WEBHOOK_SECRET is not configured");
    captureTelemetryError(
      new Error("Missing RAZORPAY_WEBHOOK_SECRET"),
      "webhook_razorpay_secret_missing"
    );
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  // Read the raw body for signature verification.
  // Razorpay sends the signature in the X-Razorpay-Signature header.
  const rawBody = await request.text();
  const receivedSignature = request.headers.get("x-razorpay-signature") ?? "";

  if (!receivedSignature) {
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 401 }
    );
  }

  // ── Verify Signature ────────────────────────────────────────────────
  const isValid = verifyWebhookSignature(rawBody, receivedSignature, webhookSecret);

  if (!isValid) {
    console.warn("Razorpay webhook: invalid signature received");
    addTelemetryBreadcrumb("razorpay webhook invalid signature", "webhook.razorpay");
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 }
    );
  }

  // ── Parse Payload ───────────────────────────────────────────────────
  let payload: RazorpayOrderPaidPayload;

  try {
    const parsed = razorpayWebhookSchema.safeParse(JSON.parse(rawBody));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload shape" },
        { status: 400 }
      );
    }
    payload = parsed.data as RazorpayOrderPaidPayload;
  } catch {
    console.error("Razorpay webhook: failed to parse JSON body");
    captureTelemetryError(new Error("Invalid webhook JSON"), "webhook_razorpay_json_parse_failed");
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }

  // ── Handle Events ───────────────────────────────────────────────────
  // We only process `order.paid` events. All other events are acknowledged
  // with a 200 to prevent Razorpay from retrying them.
  if (payload.event !== "order.paid") {
    addTelemetryBreadcrumb("razorpay webhook ignored event", "webhook.razorpay", {
      event: payload.event,
    });
    return NextResponse.json({ status: "ignored", event: payload.event });
  }

  const paymentEntity = payload.payload?.payment?.entity;
  const orderId = paymentEntity?.order_id;
  const paymentId = paymentEntity?.id;

  if (!orderId || !paymentId) {
    console.error("Razorpay webhook: missing order_id or payment_id in payload");
    captureTelemetryError(
      new Error("Incomplete order.paid payload"),
      "webhook_razorpay_incomplete_payload"
    );
    return NextResponse.json(
      { error: "Incomplete payload" },
      { status: 400 }
    );
  }

  // ── Fulfill Order ───────────────────────────────────────────────────
  // fulfillOrder is idempotent — if the client-side verifyPayment already
  // processed this order, it will simply return { alreadyFulfilled: true }.
  try {
    addTelemetryBreadcrumb("razorpay webhook fulfillment started", "webhook.razorpay", {
      orderId,
      paymentId,
    });
    const result = await fulfillOrder(orderId, paymentId);

    if (result.success) {
      return NextResponse.json({
        status: "fulfilled",
        orderId: result.orderId,
        alreadyFulfilled: result.alreadyFulfilled,
      });
    }

    // Non-retryable errors (e.g. pending order not found because it was
    // already cleaned up). Return 200 to prevent infinite retries.
    console.warn(`Razorpay webhook: fulfillment returned error for ${orderId}:`, result.error);
    addTelemetryBreadcrumb("razorpay webhook non-retryable fulfillment error", "webhook.razorpay", {
      orderId,
    });
    return NextResponse.json({
      status: "error",
      error: result.error,
    });
  } catch (error) {
    // Server error — return 500 so Razorpay will retry
    console.error("Razorpay webhook: unexpected error during fulfillment:", error);
    captureTelemetryError(error, "webhook_razorpay_fulfillment_unexpected_error", {
      orderId,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
