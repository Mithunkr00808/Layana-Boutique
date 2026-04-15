import "dotenv/config";
import { adminDb } from "@/lib/firebase/admin";
import type { Address } from "@/lib/data";

async function migrateAddressesToSubcollection(): Promise<void> {
  if (!process.env.FIREBASE_PROJECT_ID) {
    throw new Error("Missing FIREBASE_PROJECT_ID");
  }

  const usersSnapshot = await adminDb.collection("users").get();
  let migratedUsers = 0;
  let migratedAddresses = 0;

  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data();
    const addresses = Array.isArray(userData.addresses) ? (userData.addresses as Address[]) : [];

    if (!addresses.length) {
      continue;
    }

    const batch = adminDb.batch();
    let pending = 0;

    for (const address of addresses) {
      if (!address?.id) continue;
      const subRef = userDoc.ref.collection("addresses").doc(address.id);
      const subDoc = await subRef.get();
      if (!subDoc.exists) {
        batch.set(subRef, address, { merge: true });
        pending += 1;
      }
    }

    if (pending > 0) {
      await batch.commit();
      migratedUsers += 1;
      migratedAddresses += pending;
    }
  }

  console.log(
    JSON.stringify(
      { status: "ok", migratedUsers, migratedAddresses },
      null,
      2
    )
  );
}

migrateAddressesToSubcollection().catch((error) => {
  console.error("Address migration failed:", error);
  process.exitCode = 1;
});

