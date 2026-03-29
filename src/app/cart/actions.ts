"use server";

import { adminDb } from "@/lib/firebase/admin";
import { revalidatePath } from "next/cache";

export async function updateCartItemQuantity(id: string, newQuantity: number) {
  if (!process.env.FIREBASE_PROJECT_ID) {
    console.warn("No FIREBASE_PROJECT_ID found. Cannot update quantity in Firebase.");
    return false;
  }

  try {
    if (newQuantity <= 0) {
      // You could choose to delete the item if quantity reaches 0
      // await adminDb.collection("cartItems").doc(id).delete();
      return false; // For now, prevent going below 1
    }

    const docRef = adminDb.collection("cartItems").doc(id);
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
