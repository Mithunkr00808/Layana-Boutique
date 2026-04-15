/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DocumentSnapshot } from 'firebase-admin/firestore';
import { unstable_cache } from 'next/cache';
import { cookies } from 'next/headers';
import { adminDb } from './firebase/admin';
import { buildCloudinaryVideoPosterUrl } from './cloudinary';
import { getSessionUid } from './auth/session-user';
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
  subCategories?: string[];
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
  subCategories?: string[];
  materials: string;
  sustainability: string;
  images: ProductMedia[];
  sizes: ProductSize[];
}

export interface CartItem {
  id: string;
  productId?: string;
  name: string;
  variant: string;
  size: string;
  quantity: number;
  price: string;
  rawPrice: number;
  image: string;
  alt: string;
  originalPrice?: string;
  rawOriginalPrice?: number;
}

export interface WishlistItemSummary {
  id: string;
  name: string;
  variant?: string;
  size?: string;
  price?: string;
  rawPrice?: number;
  image?: string;
  alt?: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  addressType?: "home" | "work" | "other";
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
        type: (item.type || (index === 1 || index === 2 ? 'half' : 'large')) as any,
        resourceType: resourceType as any,
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
    alt: data?.alt || `${data?.name || 'Product'} cover image`,
    isLimited: data?.isLimited ?? false,
    options: data?.options || '',
    subCategories: Array.isArray(data?.subCategories) ? data.subCategories : [],
  };
}

// ── Data fetching functions ─────────────────────────────────────────────────

