'use server';

import { adminDb } from '@/lib/firebase/admin';
import { uploadHeroImage } from '@/lib/cloudinary';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function saveHeroSettings(formData: FormData) {
  const imageUrl = formData.get('imageUrl')?.toString().trim() || '';
  const alt = formData.get('alt')?.toString().trim() || 'Layana Boutique hero image';

  if (!process.env.FIREBASE_PROJECT_ID) {
    return { success: false, error: 'Firebase not configured.' };
  }

  try {
    await adminDb.collection('siteSettings').doc('hero').set({ imageUrl, alt }, { merge: true });
    revalidatePath('/');
    // @ts-expect-error - Next.js internal type mismatch
    revalidateTag('settings');
    return { success: true };
  } catch (err) {
    console.error('saveHeroSettings error:', err);
    return { success: false, error: 'Failed to save hero settings.' };
  }
}

export async function uploadAndSaveHeroImage(formData: FormData) {
  const file = formData.get('heroImage') as File | null;
  const alt = formData.get('alt')?.toString().trim() || 'Layana Boutique hero image';

  if (!file || file.size === 0) {
    return { success: false, error: 'No file selected.' };
  }

  if (!process.env.FIREBASE_PROJECT_ID) {
    return { success: false, error: 'Firebase not configured.' };
  }

  try {
    // Upload to Cloudinary
    const { url, publicId } = await uploadHeroImage(file);

    // Save the resulting URL and publicId to Firestore
    await adminDb.collection('siteSettings').doc('hero').set(
      { imageUrl: url, publicId, alt },
      { merge: true }
    );

    revalidatePath('/');
    // @ts-expect-error - Next.js internal type mismatch
    revalidateTag('settings');
    return { success: true, imageUrl: url };
  } catch (err) {
    console.error('uploadAndSaveHeroImage error:', err);
    const message = err instanceof Error ? err.message : 'Upload failed.';
    return { success: false, error: message };
  }
}

export async function saveSocialSettings(formData: FormData) {
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
