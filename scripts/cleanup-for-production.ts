/**
 * Production Cleanup Script
 * ─────────────────────────
 * Removes all test orders and customer data from Firestore.
 *
 * Collections CLEARED:
 *   - orders
 *   - pendingOrders
 *   - orderFulfillments
 *   - users  (including subcollections: cart, wishlist, addresses)
 *   - adminAuditLogs
 *
 * Collections PRESERVED:
 *   - products
 *   - productDetails
 *   - siteSettings
 *   - articles
 *
 * Usage:
 *   npx tsx scripts/cleanup-for-production.ts
 */

import * as admin from "firebase-admin";
import * as dotenv from "dotenv";
import * as path from "path";
import * as readline from "readline";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

// ── Initialize Firebase Admin ────────────────────────────────────────────────
const projectId =
  process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

// ── Helpers ──────────────────────────────────────────────────────────────────

async function deleteCollection(collectionPath: string): Promise<number> {
  const collectionRef = db.collection(collectionPath);
  let totalDeleted = 0;

  // Firestore batch deletes are limited to 500 operations
  while (true) {
    const snapshot = await collectionRef.limit(400).get();
    if (snapshot.empty) break;

    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    totalDeleted += snapshot.size;
    console.log(`  ↳ Deleted ${totalDeleted} documents from "${collectionPath}"...`);
  }

  return totalDeleted;
}

async function deleteUsersWithSubcollections(): Promise<number> {
  const usersRef = db.collection("users");
  let totalDeleted = 0;
  const subcollections = ["cart", "wishlist", "addresses"];

  while (true) {
    const snapshot = await usersRef.limit(100).get();
    if (snapshot.empty) break;

    for (const userDoc of snapshot.docs) {
      // Delete each subcollection first
      for (const sub of subcollections) {
        const subSnap = await userDoc.ref.collection(sub).get();
        if (!subSnap.empty) {
          const batch = db.batch();
          subSnap.docs.forEach((doc) => batch.delete(doc.ref));
          await batch.commit();
          console.log(`  ↳ Deleted ${subSnap.size} docs from users/${userDoc.id}/${sub}`);
        }
      }

      // Delete the user document itself
      await userDoc.ref.delete();
      totalDeleted++;
    }

    console.log(`  ↳ Deleted ${totalDeleted} user documents so far...`);
  }

  return totalDeleted;
}

async function deleteFirebaseAuthUsers(): Promise<number> {
  const auth = admin.auth();
  let totalDeleted = 0;

  let nextPageToken: string | undefined;
  do {
    const listResult = await auth.listUsers(1000, nextPageToken);
    if (listResult.users.length === 0) break;

    const uids = listResult.users.map((u) => u.uid);
    const result = await auth.deleteUsers(uids);
    totalDeleted += result.successCount;

    if (result.failureCount > 0) {
      console.warn(`  ⚠ Failed to delete ${result.failureCount} auth users`);
    }

    nextPageToken = listResult.pageToken;
  } while (nextPageToken);

  return totalDeleted;
}

// ── Confirmation Prompt ──────────────────────────────────────────────────────

function confirm(message: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(message, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === "yes");
    });
  });
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║   🧹 PRODUCTION CLEANUP — Layana Boutique              ║");
  console.log("╠══════════════════════════════════════════════════════════╣");
  console.log(`║   Project: ${projectId}`);
  console.log("║                                                          ║");
  console.log("║   This will DELETE:                                      ║");
  console.log("║     • All orders                                         ║");
  console.log("║     • All pending orders                                 ║");
  console.log("║     • All order fulfillment records                      ║");
  console.log("║     • All user documents (cart, wishlist, addresses)      ║");
  console.log("║     • All Firebase Auth users                            ║");
  console.log("║     • All admin audit logs                               ║");
  console.log("║                                                          ║");
  console.log("║   This will KEEP:                                        ║");
  console.log("║     ✓ Products & product details                         ║");
  console.log("║     ✓ Site settings (hero, social, policies)             ║");
  console.log("║     ✓ Articles / blog posts                              ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  const proceed = await confirm('⚠️  Type "yes" to confirm deletion: ');

  if (!proceed) {
    console.log("\n❌ Aborted. No data was deleted.\n");
    process.exit(0);
  }

  console.log("\n🚀 Starting cleanup...\n");

  // 1. Orders
  console.log("1/6 — Clearing orders...");
  const ordersCount = await deleteCollection("orders");
  console.log(`   ✅ Deleted ${ordersCount} orders\n`);

  // 2. Pending Orders
  console.log("2/6 — Clearing pending orders...");
  const pendingCount = await deleteCollection("pendingOrders");
  console.log(`   ✅ Deleted ${pendingCount} pending orders\n`);

  // 3. Order Fulfillments
  console.log("3/6 — Clearing order fulfillments...");
  const fulfillmentCount = await deleteCollection("orderFulfillments");
  console.log(`   ✅ Deleted ${fulfillmentCount} fulfillment records\n`);

  // 4. Users (with subcollections)
  console.log("4/6 — Clearing users (+ cart, wishlist, addresses)...");
  const usersCount = await deleteUsersWithSubcollections();
  console.log(`   ✅ Deleted ${usersCount} user documents\n`);

  // 5. Firebase Auth Users
  console.log("5/6 — Clearing Firebase Auth users...");
  const authUsersCount = await deleteFirebaseAuthUsers();
  console.log(`   ✅ Deleted ${authUsersCount} auth users\n`);

  // 6. Admin Audit Logs
  console.log("6/6 — Clearing admin audit logs...");
  const auditCount = await deleteCollection("adminAuditLogs");
  console.log(`   ✅ Deleted ${auditCount} audit log entries\n`);

  // Summary
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║   ✅ CLEANUP COMPLETE                                    ║");
  console.log("╠══════════════════════════════════════════════════════════╣");
  console.log(`║   Orders deleted:        ${ordersCount}`);
  console.log(`║   Pending orders:        ${pendingCount}`);
  console.log(`║   Fulfillment records:   ${fulfillmentCount}`);
  console.log(`║   User documents:        ${usersCount}`);
  console.log(`║   Auth users:            ${authUsersCount}`);
  console.log(`║   Audit logs:            ${auditCount}`);
  console.log("║                                                          ║");
  console.log("║   🚀 Your database is ready for production!              ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  process.exit(0);
}

main().catch((err) => {
  console.error("\n❌ Cleanup failed:", err);
  process.exit(1);
});
