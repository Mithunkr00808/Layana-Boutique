'use server';

import { adminDb } from '@/lib/firebase/admin';
import { uploadHeroImage } from '@/lib/cloudinary';
import { revalidatePath, revalidateTag } from 'next/cache';
import { assertAdminSession } from '@/lib/auth/admin-session';

export async function saveHeroImages(imagesJson: string) {
  await assertAdminSession();
  if (!process.env.FIREBASE_PROJECT_ID) {
    return { success: false, error: 'Firebase not configured.' };
  }

  try {
    const images = JSON.parse(imagesJson);
    await adminDb.collection('siteSettings').doc('hero').set({ images }, { merge: true });
    revalidatePath('/');
    // @ts-expect-error - Next.js internal type mismatch
    revalidateTag('settings');
    return { success: true };
  } catch (err) {
    console.error('saveHeroImages error:', err);
    return { success: false, error: 'Failed to save hero images.' };
  }
}

export async function uploadHeroImageAction(formData: FormData) {
  await assertAdminSession();
  const file = formData.get('heroImage') as File | null;

  if (!file || file.size === 0) {
    return { success: false, error: 'No file selected.' };
  }

  if (!process.env.FIREBASE_PROJECT_ID) {
    return { success: false, error: 'Firebase not configured.' };
  }

  try {
    // Upload to Cloudinary
    const { url, publicId } = await uploadHeroImage(file);
    return { success: true, imageUrl: url, publicId };
  } catch (err) {
    console.error('uploadHeroImageAction error:', err);
    const message = err instanceof Error ? err.message : 'Upload failed.';
    return { success: false, error: message };
  }
}

export async function saveSocialSettings(formData: FormData) {
  await assertAdminSession();
  const instagram = formData.get('instagram')?.toString().trim() || '';
  const facebook = formData.get('facebook')?.toString().trim() || '';
  const email = formData.get('email')?.toString().trim() || '';

  if (!process.env.FIREBASE_PROJECT_ID) {
    return { success: false, error: 'Firebase not configured.' };
  }

  try {
    await adminDb.collection('siteSettings').doc('social').set({ instagram, facebook, email }, { merge: true });
    revalidatePath('/');
    // @ts-expect-error - Next.js internal type mismatch
    revalidateTag('settings');
    return { success: true };
  } catch (err) {
    console.error('saveSocialSettings error:', err);
    return { success: false, error: 'Failed to save social settings.' };
  }
}
