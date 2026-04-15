import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { csrfRejectedResponse, isSameOriginRequest } from "@/lib/security/csrf";
import {
  checkRateLimit,
  getRateLimitKey,
  purgeExpiredRateLimitBuckets,
  rateLimitResponse,
} from "@/lib/security/rate-limit";

type GuestCartItem = {
  id: string;
  productId: string;
  size?: string;
  quantity: number;
};

export async function POST(request: NextRequest) {
  purgeExpiredRateLimitBuckets();
  const rateLimitKey = getRateLimitKey(request, "api:cart:migrate");
  const rateLimitResult = checkRateLimit(rateLimitKey, {
    keyPrefix: "api:cart:migrate",
    windowMs: 60_000,
    maxRequests: 30,
  });
  if (!rateLimitResult.allowed) {
    return rateLimitResponse(rateLimitResult);
  }

  if (!isSameOriginRequest(request)) {
    return csrfRejectedResponse();
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  const guestCartCookie = cookieStore.get("guestCart")?.value;

  if (!sessionCookie) {
    return NextResponse.json({ migrated: false, reason: "no-session" });
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = decoded?.uid;
    if (!uid) {
      return NextResponse.json({ migrated: false, reason: "no-uid" });
    }

    let guestItems: GuestCartItem[] = [];
    if (guestCartCookie) {
      try {
        guestItems = JSON.parse(guestCartCookie);
      } catch {}
    }

    if (!Array.isArray(guestItems) || guestItems.length === 0) {
      const res = NextResponse.json({ migrated: false, reason: "empty-guest" });
      res.cookies.set({ name: "guestCart", value: "", maxAge: -1, path: "/" });
      return res;
    }

    await adminDb.runTransaction(async (txn) => {
      const targetRefs = guestItems.map((item) => ({
        item,
        targetRef: adminDb.collection("users").doc(uid).collection("cart").doc(item.id),
        productRef: adminDb.collection("products").doc(item.productId),
      }));

      const targetSnaps = await Promise.all(targetRefs.map((t) => txn.get(t.targetRef)));
      const productSnaps = await Promise.all(targetRefs.map((t) => txn.get(t.productRef)));

      for (let i = 0; i < targetRefs.length; i++) {
        const { item, targetRef } = targetRefs[i];
        if (!item.id || !item.productId || typeof item.quantity !== "number") continue;

        const existing = targetSnaps[i];
        const existingQty = (existing.exists ? (existing.data()?.quantity as number | undefined) : 0) ?? 0;
        const newQty = Math.max(1, existingQty + item.quantity);

        if (existing.exists) {
          txn.set(targetRef, { quantity: newQty }, { merge: true });
        } else {
          const productSnap = productSnaps[i];
          if (productSnap.exists) {
            const data = productSnap.data()!;
            const priceStr = data.price
              ? `₹${parseFloat(data.price.replace(/[^\d.]/g, "")).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}`
              : "₹0.00";
            const rawPrice = data.price ? parseFloat(data.price.replace(/[^\d.]/g, "")) : 0;

            txn.set(targetRef, {
              id: item.id,
              productId: item.productId,
              name: data.name || "Unknown Item",
              variant: "",
              size: item.size || "",
              quantity: newQty,
              price: priceStr,
              rawPrice: rawPrice,
              image: data.image || "",
              alt: data.alt || data.name || "",
              originalPrice: data.discountPrice ? data.price : null,
              rawOriginalPrice: data.discountPrice ? parseFloat(data.price.replace(/[^\d.]/g, "")) : null,
            });
          }
        }
      }
    });

    const res = NextResponse.json({ migrated: true, moved: guestItems.length });
    res.cookies.set({ name: "guestCart", value: "", maxAge: -1, path: "/" });
    res.cookies.set({ name: "guestId", value: "", maxAge: -1, path: "/" });
    return res;
  } catch (error) {
    console.error("Guest cart migration failed:", error);
    return NextResponse.json({ migrated: false, reason: "error" }, { status: 500 });
  }
}
