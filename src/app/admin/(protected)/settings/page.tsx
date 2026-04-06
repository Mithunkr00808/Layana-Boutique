import { getSiteSettings } from '@/lib/siteSettings';
import SettingsClient from './_components/SettingsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Store Settings | Layana Boutique Admin',
};

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-[#c3c6d6]/10">
        <h1 className="font-serif text-2xl font-bold text-[#1b1c1c]">Store Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your storefront hero image and social media contact links.
        </p>
      </div>
      <SettingsClient settings={settings} />
    </div>
  );
}
