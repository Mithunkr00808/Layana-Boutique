"use server";

import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

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

export async function getGuestId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get("guestId")?.value;
  if (existing) return existing;
  const id = crypto.randomUUID();
  cookieStore.set("guestId", id, { path: "/", httpOnly: true });
  return id;
}

export async function updateCartItemQuantity(id: string, newQuantity: number) {
  if (!process.env.FIREBASE_PROJECT_ID) {
    console.warn("No FIREBASE_PROJECT_ID found. Cannot update quantity in Firebase.");
    return false;
  }

  if (newQuantity <= 0) {
    return false;
  }

  try {
    const uid = await getUidFromSession();
    let docRef;
    if (uid) {
      docRef = adminDb.collection("users").doc(uid).collection("cart").doc(id);
    } else {
      const guestId = await getGuestId();
      docRef = adminDb.collection("guest-carts").doc(guestId).collection("items").doc(id);
    }

    await docRef.update({
      quantity: newQuantity,
    });

    revalidatePath("/cart");
    return true;
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    return false;
  }
}

export async function getCartItemQuantity(productId: string, size?: string) {
  if (!process.env.FIREBASE_PROJECT_ID) {
    return 0;
  }

  try {
    const uid = await getUidFromSession();
    const guestId = uid ? null : await getGuestId();

    const cartCollection = uid
      ? adminDb.collection("users").doc(uid).collection("cart")
      : adminDb.collection("guest-carts").doc(guestId as string).collection("items");

    const docId = `${productId}-${size || "onesize"}`;
    const docRef = cartCollection.doc(docId);
    const snap = await docRef.get();

    if (snap.exists) {
      return (snap.data()?.quantity as number | undefined) ?? 0;
    }
    return 0;
  } catch (error) {
    console.error("Error fetching cart item quantity:", error);
    return 0;
  }
}

export async function removeCartItem(id: string) {
  if (!process.env.FIREBASE_PROJECT_ID) {
    console.warn("No FIREBASE_PROJECT_ID found. Cannot remove cart item.");
    return false;
  }

  try {
    const uid = await getUidFromSession();
    let docRef;
    if (uid) {
      docRef = adminDb.collection("users").doc(uid).collection("cart").doc(id);
    } else {
      const guestId = await getGuestId();
      docRef = adminDb.collection("guest-carts").doc(guestId).collection("items").doc(id);
    }

    await docRef.delete();

    revalidatePath("/cart");
    return true;
  } catch (error) {
    console.error("Error removing cart item:", error);
    return false;
  }
}

export async function addCartItem(input: {
  productId: string;
  name: string;
  variant?: string;
  size?: string;
  price: number;
  priceDisplay?: string;
  image?: string;
  alt?: string;
  quantity?: number; // If provided, sets this exact quantity instead of incrementing
  originalPrice?: number;
  originalPriceDisplay?: string;
}) {
  if (!process.env.FIREBASE_PROJECT_ID) {
    console.warn("No FIREBASE_PROJECT_ID found. Cannot add cart item.");
    return { ok: false, reason: "env" as const };
  }

  try {
    const uid = await getUidFromSession();
    const guestId = uid ? null : await getGuestId();

    const cartCollection = uid
      ? adminDb.collection("users").doc(uid).collection("cart")
      : adminDb.collection("guest-carts").doc(guestId as string).collection("items");

    const docId = `${input.productId}-${input.size || "onesize"}`;
    const docRef = cartCollection.doc(docId);

    const desiredQty = input.quantity ?? 1;

    if (desiredQty <= 0) {
      // Remove item from cart
      await docRef.delete();
      revalidatePath("/cart");
      return { ok: true };
    }

    // Single write — no read needed
    await docRef.set(
      {
        id: docId,
        productId: input.productId,
        name: input.name,
        variant: input.variant || "",
        size: input.size || "",
        quantity: desiredQty,
        price: input.priceDisplay || `₹${input.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        rawPrice: input.price,
        image: input.image || "",
        alt: input.alt || input.name,
        originalPrice: input.originalPriceDisplay,
        rawOriginalPrice: input.originalPrice,
      },
      { merge: true }
    );

    revalidatePath("/cart");
    return { ok: true };
  } catch (error) {
    console.error("Error adding cart item:", error);
    return { ok: false, reason: "error" as const };
  }
}

export async function clearUserCart(uid?: string) {
  if (!process.env.FIREBASE_PROJECT_ID) {
    console.warn("No FIREBASE_PROJECT_ID found. Cannot clear cart.");
    return false;
  }

  try {
    const sessionUid = await getUidFromSession();
    if (!sessionUid) return false;
    if (uid && uid !== sessionUid) return false;

    const cartCollection = adminDb.collection("users").doc(sessionUid).collection("cart");
    const snapshot = await cartCollection.get();

    if (snapshot.empty) {
      revalidatePath("/cart");
      return true;
    }

    const batch = adminDb.batch();
    snapshot.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    revalidatePath("/cart");
    return true;
  } catch (error) {
    console.error("Error clearing user cart:", error);
    return false;
  }
}

export async function fetchCartItems() {
  const { getCartItemsForUser } = await import("@/lib/data");
  return await getCartItemsForUser();
}
