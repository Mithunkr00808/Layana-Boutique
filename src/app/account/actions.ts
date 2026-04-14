"use server";

import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import { getSessionUid, requireSessionUid } from "@/lib/auth/session-user";
import { revalidatePath } from "next/cache";
import { getGuestId } from "@/app/cart/actions";
import type { Address } from "@/lib/data";

// ── Address actions ──────────────────────────────────────────────────────────

const addressSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian mobile number"),
  streetAddress: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().regex(/^[1-9][0-9]{5}$/, "Must be a valid 6-digit PIN code"),
  addressType: z.enum(["home", "work", "other"]).default("home"),
});

export type AddressInput = z.infer<typeof addressSchema>;

export async function addAddress(
  input: AddressInput
): Promise<{ success: true; address: Address } | { success: false; error: string }> {
  try {
    const uid = await requireSessionUid();
    const parsed = addressSchema.safeParse(input);

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Invalid address data" };
    }

    const userRef = adminDb.collection("users").doc(uid);
    const snap = await userRef.get();
    const stored = (snap.data()?.addresses as Address[] | undefined) || [];
    const newEntry: Address = { ...parsed.data, id: crypto.randomUUID() };
    const updated = [...stored, newEntry];
    await userRef.set({ addresses: updated }, { merge: true });

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");

    return { success: true, address: newEntry };
  } catch (error) {
    console.error("addAddress error:", error);
    return { success: false, error: "Failed to add address" };
  }
}

export async function removeAddress(
  addressId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const uid = await requireSessionUid();
    const userRef = adminDb.collection("users").doc(uid);
    const snap = await userRef.get();
    const stored = (snap.data()?.addresses as Address[] | undefined) || [];
    const updated = stored.filter((addr) => addr.id !== addressId);

    if (updated.length === stored.length) {
      return { success: false, error: "Address not found" };
    }

    await userRef.set({ addresses: updated }, { merge: true });

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");

    return { success: true };
  } catch (error) {
    console.error("removeAddress error:", error);
    return { success: false, error: "Failed to remove address" };
  }
}

// ── Preferences actions ──────────────────────────────────────────────────────

const preferencesSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  visibility: z.boolean().optional(),
  newsletter: z.boolean().optional(),
  twoFactor: z.boolean().optional(),
});

export type PreferencesInput = z.infer<typeof preferencesSchema>;

export async function updatePreferences(
  input: PreferencesInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const uid = await requireSessionUid();
    const parsed = preferencesSchema.safeParse(input);

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Invalid data" };
    }

    const { firstName, lastName, phone, visibility, newsletter, twoFactor } = parsed.data;
    const fullName = `${firstName} ${lastName || ""}`.trim();

    await adminDb.collection("users").doc(uid).set(
      {
        firstName,
        lastName: lastName || "",
        fullName,
        phone,
        preferences: {
          visibility: !!visibility,
          newsletter: !!newsletter,
          twoFactor: !!twoFactor,
          updatedAt: new Date().toISOString(),
        },
      },
      { merge: true }
    );

    revalidatePath("/account/preferences");
    return { success: true };
  } catch (error) {
    console.error("updatePreferences error:", error);
    return { success: false, error: "Failed to save preferences" };
  }
}

// ── Wishlist actions ─────────────────────────────────────────────────────────

export type WishlistItem = {
  id: string;
  name: string;
  variant?: string;
  size?: string;
  price?: string;
  rawPrice?: number;
  image?: string;
  alt?: string;
};

export async function getWishlistItems(): Promise<WishlistItem[]> {
  try {
    const uid = await getSessionUid();
    let wishlistCollection;

    if (uid) {
      wishlistCollection = adminDb.collection("users").doc(uid).collection("wishlist");
    } else {
      const guestId = await getGuestId();
      wishlistCollection = adminDb.collection("guest-wishlists").doc(guestId).collection("items");
    }

    const snap = await wishlistCollection.get();
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WishlistItem, "id">) }));
  } catch (error) {
    console.error("getWishlistItems error:", error);
    return [];
  }
}

export async function removeWishlistItem(
  itemId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const uid = await getSessionUid();
    let wishlistCollection;

    if (uid) {
      wishlistCollection = adminDb.collection("users").doc(uid).collection("wishlist");
    } else {
      const guestId = await getGuestId();
      wishlistCollection = adminDb.collection("guest-wishlists").doc(guestId).collection("items");
    }

    await wishlistCollection.doc(itemId).delete();
    revalidatePath("/account/wishlist");
    return { success: true };
  } catch (error) {
    console.error("removeWishlistItem error:", error);
    return { success: false, error: "Failed to remove item" };
  }
}

export async function toggleWishlistItem(
  item: WishlistItem
): Promise<{ success: boolean; added?: boolean; error?: string }> {
  try {
    const uid = await getSessionUid();
    let wishlistCollection;

    if (uid) {
      wishlistCollection = adminDb.collection("users").doc(uid).collection("wishlist");
    } else {
      const guestId = await getGuestId();
      wishlistCollection = adminDb.collection("guest-wishlists").doc(guestId).collection("items");
    }

    const docRef = wishlistCollection.doc(item.id);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      // Remove it
      await docRef.delete();
      revalidatePath("/account/wishlist");
      return { success: true, added: false };
    } else {
      // Add it
      const data = Object.fromEntries(
        Object.entries(item).filter(([key]) => key !== "id")
      ) as Omit<WishlistItem, "id">;
      await docRef.set({
        ...data,
        updatedAt: new Date().toISOString(),
      });
      revalidatePath("/account/wishlist");
      return { success: true, added: true };
    }
  } catch (error) {
    console.error("toggleWishlistItem error:", error);
    return { success: false, error: "Failed to update wishlist" };
  }
}

export async function getWishlistedIds(): Promise<string[]> {
  try {
    const uid = await getSessionUid();
    let wishlistCollection;

    if (uid) {
      wishlistCollection = adminDb.collection("users").doc(uid).collection("wishlist");
    } else {
      const guestId = await getGuestId();
      wishlistCollection = adminDb.collection("guest-wishlists").doc(guestId).collection("items");
    }

    const snap = await wishlistCollection.get();
    return snap.docs.map((d) => d.id);
  } catch {
    return [];
  }
}
