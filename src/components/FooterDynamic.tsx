'use client';

import { useEffect, useState } from 'react';
import Footer, { type FooterSocialLinks } from './Footer';

/**
 * FooterDynamic — Client Component wrapper.
 * Fetches social links from the public /api/site-settings endpoint.
 * Use this inside Client Component pages that cannot import server-only modules.
 */
export default function FooterDynamic() {
  const [social, setSocial] = useState<FooterSocialLinks | undefined>(undefined);

  useEffect(() => {
    fetch('/api/site-settings')
      .then((r) => r.json())
      .then((data: FooterSocialLinks) => setSocial(data))
      .catch(() => { /* fail silently — Footer shows "Coming Soon" */ });
  }, []);

  return <Footer social={social} />;
}
