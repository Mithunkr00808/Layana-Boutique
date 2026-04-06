import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function POST() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  const guestId = cookieStore.get("guestId")?.value;

  if (!sessionCookie || !guestId) {
    return NextResponse.json({ migrated: false, reason: "no-session-or-guest" });
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = decoded?.uid;
    if (!uid) {
      return NextResponse.json({ migrated: false, reason: "no-uid" });
    }

    const guestItemsSnap = await adminDb
      .collection("guest-carts")
      .doc(guestId)
      .collection("items")
      .get();

    if (guestItemsSnap.empty) {
      const res = NextResponse.json({ migrated: false, reason: "empty-guest" });
      res.cookies.set({ name: "guestId", value: "", maxAge: -1, path: "/" });
      return res;
    }

    await adminDb.runTransaction(async (txn) => {
      for (const doc of guestItemsSnap.docs) {
        const data = doc.data();
        const targetRef = adminDb
          .collection("users")
          .doc(uid)
          .collection("cart")
          .doc(doc.id);
        const existing = await txn.get(targetRef);
        const existingQty = (existing.exists ? (existing.data()?.quantity as number | undefined) : 0) ?? 0;
        txn.set(
          targetRef,
          {
            ...data,
            quantity: Math.max(1, existingQty + ((data.quantity as number) ?? 1)),
          },
          { merge: true }
        );
      }
    });

    // Clean up guest cart
    const batch = adminDb.batch();
    guestItemsSnap.docs.forEach((doc) => batch.delete(doc.ref));
    batch.delete(adminDb.collection("guest-carts").doc(guestId));
    await batch.commit();

    const res = NextResponse.json({ migrated: true, moved: guestItemsSnap.size });
    res.cookies.set({ name: "guestId", value: "", maxAge: -1, path: "/" });
    return res;
  } catch (error) {
    console.error("Guest cart migration failed:", error);
    return NextResponse.json({ migrated: false, reason: "error" }, { status: 500 });
  }
}
