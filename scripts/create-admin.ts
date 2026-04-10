/* eslint-disable @typescript-eslint/no-explicit-any */
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local explicitly
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { adminAuth, adminDb } from '../src/lib/firebase/admin';

async function createAdmin(email: string, password: string, fullName: string) {
  try {
    console.log(`Creating/Updating admin account for ${email}...`);
    console.log(`Project ID: ${process.env.FIREBASE_PROJECT_ID}`);
    
    // 1. Create or get user in Firebase Auth
    let uid: string;
    try {
      const userRecord = await adminAuth.createUser({
        email,
        password,
        displayName: fullName,
      });
      uid = userRecord.uid;
      console.log(`User created with UID: ${uid}`);
    } catch (e: any) {
      if (e.code === 'auth/email-already-exists') {
        const existingUser = await adminAuth.getUserByEmail(email);
        uid = existingUser.uid;
        console.log(`User already exists. Updating UID: ${uid}`);
      } else {
        throw e;
      }
    }

    // 2. Set custom claims
    await adminAuth.setCustomUserClaims(uid, { admin: true });
    console.log(`Custom claims (admin: true) set for ${email}`);

    // 3. Verification step
    const verifiedUser = await adminAuth.getUser(uid);
    if (verifiedUser.customClaims?.admin === true) {
      console.log('VERIFICATION SUCCESS: Admin claim is present.');
    } else {
      console.error('VERIFICATION FAILED: Admin claim not found on user object.');
    }

    // 4. Create/Update user document in Firestore
    await adminDb.collection("users").doc(uid).set({
      uid: uid,
      email,
      fullName,
      role: "admin",
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    console.log(`Firestore document created for ${email} with role: admin`);
    console.log('\nAdmin setup complete! You can now log in at /admin/login');
    process.exit(0);
  } catch (error: any) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

const email = process.argv[2];
const password = process.argv[3];
const fullName = process.argv[4] || 'Admin User';

if (!email || !password) {
  console.log('Usage: npx tsx scripts/create-admin.ts <email> <password> ["Full Name"]');
  process.exit(1);
}

createAdmin(email, password, fullName);
