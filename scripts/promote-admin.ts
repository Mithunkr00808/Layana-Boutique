import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local explicitly
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { adminAuth, adminDb } from '../src/lib/firebase/admin';

async function promoteAdmin(email: string) {
  try {
    const user = await adminAuth.getUserByEmail(email);
    await adminAuth.setCustomUserClaims(user.uid, { admin: true });
    
    // Verification step
    const verifiedUser = await adminAuth.getUser(user.uid);
    if (verifiedUser.customClaims?.admin === true) {
      await adminDb.collection("users").doc(user.uid).update({ role: "admin" });
      console.log(`VERIFICATION SUCCESS: Successfully promoted ${email} to admin and updated Firestore.`);
    } else {
      console.error('VERIFICATION FAILED: Admin claim not found on user object.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error promoting user:', error);
    process.exit(1);
  }
}

const email = process.argv[2];
if (!email) {
  console.log('Usage: npx tsx scripts/promote-admin.ts <email>');
  process.exit(1);
}

promoteAdmin(email);
