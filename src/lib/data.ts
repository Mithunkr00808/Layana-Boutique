import type { DocumentSnapshot } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from './firebase/admin';
import { buildCloudinaryVideoPosterUrl } from './cloudinary';
import {
  DEFAULT_PRODUCT_CATEGORY,
  isKnownProductCategory,
} from './catalog/categories';
import type { ProductMedia } from '@/types/product-media';

// ── Type definitions ────────────────────────────────────────────────────────

export interface Product {
  id: string;
  category?: string;
  name: string;
  price: string;
  discountPrice?: string;
  quantity: number;
  image: string;
  alt: string;
  isLimited?: boolean;
  options?: string;
}

export interface Article {
  id: string;
  label: string;
  title: string;
  excerpt: string;
  image: string;
  alt: string;
}

export interface ProductSize {
  label: string;
  available: boolean;
}

export interface ProductDetail {
  id: string;
  sku: string;
  categoryPath: string;
  name: string;
  price: string;
  discountPrice?: string;
  quantity: number;
  hasSizes?: boolean;
  description: string;
  materials: string[];
  sustainability: string;
  images: ProductMedia[];
  sizes: ProductSize[];
}

export interface CartItem {
  id: string;
  name: string;
  variant: string;
  size: string;
  quantity: number;
  price: string;
  rawPrice: number;
  image: string;
  alt: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface Order {
  id: string;
  userId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
  receipt?: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  status: "paid" | "failed";
  address?: Address | null;
  createdAt: any; // Firestore Timestamp
}

function normalizeProductMediaArray(images: unknown): ProductMedia[] {
  if (!Array.isArray(images)) {
    return [];
  }

  return images
    .filter((item): item is Partial<ProductMedia> => Boolean(item && typeof item === 'object'))
    .map((item, index) => {
      const resourceType = item.resourceType === 'video' ? 'video' : 'image';
      const poster =
        resourceType === 'video'
          ? item.poster || (item.publicId ? buildCloudinaryVideoPosterUrl(item.publicId) : undefined)
          : undefined;

      return {
        src: item.src || '',
        alt: item.alt || `Product media ${index + 1}`,
        type: item.type || (index === 1 || index === 2 ? 'half' : 'large'),
        resourceType,
        publicId: item.publicId,
        poster,
        format: item.format,
        width: item.width,
        height: item.height,
        bytes: item.bytes,
        duration: item.duration,
      };
    })
    .filter((item) => Boolean(item.src));
}

function extractTimestampMillis(value: unknown): number {
  if (value && typeof value === 'object') {
    if ('toDate' in value && typeof value.toDate === 'function') {
      return value.toDate().getTime();
    }

    if ('seconds' in value && typeof value.seconds === 'number') {
      return value.seconds * 1000;
    }
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

function formatIndianPrice(price: unknown): string {
  if (!price || typeof price !== 'string') return '₹0.00';
  
  const numeric = parseFloat(price.replace(/[^\d.]/g, ""));
  if (isNaN(numeric)) {
    return price.replace('$', '₹');
  }
  return `₹${numeric.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function mapProductDoc(doc: DocumentSnapshot): Product {
  const data = doc.data() as any;

  return {
    id: doc.id,
    category: data?.category || '',
    name: data?.name || '',
    price: formatIndianPrice(data?.price),
    discountPrice: data?.discountPrice ? formatIndianPrice(data.discountPrice) : undefined,
    quantity: data?.quantity || 0,
    image: data?.image || '',
    alt: data?.alt || '',
    isLimited: data?.isLimited || false,
    options: data?.options || '',
  };
}

// ── Data fetching functions ─────────────────────────────────────────────────

export async function getNewArrivals(): Promise<Product[]> {
  if (!process.env.FIREBASE_PROJECT_ID) {
    return [];
  }

  try {
    const snapshot = await adminDb.collection('products').get();

    if (snapshot.empty) return [];

    return snapshot.docs
      .map((doc) => ({
        product: mapProductDoc(doc),
        sortValue: Math.max(
          extractTimestampMillis(doc.data()?.updatedAt),
          extractTimestampMillis(doc.data()?.createdAt)
        ),
      }))
      .sort((a, b) => b.sortValue - a.sortValue)
      .slice(0, 3)
      .map(({ product }) => product);
  } catch (error) {
    console.error('Failed to fetch new arrivals from Firebase:', error);
    return [];
  }
}

export async function getReadyToWearProducts(filters?: { category?: string | null; size?: string | null; query?: string | null }): Promise<Product[]> {
  if (!process.env.FIREBASE_PROJECT_ID) {
    return [];
  }

  try {
    const snapshot = await adminDb.collection('products').get();

    if (snapshot.empty) return [];

    let products = snapshot.docs.map(mapProductDoc);

    if (filters?.category && isKnownProductCategory(filters.category)) {
      products = products.filter((product) => product.category === filters.category);
    }

    if (filters?.size) {
      const sizeLower = filters.size.toLowerCase();
      products = products.filter((product) => (product.options || '').toLowerCase().includes(sizeLower));
    }

    if (filters?.query) {
      const q = filters.query.toLowerCase();
      products = products.filter((product) =>
        [product.name, product.options, product.category || ''].some((field) =>
          (field || '').toLowerCase().includes(q)
        )
      );
    }

    return products;
  } catch (error) {
    console.error('Failed to fetch RTW products from Firebase:', error);
    return [];
  }
}

export async function getJournalArticles(): Promise<Article[]> {
  if (!process.env.FIREBASE_PROJECT_ID) {
    return [];
  }

  try {
    const snapshot = await adminDb.collection('articles').get();
    if (snapshot.empty) return [];

    return snapshot.docs.map(doc => doc.data() as Article);
  } catch (error) {
    console.error('Failed to fetch articles from Firebase:', error);
    return [];
  }
}

export async function getProductDetail(id: string): Promise<ProductDetail | null> {
  if (!process.env.FIREBASE_PROJECT_ID) {
    return null;
  }

  try {
    let doc = await adminDb.collection('productDetails').doc(id).get();

    if (doc.exists) {
      const raw = doc.data() as any;
      return {
        id: raw.id || id,
        sku: raw.sku || '',
        categoryPath: raw.categoryPath || '',
        name: raw.name || '',
        price: formatIndianPrice(raw.price),
        discountPrice: raw.discountPrice ? formatIndianPrice(raw.discountPrice) : undefined,
        quantity: raw.quantity || 0,
        description: raw.description || '',
        materials: raw.materials || [],
        sustainability: raw.sustainability || '',
        images: normalizeProductMediaArray(raw.images),
        sizes: raw.sizes || [],
        hasSizes: raw.hasSizes ?? true,
      };
    }

    doc = await adminDb.collection('products').doc(id).get();

    if (doc.exists) {
      const summary = mapProductDoc(doc);
      
      return {
        id: summary.id,
        sku: `SKU-${summary.id.toUpperCase()}`,
        categoryPath: summary.category || DEFAULT_PRODUCT_CATEGORY,
        name: summary.name || 'Unknown Product',
        price: summary.price,
        discountPrice: summary.discountPrice,
        quantity: summary.quantity,
        hasSizes: true,
        description: summary.options 
          ? `Made from ${summary.options}. This product has not had its full description, materials, or editorial images uploaded yet.` 
          : 'Full product description is pending. Please update via the admin panel.',
        materials: ['Detail pending - Update via catalog admin'],
        sustainability: 'Sustainability tracking pending',
        images: summary.image
          ? [
              {
                src: summary.image,
                alt: summary.alt || summary.name || 'Product Image',
                type: 'large',
                resourceType: 'image',
              },
            ]
          : [],
        sizes: [
          { label: 'S', available: true },
          { label: 'M', available: true },
          { label: 'L', available: true },
        ]
      };
    }

    return null;
  } catch (error) {
    console.error('Failed to fetch product detail from Firebase:', error);
    return null;
  }
}

export async function getRelatedProducts(): Promise<Product[]> {
  if (!process.env.FIREBASE_PROJECT_ID) {
    return [];
  }

  try {
    const snapshot = await adminDb.collection('products').limit(4).get();
    if (snapshot.empty) return [];

    return snapshot.docs.map(mapProductDoc);
  } catch (error) {
    console.error('Failed to fetch related products:', error);
    return [];
  }
}

function mapCartDoc(doc: DocumentSnapshot): CartItem {
  const data = doc.data() as Partial<CartItem>;

  return {
    id: data?.id ?? doc.id,
    name: data?.name ?? 'Unknown Item',
    variant: data?.variant ?? '',
    size: data?.size ?? '',
    quantity: data?.quantity ?? 1,
    price: data?.price ?? '₹0.00',
    rawPrice: data?.rawPrice ?? 0,
    image: data?.image ?? '',
    alt: data?.alt ?? '',
  };
}

export async function getCartItems(userId: string): Promise<CartItem[]> {
  if (!process.env.FIREBASE_PROJECT_ID) {
    return [];
  }

  try {
    const snapshot = await adminDb
      .collection('users')
      .doc(userId)
      .collection('cart')
      .get();

    if (snapshot.empty) return [];

    return snapshot.docs.map(mapCartDoc);
  } catch (error) {
    console.error('Failed to fetch cart items for user from Firebase:', error);
    return [];
  }
}

export async function addToCart(userId: string, item: CartItem): Promise<boolean> {
  if (!process.env.FIREBASE_PROJECT_ID) {
    console.warn('No FIREBASE_PROJECT_ID set. Skipping addToCart.');
    return false;
  }

  try {
    const cartCollection = adminDb.collection('users').doc(userId).collection('cart');
    const docRef = item.id ? cartCollection.doc(item.id) : cartCollection.doc();
    await docRef.set({
      ...item,
      id: docRef.id,
    });
    return true;
  } catch (error) {
    console.error('Failed to add item to cart:', error);
    return false;
  }
}

export async function getCartItemsForUser(): Promise<CartItem[]> {
  if (!process.env.FIREBASE_PROJECT_ID) {
    return [];
  }

  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    const guestId = cookieStore.get('guestId')?.value;

    async function mergeGuestToUser(uid: string, guest: string) {
      const guestSnap = await adminDb
        .collection('guest-carts')
        .doc(guest)
        .collection('items')
        .get();

      if (guestSnap.empty) return;

      await adminDb.runTransaction(async (txn) => {
        for (const doc of guestSnap.docs) {
          const data = doc.data() as any;
          const targetRef = adminDb.collection('users').doc(uid).collection('cart').doc(doc.id);
          const existing = await txn.get(targetRef);
          const existingQty = (existing.exists ? (existing.data()?.quantity as number | undefined) : 0) ?? 0;
          txn.set(
            targetRef,
            {
              ...data,
              quantity: Math.max(1, existingQty + ((data.quantity as number) ?? 1)),
            },
            { merge: true }
          );
        }
      });

      const batch = adminDb.batch();
      guestSnap.docs.forEach((d) => batch.delete(d.ref));
      batch.delete(adminDb.collection('guest-carts').doc(guest));
      await batch.commit();
    }

    if (sessionCookie) {
      const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
      const uid = decoded?.uid;
      if (uid) {
        if (guestId) {
          await mergeGuestToUser(uid, guestId);
        }
        return await getCartItems(uid);
      }
    }

    // Fallback to guest cart
    if (!guestId) return [];

    const snapshot = await adminDb
      .collection('guest-carts')
      .doc(guestId)
      .collection('items')
      .get();

    if (snapshot.empty) return [];

    return snapshot.docs.map(mapCartDoc);
  } catch (error) {
    console.error('Failed to verify session or fetch cart:', error);
    return [];
  }
}

export async function getUserAddresses(): Promise<Address[]> {
  if (!process.env.FIREBASE_PROJECT_ID) {
    return [];
  }

  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) return [];

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = decoded?.uid;
    if (!uid) return [];

    const userRef = adminDb.collection('users').doc(uid);
    const [userDoc, addressDocs] = await Promise.all([
      userRef.get(),
      userRef.collection('addresses').get().catch(() => null),
    ]);

    if (addressDocs && !addressDocs.empty) {
      return addressDocs.docs.map((doc) => {
        const data = doc.data() as Partial<Address>;
        return {
          id: data.id ?? doc.id,
          fullName: data.fullName ?? '',
          phone: data.phone ?? '',
          streetAddress: data.streetAddress ?? '',
          city: data.city ?? '',
          state: data.state ?? '',
          postalCode: data.postalCode ?? '',
        };
      });
    }

    const userData = userDoc.data();
    if (userData && Array.isArray(userData.addresses)) {
      return (userData.addresses as Partial<Address>[]).map((addr, idx) => ({
        id: addr.id ?? `addr-${idx}`,
        fullName: addr.fullName ?? '',
        phone: addr.phone ?? '',
        streetAddress: addr.streetAddress ?? '',
        city: addr.city ?? '',
        state: addr.state ?? '',
        postalCode: addr.postalCode ?? '',
      }));
    }

    return [];
  } catch (error) {
    console.error('Failed to fetch user addresses:', error);
    return [];
  }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  if (!process.env.FIREBASE_PROJECT_ID) {
    return null;
  }

  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) return null;

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = decoded?.uid;
    if (!uid) return null;

    const docRef = adminDb.collection('orders').doc(orderId);
    const doc = await docRef.get();
    if (!doc.exists) return null;

    const data = doc.data() as any;
    if (data.userId !== uid) return null;

    const items: CartItem[] = Array.isArray(data.items)
      ? data.items.map((item: any) => ({
          id: item.id ?? '',
          name: item.name ?? '',
          variant: item.variant ?? '',
          size: item.size ?? '',
          quantity: item.quantity ?? 1,
          price: item.price ?? '',
          rawPrice: item.rawPrice ?? 0,
          image: item.image ?? '',
          alt: item.alt ?? '',
        }))
      : [];

    const subtotalStored = typeof data.subtotal === 'number' ? data.subtotal : null;
    const subtotal = subtotalStored ?? items.reduce((acc, item) => acc + item.rawPrice * item.quantity, 0);
    const shippingStored = typeof data.shipping === 'number' ? data.shipping : null;
    const shipping = shippingStored ?? 0;
    const totalStored = typeof data.total === 'number' ? data.total : null;
    const total =
      totalStored ??
      (typeof data.amount === 'number' ? Number(data.amount) / 100 : subtotal + shipping);

    const address: Address | null = data.address
      ? {
          id: data.address.id ?? 'address',
          fullName: data.address.fullName ?? '',
          phone: data.address.phone ?? '',
          streetAddress: data.address.streetAddress ?? '',
          city: data.address.city ?? '',
          state: data.address.state ?? '',
          postalCode: data.address.postalCode ?? '',
        }
      : null;

    return {
      id: doc.id,
      userId: data.userId,
      razorpayOrderId: data.razorpayOrderId,
      razorpayPaymentId: data.razorpayPaymentId,
      razorpaySignature: data.razorpaySignature,
      receipt: data.receipt,
      items,
      subtotal,
      shipping,
      total,
      currency: data.currency ?? 'INR',
      status: data.status ?? 'paid',
      address,
      createdAt: data.createdAt,
    };
  } catch (error) {
    console.error('Failed to fetch order:', error);
    return null;
  }
}

function mapOrder(doc: FirebaseFirestore.DocumentSnapshot): Order {
  const data = doc.data() as any;
  const items: CartItem[] = Array.isArray(data?.items)
    ? data.items.map((item: any) => ({
        id: item.id ?? '',
        name: item.name ?? '',
        variant: item.variant ?? '',
        size: item.size ?? '',
        quantity: item.quantity ?? 1,
        price: item.price ?? '',
        rawPrice: item.rawPrice ?? 0,
        image: item.image ?? '',
        alt: item.alt ?? '',
      }))
    : [];

  const subtotalStored = typeof data?.subtotal === 'number' ? data.subtotal : null;
  const subtotal = subtotalStored ?? items.reduce((acc, item) => acc + item.rawPrice * item.quantity, 0);
  const shippingStored = typeof data?.shipping === 'number' ? data.shipping : null;
  const shipping = shippingStored ?? 0;
  const totalStored = typeof data?.total === 'number' ? data.total : null;
  const total =
    totalStored ??
    (typeof data?.amount === 'number' ? Number(data.amount) / 100 : subtotal + shipping);

  const address: Address | null = data?.address
    ? {
        id: data.address.id ?? 'address',
        fullName: data.address.fullName ?? '',
        phone: data.address.phone ?? '',
        streetAddress: data.address.streetAddress ?? '',
        city: data.address.city ?? '',
        state: data.address.state ?? '',
        postalCode: data.address.postalCode ?? '',
      }
    : null;

  return {
    id: doc.id,
    userId: data?.userId ?? '',
    razorpayOrderId: data?.razorpayOrderId ?? '',
    razorpayPaymentId: data?.razorpayPaymentId ?? '',
    razorpaySignature: data?.razorpaySignature,
    receipt: data?.receipt,
    items,
    subtotal,
    shipping,
    total,
    currency: data?.currency ?? 'INR',
    status: data?.status ?? 'paid',
    address,
    createdAt: data?.createdAt ?? null,
  };
}

export async function getUserOrders(limit = 20): Promise<Order[]> {
  if (!process.env.FIREBASE_PROJECT_ID) return [];

  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) return [];

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = decoded?.uid;
    if (!uid) return [];

    const snapshot = await adminDb
      .collection('orders')
      .where('userId', '==', uid)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(mapOrder);
  } catch (error) {
    // Log only the message to avoid noisy source-map parsing in dev
    const message = (error as any)?.message || String(error);
    console.warn('Failed to fetch user orders:', message);
    return [];
  }
}

export async function getAllOrders(limit = 100): Promise<Order[]> {
  if (!process.env.FIREBASE_PROJECT_ID) return [];

  try {
    const snapshot = await adminDb
      .collection('orders')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(mapOrder);
  } catch (error) {
    console.error('Failed to fetch all orders:', error);
    return [];
  }
}

// ---- Site Settings ----

export interface SiteSettings {
  hero: { imageUrl: string; alt: string };
  social: { instagram: string; facebook: string; email: string };
}

const DEFAULT_HERO_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuD315us5QSxHnxztOXDZ8ttyjNhERsYzKjADSyBq75CASgaps_JA9zS0rdzP_dPN1bpscfJuYkI3j3-GPLU0DTyLml8mA6SPnaLUTELp3VwKIsPkI9rkDnzEPfutX5NILavsl41IXPCWWfAEgXAyOrpa75BQ0bisSsEQXH3U1vYhVjqgIHzOvZsDbN-dNmHJH8Z8qao4by3NB8hnCQnId8zey-8t0h7eOCxSG3IFcFUOPARCycg_FziDBev2QjpChOfUFlEvs9SbIa_';

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  hero: { imageUrl: DEFAULT_HERO_URL, alt: 'Layana Boutique — curating conscious luxury' },
  social: { instagram: '', facebook: '', email: '' },
};

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!process.env.FIREBASE_PROJECT_ID) return DEFAULT_SITE_SETTINGS;
  try {
    const [heroDoc, socialDoc] = await Promise.all([
      adminDb.collection('siteSettings').doc('hero').get(),
      adminDb.collection('siteSettings').doc('social').get(),
    ]);
    const h = heroDoc.exists ? (heroDoc.data() as SiteSettings['hero']) : DEFAULT_SITE_SETTINGS.hero;
    const s = socialDoc.exists ? (socialDoc.data() as SiteSettings['social']) : DEFAULT_SITE_SETTINGS.social;
    return {
      hero: { imageUrl: h.imageUrl || DEFAULT_HERO_URL, alt: h.alt || DEFAULT_SITE_SETTINGS.hero.alt },
      social: { instagram: s.instagram || '', facebook: s.facebook || '', email: s.email || '' },
    };
  } catch (err) {
    console.error('getSiteSettings error:', err);
    return DEFAULT_SITE_SETTINGS;
  }
}
