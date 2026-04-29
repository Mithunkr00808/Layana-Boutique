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
  policies: {
    refundPolicy: string;
    termsOfUse: string;
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
  policies: {
    refundPolicy: `At Layana Boutique, we value your trust and strive to ensure complete satisfaction with every purchase. Each saree is carefully inspected, packed, and shipped to maintain the highest standards of quality and authenticity.

## 1. Order Cancellations
Once an order has been placed and payment is completed, it cannot be cancelled under any circumstances.

We encourage customers to review all order details, sizes, colors, and delivery addresses carefully before confirming payment.

## 2. Return Policy
We follow a strict No Return Policy due to the delicate and custom nature of our handcrafted sarees.

**Returns will not be accepted for reasons such as:**
- Color, fabric, or design not meeting personal preference
- Change of mind after purchase

**The only exception is if the product received is damaged or defective.**

**To qualify for review:**
- You must share a clear unboxing video showing the parcel being opened, the saree inside, and the visible damage.
- The Order ID must be mentioned in the video or message.
- Send the video and details immediately upon delivery to our WhatsApp number or email **layanabydhanya@gmail.com**.

Our team will verify the claim and provide guidance on replacement eligibility.

## 3. Refund Policy
Refunds are not issued once an order is confirmed and processed.

**However, in rare cases of a verified damaged or wrong item received, we may offer:**
- A replacement of the same or similar product, or
- A refund to the original payment method (if replacement is unavailable).

**Please note:**
- Shipping, handling, and PayPal transaction fees are non-refundable.
- Refunds (if approved) will be processed within 7–10 business days after verification.

## 4. Contact Information
For any issues related to returns, damages, or product concerns, please contact:

- **Email:** layanabydhanya@gmail.com
- **Phone / WhatsApp:** 
- **Website:** layanaboutique.com`,
    termsOfUse: `## Introduction
Welcome to Layana Boutique. This website is owned and operated by Layana Boutique. By visiting our website and accessing the information, resources, services, products, and tools we provide, you understand and agree to accept and adhere to the following terms and conditions as stated in this policy (hereafter referred to as 'User Agreement'), along with the terms and conditions as stated in our Privacy Policy.

**This agreement is in effect as of May 1st 2026.**

We reserve the right to change this User Agreement from time to time without notice. You acknowledge and agree that it is your responsibility to review this User Agreement periodically to familiarize yourself with any modifications. Your continued use of this site after such modifications will constitute acknowledgment and agreement of the modified terms and conditions.

## Responsible Use and Conduct
By visiting our website and accessing the information, resources, services, products, and tools we provide for you, either directly or indirectly (hereafter referred to as 'Resources'), you agree to use these resources only for the purposes intended as permitted by (a) the terms of this User Agreement, and (b) applicable laws, regulations, and generally accepted online practices or guidelines.

**Wherein, you understand that:**
1. In order to access our Resources, you may be required to provide certain information about yourself (such as identification, contact details, etc.) as part of the registration process, or as part of your ability to use the resources. You agree that any information you provide will always be accurate, correct, and up to date.
2. You are responsible for maintaining the confidentiality of any login information associated with any account you use to access our Resources. Accordingly, you are responsible for all activities that occur under your account(s).
3. Accessing (or attempting to access) any of our Resources by any means other than through the means we provide is strictly prohibited. You specifically agree not to access (or attempt to access) any of our Resources through any automated, unethical, or unconventional means.
4. Engaging in any activity that disrupts or interferes with our Resources, including the servers and/or networks to which our Resources are located or connected, is strictly prohibited.
5. Attempting to copy, duplicate, reproduce, sell, trade, or resell our Resources is strictly prohibited.
6. You are solely responsible for any consequences, losses, or damages that we may directly or indirectly incur or suffer due to any unauthorized activities conducted by you, as explained above, and may incur criminal or civil liability.

We may provide various open communication tools on our website, such as blog comments, blog posts, public chat, forums, message boards, newsgroups, product ratings and reviews, various social media services, etc. You understand that generally we do not pre-screen or monitor the content posted by users of these various communication tools, which means that if you choose to use these tools to submit any type of content to our website, then it is your personal responsibility to use these tools in a responsible and ethical manner. 

**By posting information or otherwise using any open communication tools as mentioned, you agree that you will not upload, post, share, or otherwise distribute any content that:**
- Is illegal, threatening, defamatory, abusive, harassing, degrading, intimidating, fraudulent, deceptive, invasive, racist, or contains any type of suggestive, inappropriate, or explicit language.
- Infringes on any trademark, patent, trade secret, copyright, or other proprietary right of any party.
- Contains any type of unauthorized or unsolicited advertising.
- Impersonates any person or entity, including any Layana Boutique employees or representatives.

We have the right at our sole discretion to remove any content that we feel in our judgment does not comply with this User Agreement, along with any content that we feel is otherwise offensive, harmful, objectionable, inaccurate, or violates any 3rd party copyrights or trademarks. We are not responsible for any delay or failure in removing such content. If you post content that we choose to remove, you hereby consent to such removal, and consent to waive any claim against us.

We do not assume any liability for any content posted by you or any other 3rd party users of our website. However, any content posted by you using any open communication tools on our website, provided that it doesn't violate or infringe on any 3rd party copyrights or trademarks, becomes the property of Layana Boutique, and as such, gives us a perpetual, irrevocable, worldwide, royalty-free, exclusive license to reproduce, modify, adapt, translate, publish, publicly display, and/or distribute as we see fit. This only refers and applies to content posted via open communication tools as described, and does not refer to information that is provided as part of the registration process, necessary in order to use our resources. All information provided as part of our registration process is covered by our privacy policy.

You agree to indemnify and hold harmless Layana Boutique and its parent company and affiliates, and their directors, officers, managers, employees, donors, agents, and licensors, from and against all losses, expenses, damages, and costs, including reasonable attorney's fees, resulting from any violation of this User Agreement or the failure to fulfill any obligations relating to your account incurred by you or any other person using your account. We reserve the right to take over the exclusive defense of any claim for which we are entitled to indemnification under this User Agreement. In such event, you shall provide us with such cooperation as is reasonably requested by us.`,
  }
};

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!process.env.FIREBASE_PROJECT_ID) return DEFAULT_SETTINGS;

  try {
    const [heroDoc, socialDoc, policiesDoc] = await Promise.all([
      adminDb.collection('siteSettings').doc('hero').get(),
      adminDb.collection('siteSettings').doc('social').get(),
      adminDb.collection('siteSettings').doc('policies').get(),
    ]);

    const h = heroDoc.exists
      ? (heroDoc.data() as SiteSettings['hero'])
      : DEFAULT_SETTINGS.hero;
    const s = socialDoc.exists
      ? (socialDoc.data() as SiteSettings['social'])
      : DEFAULT_SETTINGS.social;
    const p = policiesDoc.exists
      ? (policiesDoc.data() as SiteSettings['policies'])
      : DEFAULT_SETTINGS.policies;

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
      policies: {
        refundPolicy: p.refundPolicy || DEFAULT_SETTINGS.policies.refundPolicy,
        termsOfUse: p.termsOfUse || DEFAULT_SETTINGS.policies.termsOfUse,
      }
    };
  } catch (err) {
    console.error('getSiteSettings error:', err);
    return DEFAULT_SETTINGS;
  }
}
