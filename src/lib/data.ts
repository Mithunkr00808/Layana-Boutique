import { adminDb } from './firebase/admin';
import {
  newArrivals,
  readyToWearProducts,
  journalArticles,
  productDetailMock,
  relatedProducts,
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
    // Try exact doc ID first, then try common prefixed patterns from seeding
    let doc = await adminDb.collection('productDetails').doc(id).get();

    if (!doc.exists) {
      doc = await adminDb.collection('products').doc(`rtw-${id}`).get();
    }
    if (!doc.exists) {
      doc = await adminDb.collection('products').doc(`new-arrival-${id}`).get();
    }

    if (!doc.exists) return productDetailMock;

    return doc.data() as ProductDetail;
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
