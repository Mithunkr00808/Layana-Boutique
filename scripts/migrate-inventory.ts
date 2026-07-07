import "dotenv/config";
import { adminDb } from "@/lib/firebase/admin";
import type { ProductSize } from "@/lib/data";

async function migrateInventory(): Promise<void> {
  if (!process.env.FIREBASE_PROJECT_ID) {
    throw new Error("Missing FIREBASE_PROJECT_ID");
  }

  const collections = ["products", "productDetails"];
  let migratedDocs = 0;

  for (const collectionName of collections) {
    const snapshot = await adminDb.collection(collectionName).get();
    let batch = adminDb.batch();
    let pending = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const hasSizes = data.hasSizes === true;
      const sizes = Array.isArray(data.sizes) ? (data.sizes as ProductSize[]) : [];

      const sizeQuantities: Record<string, number> = {};

      if (hasSizes && sizes.length > 0) {
        for (const size of sizes) {
          if (size.label) {
            sizeQuantities[size.label] = 1;
          }
        }
      }

      batch.update(doc.ref, {
        sizeQuantities,
        quantity: 1, // Set global quantity to 1 for all products as per warehouse instructions
      });
      pending += 1;

      // Firestore batches are limited to 500 operations
      if (pending === 500) {
        await batch.commit();
        migratedDocs += pending;
        pending = 0;
        batch = adminDb.batch(); // Create a new batch
      }
    }

    if (pending > 0) {
      await batch.commit();
      migratedDocs += pending;
    }
  }

  console.log(
    JSON.stringify(
      { status: "ok", migratedDocs },
      null,
      2
    )
  );
}

migrateInventory()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
