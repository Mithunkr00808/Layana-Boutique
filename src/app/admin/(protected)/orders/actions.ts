'use server';

import { adminDb } from '@/lib/firebase/admin';
import { assertAdminSession } from '@/lib/auth/admin-session';
import { revalidatePath } from 'next/cache';

const VALID_STATUSES = ['paid', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
type OrderStatus = (typeof VALID_STATUSES)[number];

export async function updateOrderStatus(
  orderId: string,
  newStatus: string
): Promise<{ success: boolean; error?: string }> {
  await assertAdminSession();

  if (!VALID_STATUSES.includes(newStatus as OrderStatus)) {
    return { success: false, error: `Invalid status: ${newStatus}` };
  }

  if (!process.env.FIREBASE_PROJECT_ID) {
    return { success: false, error: 'Firebase not configured.' };
  }

  try {
    const orderRef = adminDb.collection('orders').doc(orderId);
    const doc = await orderRef.get();

    if (!doc.exists) {
      return { success: false, error: 'Order not found.' };
    }

    await orderRef.update({ status: newStatus });
    revalidatePath('/admin/orders');
    revalidatePath('/admin');

    return { success: true };
  } catch (err) {
    console.error('updateOrderStatus error:', err);
    return { success: false, error: 'Failed to update order status.' };
  }
}
