import type { DocumentSnapshot } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from './firebase/admin';
import {
  newArrivals,
  readyToWearProducts,
  journalArticles,
  productDetailMock,
  relatedProducts,
  cartItemsMock,
} from '@/data/mockData';

// ── Type definitions ────────────────────────────────────────────────────────

export interface Product {
  id: string;
  category?: string;
  name: string;
  price: string;
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

export interface ProductImage {
  src: string;
  alt: string;
  type: string;
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
  description: string;
  materials: string[];
  sustainability: string;
  images: ProductImage[];
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

// ── Data fetching functions ─────────────────────────────────────────────────

export async function getNewArrivals(): Promise<Product[]> {
  if (!process.env.FIREBASE_PROJECT_ID) {
    return newArrivals;
  }

  try {
    const snapshot = await adminDb.collection('products')
      .where('category', '==', 'new-arrivals')
      .get();

    if (snapshot.empty) return newArrivals;

    return snapshot.docs.map(doc => doc.data() as Product);
  } catch (error) {
    console.error('Failed to fetch new arrivals from Firebase, falling back to mock data:', error);
    return newArrivals;
  }
}

export async function getReadyToWearProducts(): Promise<Product[]> {
  if (!process.env.FIREBASE_PROJECT_ID) {
    return readyToWearProducts;
  }

  try {
    const snapshot = await adminDb.collection('products')
      .where('category', '==', 'ready-to-wear')
      .get();

    if (snapshot.empty) return readyToWearProducts;

    return snapshot.docs.map(doc => doc.data() as Product);
  } catch (error) {
    console.error('Failed to fetch RTW products from Firebase, falling back to mock data:', error);
    return readyToWearProducts;
  }
}

export async function getJournalArticles(): Promise<Article[]> {
  if (!process.env.FIREBASE_PROJECT_ID) {
    return journalArticles;
  }

  try {
    const snapshot = await adminDb.collection('articles').get();
    if (snapshot.empty) return journalArticles;

    return snapshot.docs.map(doc => doc.data() as Article);
  } catch (error) {
    console.error('Failed to fetch articles from Firebase, falling back to mock data:', error);
    return journalArticles;
  }
}

export async function getProductDetail(id: string): Promise<ProductDetail> {
  if (!process.env.FIREBASE_PROJECT_ID) {
    return productDetailMock;
  }

  try {
    let doc = await adminDb.collection('productDetails').doc(id).get();

    if (doc.exists) {
      return doc.data() as ProductDetail;
    }

    doc = await adminDb.collection('products').doc(`rtw-${id}`).get();
    if (!doc.exists) {
      doc = await adminDb.collection('products').doc(`new-arrival-${id}`).get();
    }

    if (doc.exists) {
      const summary = doc.data() as Product;
      
      return {
        id: summary.id || id,
        sku: `SKU-${summary.id?.toUpperCase() || id.toUpperCase()}`,
        categoryPath: summary.category || 'Catalog',
        name: summary.name || 'Unknown Product',
        price: summary.price || '$0.00',
        description: summary.options 
          ? `Made from ${summary.options}. This product has not had its full description, materials, or editorial images uploaded yet.` 
          : 'Full product description is pending. Please update via the admin panel.',
        materials: ['Detail pending - Update via catalog admin'],
        sustainability: 'Sustainability tracking pending',
        images: summary.image ? [{ src: summary.image, alt: summary.alt || summary.name || 'Product Image', type: 'large' }] : [],
        sizes: [
          { label: 'S', available: true },
          { label: 'M', available: true },
          { label: 'L', available: true },
        ]
      };
    }

    return productDetailMock;
  } catch (error) {
    console.error('Failed to fetch product detail from Firebase:', error);
    return productDetailMock;
  }
}

export async function getRelatedProducts(): Promise<Product[]> {
  if (!process.env.FIREBASE_PROJECT_ID) {
    return relatedProducts;
  }

  try {
    const snapshot = await adminDb.collection('products').limit(4).get();
    if (snapshot.empty) return relatedProducts;

    return snapshot.docs.map(doc => doc.data() as Product);
  } catch (error) {
    console.error('Failed to fetch related products:', error);
    return relatedProducts;
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
    return cartItemsMock;
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
    console.error('Failed to fetch cart items for user from Firebase, falling back to mock data:', error);
    return cartItemsMock;
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
    return cartItemsMock;
  }

  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) {
      return cartItemsMock;
    }

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = decoded?.uid;

    if (!uid) {
      return cartItemsMock;
    }

    return await getCartItems(uid);
  } catch (error) {
    console.error('Failed to verify session or fetch user cart, falling back to mock data:', error);
    return cartItemsMock;
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
    console.error('Failed to fetch user orders:', error);
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
