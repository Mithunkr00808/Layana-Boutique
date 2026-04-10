import { MetadataRoute } from 'next';
import { getReadyToWearProducts } from '@/lib/data';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://layanaboutique.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  // Core public static routes (no private/auth pages)
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/ready-to-wear`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
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

