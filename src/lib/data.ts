import { adminDb } from './firebase/admin';
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

export async function getCartItems(): Promise<CartItem[]> {
  if (!process.env.FIREBASE_PROJECT_ID) {
    return cartItemsMock;
  }

  try {
    const snapshot = await adminDb.collection('cartItems').get();

    if (snapshot.empty) return cartItemsMock;

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.id ?? doc.id,
        name: data.name,
        variant: data.variant,
        size: data.size,
        quantity: data.quantity ?? 1,
        price: data.price,
        rawPrice: data.rawPrice ?? 0,
        image: data.image,
        alt: data.alt,
      } as CartItem;
    });
  } catch (error) {
    console.error('Failed to fetch cart items from Firebase, falling back to mock data:', error);
    return cartItemsMock;
  }
}