export const getNewArrivals = unstable_cache(
  async (): Promise<Product[]> => {
    if (!process.env.FIREBASE_PROJECT_ID) {
      return [];
    }

    try {
      // Fetch reasonable limit of newest products natively
      const snapshot = await adminDb.collection('products')
        .orderBy('createdAt', 'desc')
        .limit(15)
        .get();

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
  },
  ['new-arrivals'],
  { tags: ['products'] }
);

export async function getReadyToWearProducts(filters?: { category?: string | null; size?: string | null; query?: string | null }): Promise<Product[]> {
  return unstable_cache(
    async () => {
      if (!process.env.FIREBASE_PROJECT_ID) {
        return [];
      }

      try {
        let query: FirebaseFirestore.Query = adminDb.collection('products');

        if (filters?.category && isKnownProductCategory(filters.category)) {
          query = query.where("category", "==", filters.category);
        }

        const snapshot = await query.get();

        if (snapshot.empty) return [];

        let products = snapshot.docs.map(mapProductDoc);

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
    },
    ['ready-to-wear', filters?.category || 'all', filters?.size || 'all', filters?.query || 'none'],
    { tags: ['products'] }
  )();
}

export const getJournalArticles = unstable_cache(
  async (): Promise<Article[]> => {
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
  },
  ['journal-articles'],
  { tags: ['articles'] }
);

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
        subCategories: Array.isArray(raw.subCategories) ? raw.subCategories : [],
        materials: raw.materials || '',
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
        materials: 'Detail pending - Update via catalog admin',
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

export async function getRelatedProducts(currentId?: string, category?: string): Promise<Product[]> {
  if (!process.env.FIREBASE_PROJECT_ID) {
    return [];
  }

  try {
    let query: FirebaseFirestore.Query = adminDb.collection('products');
    
    if (category) {
      query = query.where('category', '==', category);
    }
    
    const snapshot = await query.limit(10).get();
    
    let products = snapshot.docs.map(mapProductDoc).filter(p => p.id !== currentId);
    
    if (category && products.length < 4) {
      const fallbackSnap = await adminDb.collection('products').limit(10).get();
      const fallbacks = fallbackSnap.docs.map(mapProductDoc).filter(p => p.id !== currentId && p.category !== category);
      products = [...products, ...fallbacks];
    }

    return products.slice(0, 4);
  } catch (error) {
    console.error('Failed to fetch related products:', error);
    return [];
  }
}

function mapCartDoc(doc: DocumentSnapshot): CartItem {
  const data = doc.data() as Partial<CartItem>;

  return {
    id: data?.id ?? doc.id,
    productId: data?.productId ?? '',
    name: data?.name ?? 'Unknown Item',
    variant: data?.variant ?? '',
    size: data?.size ?? '',
    quantity: data?.quantity ?? 1,
    price: data?.price ?? '₹0.00',
    rawPrice: data?.rawPrice ?? 0,
    image: data?.image ?? '',
    alt: data?.alt ?? '',
    originalPrice: data?.originalPrice,
    rawOriginalPrice: data?.rawOriginalPrice,
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
    const uid = await getSessionUid();
    if (uid) {
      // Cart merge is handled exclusively by /api/cart/migrate
      // (called once on login from AuthContext). No merge logic here
      // to prevent race conditions and duplicate quantity increments.
      return await getCartItems(uid);
    }

    // Fallback to guest cart cookie
    const cookieStore = await cookies();
    const val = cookieStore.get('guestCart')?.value;
    if (!val) return [];

    let items;
    try {
      items = JSON.parse(val);
    } catch {
      return [];
    }

    if (!Array.isArray(items) || items.length === 0) return [];

    // Hydrate cart item prices and metadata directly from products collection for security
    const hydratedPromises = items.map(async (item: any) => {
      const productRef = adminDb.collection('products').doc(item.productId);
      const snap = await productRef.get();
      if (!snap.exists) return null;

      const data = snap.data();
      if (!data) return null;
      
      const rawPrice = data.price && typeof data.price === "string" ? parseFloat(data.price.replace(/[^\d.]/g, "")) : 0;

      return {
        id: item.id || `${item.productId}-${item.size || "onesize"}`,
        productId: item.productId,
        name: data.name || "Unknown Item",
        variant: "",
        size: item.size || "",
        quantity: item.quantity,
        price: formatIndianPrice(data.price),
        rawPrice: rawPrice,
        image: data.image || "",
        alt: data.alt || data.name || "",
      } as CartItem;
    });

    const hydrated = await Promise.all(hydratedPromises);
    return hydrated.filter(Boolean) as CartItem[];
  } catch (error) {
    console.error('Failed to verify session or fetch cart:', error);
    return [];
  }
}

export async function getUserWishlistItems(limit = 20): Promise<WishlistItemSummary[]> {
  if (!process.env.FIREBASE_PROJECT_ID) {
    return [];
  }

  try {
    const uid = await getSessionUid();
    if (!uid) return [];

    const snapshot = await adminDb
      .collection("users")
      .doc(uid)
      .collection("wishlist")
      .limit(limit)
      .get();

    if (snapshot.empty) return [];

    return snapshot.docs.map((doc) => {
      const data = doc.data() as Partial<WishlistItemSummary>;
      return {
        id: doc.id,
        name: data.name ?? "Saved item",
        variant: data.variant ?? "",
        size: data.size ?? "",
        price: data.price,
        rawPrice: data.rawPrice ?? 0,
        image: data.image ?? "",
        alt: data.alt ?? data.name ?? "Saved item",
      };
    });
  } catch (error) {
    console.error("Failed to fetch user wishlist items:", error);
    return [];
  }
}

export async function getUserAddresses(): Promise<Address[]> {
  if (!process.env.FIREBASE_PROJECT_ID) {
    return [];
  }

  try {
    const uid = await getSessionUid();
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
    const uid = await getSessionUid();
    if (!uid) return null;

    const docRef = adminDb.collection('orders').doc(orderId);
    const doc = await docRef.get();
    if (!doc.exists) return null;

    // Ownership check: only return the order if it belongs to this user
    const data = doc.data() as any;
    if (data.userId !== uid) return null;

    // Delegate to shared mapOrder() to avoid duplicate mapping logic
    return mapOrder(doc);
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
    const uid = await getSessionUid();
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

// Site Settings are managed exclusively by @/lib/siteSettings.
// The duplicate SiteSettings type and getSiteSettings function that existed
// here have been removed to eliminate type confusion. Import from
// '@/lib/siteSettings' for all site settings needs.
