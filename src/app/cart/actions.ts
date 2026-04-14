"use server";

import { adminDb } from "@/lib/firebase/admin";
import { getSessionUid } from "@/lib/auth/session-user";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getCartItemsForUser } from "@/lib/data";

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
    const uid = await getSessionUid();
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
    const uid = await getSessionUid();
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
    const uid = await getSessionUid();
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

import { FieldValue } from "firebase-admin/firestore";

export async function addCartItem(input: {
  productId: string;
  name: string;
  variant?: string;
  size?: string;
  price: number;
  priceDisplay?: string;
  image?: string;
  alt?: string;
  quantity?: number; // Sets how much to add (default 1)
  originalPrice?: number;
  originalPriceDisplay?: string;
}) {
  if (!process.env.FIREBASE_PROJECT_ID) {
    console.warn("No FIREBASE_PROJECT_ID found. Cannot add cart item.");
    return { ok: false, reason: "env" as const };
  }

  try {
    const uid = await getSessionUid();
    const guestId = uid ? null : await getGuestId();

    const cartCollection = uid
      ? adminDb.collection("users").doc(uid).collection("cart")
      : adminDb.collection("guest-carts").doc(guestId as string).collection("items");

    const docId = `${input.productId}-${input.size || "onesize"}`;
    const docRef = cartCollection.doc(docId);

    const incrementQty = input.quantity && input.quantity > 0 ? input.quantity : 1;

    // Single write — no read needed
    await docRef.set(
      {
        id: docId,
        productId: input.productId,
        name: input.name,
        variant: input.variant || "",
        size: input.size || "",
        quantity: FieldValue.increment(incrementQty),
        price: input.priceDisplay || `₹${input.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        rawPrice: input.price,
        image: input.image || "",
        alt: input.alt || input.name,
        originalPrice: input.originalPriceDisplay || null,
        rawOriginalPrice: input.originalPrice || null,
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
    const sessionUid = await getSessionUid();
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
  return await getCartItemsForUser();
}
