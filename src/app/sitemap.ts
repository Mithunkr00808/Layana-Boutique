import { MetadataRoute } from 'next';
import { getReadyToWearProducts } from '@/lib/data';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://layanaboutique.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base static routes
  const staticRoutes = [
    '',
    '/ready-to-wear',
    '/journal',
    '/collections',
    '/account',
    '/account/orders',
    '/account/addresses',
    '/account/preferences',
    '/cart',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  try {
    // Dynamic products
    const products = await getReadyToWearProducts();
    const productRoutes = products.map((product) => ({
      url: `${BASE_URL}/product/${product.id}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...staticRoutes, ...productRoutes];
  } catch (error) {
    console.error('Failed to generate sitemap:', error);
    return staticRoutes;
  }
}
