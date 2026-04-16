import { MetadataRoute } from 'next';
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const BASE_URL = getSiteUrl();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        "/admin",
        "/admin/",
        "/checkout",
        "/checkout/",
        "/api",
        "/api/",
        "/account",
        "/account/",
        "/cart",
        "/cart/",
        "/order",
        "/order/",
        "/login",
        "/signup",
        "/forgot-password",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
