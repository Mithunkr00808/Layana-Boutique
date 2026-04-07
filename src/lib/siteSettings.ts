import { adminDb } from '@/lib/firebase/admin';

export interface HeroImage {
  imageUrl: string;
  alt: string;
  publicId?: string;
}

export interface SiteSettings {
  hero: {
    images: HeroImage[];
    // Legacy fields for backward compatibility
    imageUrl?: string;
    alt?: string;
  };
  social: {
    instagram: string;
    facebook: string;
    email: string;
  };
}

const DEFAULT_HERO_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD315us5QSxHnxztOXDZ8ttyjNhERsYzKjADSyBq75CASgaps_JA9zS0rdzP_dPN1bpscfJuYkI3j3-GPLU0DTyLml8mA6SPnaLUTELp3VwKIsPkI9rkDnzEPfutX5NILavsl41IXPCWWfAEgXAyOrpa75BQ0bisSsEQXH3U1vYhVjqgIHzOvZsDbN-dNmHJH8Z8qao4by3NB8hnCQnId8zey-8t0h7eOCxSG3IFcFUOPARCycg_FziDBev2QjpChOfUFlEvs9SbIa_';

const DEFAULT_SETTINGS: SiteSettings = {
  hero: {
    images: [
      {
        imageUrl: DEFAULT_HERO_URL,
        alt: 'Layana Boutique — curating conscious luxury',
      }
    ],
  },
  social: {
    instagram: '',
    facebook: '',
    email: '',
  },
};

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!process.env.FIREBASE_PROJECT_ID) return DEFAULT_SETTINGS;

  try {
    const [heroDoc, socialDoc] = await Promise.all([
      adminDb.collection('siteSettings').doc('hero').get(),
      adminDb.collection('siteSettings').doc('social').get(),
    ]);

    const h = heroDoc.exists
      ? (heroDoc.data() as SiteSettings['hero'])
      : DEFAULT_SETTINGS.hero;
    const s = socialDoc.exists
      ? (socialDoc.data() as SiteSettings['social'])
      : DEFAULT_SETTINGS.social;

    // Migrate old format to new format on read
    let processedImages = h.images || [];
    if (processedImages.length === 0 && h.imageUrl) {
      processedImages = [
        {
          imageUrl: h.imageUrl,
          alt: h.alt || 'Layana Boutique',
        }
      ];
    } else if (processedImages.length === 0) {
      processedImages = DEFAULT_SETTINGS.hero.images;
    }

    return {
      hero: {
        images: processedImages,
      },
      social: {
        instagram: s.instagram || '',
        facebook: s.facebook || '',
        email: s.email || '',
      },
    };
  } catch (err) {
    console.error('getSiteSettings error:', err);
    return DEFAULT_SETTINGS;
  }
}
