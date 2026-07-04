import { MetadataRoute } from 'next';
import { getReadyToWearProducts } from '@/lib/data';
import { getSiteUrl } from "@/lib/site-url";

const BASE_URL = getSiteUrl();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Core public static routes (no private/auth pages)
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/refund-policy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms-of-use`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // Collection category routes
  const collectionRoutes: MetadataRoute.Sitemap = [
    'sarees',
    'kurties',
    'kids-wear',
  ].map((slug) => ({
    url: `${BASE_URL}/collections/${slug}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  try {
    // Dynamic product routes
    const products = await getReadyToWearProducts();
    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${BASE_URL}/product/${product.id}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...staticRoutes, ...collectionRoutes, ...productRoutes];
  } catch (error) {
    console.error('Failed to generate sitemap:', error);
    return [...staticRoutes, ...collectionRoutes];
  }
}

