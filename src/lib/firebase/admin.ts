import * as dotenv from 'dotenv';
import * as path from 'path';
import * as admin from "firebase-admin";

// Load environment variables from .env.local if not already loaded (useful for scripts)
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const projectId =
  process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const adminStorageBucket =
  process.env.FIREBASE_STORAGE_BUCKET ||
  (projectId ? `${projectId}.appspot.com` : undefined) ||
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Replace escaped newlines from environment variable properly
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: adminStorageBucket,
  });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export const adminStorage = admin.storage();
