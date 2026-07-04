import * as admin from "firebase-admin";

const projectId =
  process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const adminStorageBucket =
  process.env.FIREBASE_STORAGE_BUCKET ||
  (projectId ? `${projectId}.appspot.com` : undefined) ||
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

if (!admin.apps.length) {
  const options: admin.AppOptions = {
    projectId,
    storageBucket: adminStorageBucket,
  };

  if (process.env.FIREBASE_PRIVATE_KEY) {
    options.credential = admin.credential.cert({
      projectId: projectId,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
  }

  admin.initializeApp(options);
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export const adminStorage = admin.storage();
