"use server";

import { adminDb } from "@/lib/firebase/admin";
import { getSessionUid } from "@/lib/auth/session-user";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getCartItemsForUser } from "@/lib/data";
import { FieldValue } from "firebase-admin/firestore";

interface GuestCartItem {
  id: string;
  productId: string;
  size: string;
  quantity: number;
}

export async function getGuestId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get("guestId")?.value;
  if (existing) return existing;
  const id = crypto.randomUUID();
  cookieStore.set("guestId", id, { path: "/", httpOnly: true });
  return id;
}

export async function getGuestCartCookie(): Promise<GuestCartItem[]> {
  const cookieStore = await cookies();
  const val = cookieStore.get("guestCart")?.value;
  if (!val) return [];
  try {
    return JSON.parse(val) as GuestCartItem[];
  } catch {
    return [];
  }
}

async function setGuestCartCookie(items: GuestCartItem[]) {
  const cookieStore = await cookies();
  cookieStore.set("guestCart", JSON.stringify(items), {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function updateCartItemQuantity(id: string, newQuantity: number): Promise<{ success: boolean; isGuest: boolean }> {
  if (newQuantity <= 0) return { success: false, isGuest: false };

  try {
    const uid = await getSessionUid();
    
    if (uid) {
      if (!process.env.FIREBASE_PROJECT_ID) return { success: false, isGuest: false };
      const docRef = adminDb.collection("users").doc(uid).collection("cart").doc(id);
      await docRef.update({ quantity: newQuantity });
    } else {
      const items = await getGuestCartCookie();
      const idx = items.findIndex(i => i.id === id);
      if (idx !== -1) {
        items[idx].quantity = newQuantity;
        await setGuestCartCookie(items);
      }
    }

    revalidatePath("/cart");
    return { success: true, isGuest: !uid };
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    return { success: false, isGuest: false };
  }
}

export async function getCartItemQuantity(productId: string, size?: string) {
  try {
    const uid = await getSessionUid();
    const docId = `${productId}-${size || "onesize"}`;

    if (uid) {
      if (!process.env.FIREBASE_PROJECT_ID) return 0;
      const docRef = adminDb.collection("users").doc(uid).collection("cart").doc(docId);
      const snap = await docRef.get();
      if (snap.exists) return (snap.data()?.quantity as number) ?? 0;
      return 0;
    } else {
      const items = await getGuestCartCookie();
      const item = items.find(i => i.id === docId);
      return item?.quantity ?? 0;
    }
  } catch (error) {
    console.error("Error fetching cart item quantity:", error);
    return 0;
  }
}

export async function removeCartItem(id: string): Promise<{ success: boolean; isGuest: boolean }> {
  try {
    const uid = await getSessionUid();
    
    if (uid) {
      if (!process.env.FIREBASE_PROJECT_ID) return { success: false, isGuest: false };
      const docRef = adminDb.collection("users").doc(uid).collection("cart").doc(id);
      await docRef.delete();
    } else {
      let items = await getGuestCartCookie();
      items = items.filter(i => i.id !== id);
      await setGuestCartCookie(items);
    }

    revalidatePath("/cart");
    return { success: true, isGuest: !uid };
  } catch (error) {
    console.error("Error removing cart item:", error);
    return { success: false, isGuest: false };
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
  quantity?: number;
  originalPrice?: number;
  originalPriceDisplay?: string;
}) {
  try {
    const uid = await getSessionUid();
    const docId = `${input.productId}-${input.size || "onesize"}`;
    const incrementQty = input.quantity && input.quantity > 0 ? input.quantity : 1;

    if (uid) {
      if (!process.env.FIREBASE_PROJECT_ID) return { ok: false, reason: "env" as const, isGuest: false };
      const docRef = adminDb.collection("users").doc(uid).collection("cart").doc(docId);
      
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
    } else {
      const items = await getGuestCartCookie();
      const existing = items.find(i => i.id === docId);
      
      if (existing) {
        existing.quantity += incrementQty;
      } else {
        items.push({
          id: docId,
          productId: input.productId,
          size: input.size || "",
          quantity: incrementQty
        });
      }
      
      await setGuestCartCookie(items);
    }

    revalidatePath("/cart");
    return { ok: true, isGuest: !uid };
  } catch (error) {
    console.error("Error adding cart item:", error);
    return { ok: false, reason: "error" as const, isGuest: false };
  }
}

export async function clearUserCart(uid?: string) {
  if (!process.env.FIREBASE_PROJECT_ID) return false;

  try {
    const sessionUid = await getSessionUid();
    if (!sessionUid) return false;
    if (uid && uid !== sessionUid) return false;

    const cartCollection = adminDb.collection("users").doc(sessionUid).collection("cart");
    const snapshot = await cartCollection.get();

    if (!snapshot.empty) {
      const batch = adminDb.batch();
      snapshot.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }

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
