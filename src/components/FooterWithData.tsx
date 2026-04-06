/**
 * FooterWithData — Server Component wrapper.
 * Fetches social links from Firestore and passes them to <Footer>.
 * Use this in Server Component pages (the majority).
 * Client Component pages should use <Footer /> directly (shows Coming Soon).
 */
import { getSiteSettings } from '@/lib/siteSettings';
import Footer from './Footer';

export default async function FooterWithData() {
  const { social } = await getSiteSettings();
  return <Footer social={social} />;
}
