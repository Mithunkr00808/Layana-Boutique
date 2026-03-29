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
    if (!uid) {
      return false;
    }

    const docRef = adminDb.collection("users").doc(uid).collection("cart").doc(id);
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

export async function removeCartItem(id: string) {
  if (!process.env.FIREBASE_PROJECT_ID) {
    console.warn("No FIREBASE_PROJECT_ID found. Cannot remove cart item.");
    return false;
  }

  try {
    const uid = await getUidFromSession();
    if (!uid) return false;

    const docRef = adminDb.collection("users").doc(uid).collection("cart").doc(id);
    await docRef.delete();

    revalidatePath("/cart");
    return true;
  } catch (error) {
    console.error("Error removing cart item:", error);
    return false;
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
