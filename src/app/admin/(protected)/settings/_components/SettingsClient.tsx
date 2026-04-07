'use client';

import Image from 'next/image';
import { useRef, useState, useTransition, useCallback } from 'react';
import { ImageIcon, Mail, CheckCircle2, AlertCircle, Save, Upload, X, Trash2 } from 'lucide-react';
import { uploadHeroImageAction, saveSocialSettings, saveHeroImages } from '../actions';
import type { SiteSettings, HeroImage } from '@/lib/siteSettings';

// ── Inline SVG icons (lucide 1.7.0 doesn't have Instagram/Facebook) ──────────
function InstagramIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

// ── Status Banner ─────────────────────────────────────────────────────────────
function StatusBanner({ status, message }: { status: 'idle' | 'success' | 'error'; message?: string }) {
  if (status === 'idle') return null;
  return (
    <div className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
      status === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
    }`}>
      {status === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {status === 'success' ? 'Saved successfully!' : (message || 'An error occurred.')}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SettingsClient({ settings }: { settings: SiteSettings }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hero state
  const [heroImages, setHeroImages] = useState<HeroImage[]>(settings.hero.images || []);
  const [isDragging, setIsDragging] = useState(false);
  const [heroStatus, setHeroStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [heroError, setHeroError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(false);
  const [isPendingHeroSave, startHeroSaveTransition] = useTransition();

  // Social state
  const [instagram, setInstagram] = useState(settings.social.instagram);
  const [facebook, setFacebook] = useState(settings.social.facebook);
  const [email, setEmail] = useState(settings.social.email);
  const [socialStatus, setSocialStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [socialError, setSocialError] = useState('');
  const [isPendingSocial, startSocialTransition] = useTransition();

  // ── Hero Actions ────────────────────────────────────────────────────────────
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setHeroError('Please select an image file (JPG, PNG, WebP, etc.)');
      setHeroStatus('error');
      setTimeout(() => setHeroStatus('idle'), 3000);
      return;
    }

    setUploadProgress(true);
    setHeroStatus('idle');

    const fd = new FormData();
    fd.append('heroImage', file);

    const result = await uploadHeroImageAction(fd);

    if (result.success && result.imageUrl) {
      setHeroImages((prev) => [
        ...prev,
        {
          imageUrl: result.imageUrl as string,
          alt: 'Layana Boutique hero image',
          publicId: result.publicId,
        },
      ]);
    } else {
      setHeroError(result.error || 'Upload failed.');
      setHeroStatus('error');
      setTimeout(() => setHeroStatus('idle'), 4000);
    }
    setUploadProgress(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  }, []);

  const removeImage = (indexToRemove: number) => {
    setHeroImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const updateImageAlt = (index: number, newAlt: string) => {
    setHeroImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, alt: newAlt } : img))
    );
  };

  function handleHeroSave() {
    startHeroSaveTransition(async () => {
      const result = await saveHeroImages(JSON.stringify(heroImages));
      if (result.success) {
        setHeroStatus('success');
      } else {
        setHeroError(result.error || 'Failed to save hero images.');
        setHeroStatus('error');
      }
      setTimeout(() => setHeroStatus('idle'), 3000);
    });
  }

  // ── Social submit ───────────────────────────────────────────────────────────
  function handleSocialSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startSocialTransition(async () => {
      const result = await saveSocialSettings(fd);
      if (result.success) {
        setSocialStatus('success');
      } else {
        setSocialError(result.error || 'Error saving links');
        setSocialStatus('error');
      }
      setTimeout(() => setSocialStatus('idle'), 3000);
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* ── Hero Image Card ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-[#c3c6d6]/10 overflow-hidden">
        <div className="p-6 border-b border-[#c3c6d6]/10 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><ImageIcon size={18} /></div>
          <div>
            <h2 className="font-serif text-lg font-bold text-[#1b1c1c]">Hero Images Slider</h2>
            <p className="text-xs text-gray-400">Manage images for the homepage animated banner</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Images List */}
          <div className="space-y-4">
            {heroImages.map((img, idx) => (
              <div key={idx} className="flex gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50/50 items-start">
                <div className="relative w-32 h-20 rounded overflow-hidden flex-shrink-0 bg-gray-200">
                  <Image src={img.imageUrl} alt={img.alt} fill className="object-cover" unoptimized />
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <label className="block text-[0.65rem] font-bold uppercase tracking-widest text-gray-500 mb-1">
                      Alt Text
                    </label>
                    <input
                      type="text"
                      value={img.alt}
                      onChange={(e) => updateImageAlt(idx, e.target.value)}
                      placeholder="Image description..."
                      className="w-full border-b border-gray-200 bg-transparent py-1 text-sm text-[#1b1c1c] focus:border-[#0051C3] focus:outline-none transition-colors"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition"
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              </div>
            ))}

            {heroImages.length === 0 && (
              <div className="text-center p-6 text-gray-400 text-sm border border-dashed rounded-xl">
                No hero images uploaded yet.
              </div>
            )}
          </div>

          {/* Drag & drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl py-6 px-4 cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-[#0051C3] bg-blue-50 scale-[1.01]'
                : uploadProgress
                ? 'border-blue-200 bg-blue-50/30'
                : 'border-gray-200 hover:border-[#0051C3]/50 hover:bg-gray-50'
            }`}
            onClick={() => !uploadProgress && fileInputRef.current?.click()}
          >
            <div className={`p-3 rounded-full transition-colors ${
              uploadProgress ? 'bg-blue-100 text-blue-600 animate-pulse' : 'bg-gray-100 text-gray-400'
            }`}>
              {uploadProgress ? <Upload size={22} className="animate-bounce" /> : <Upload size={22} />}
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[#1b1c1c]">
                {uploadProgress ? 'Uploading...' : 'Click to add a new image'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPG, PNG, WebP · Recommended: 1920×1080 or wider
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploadProgress}
            />
          </div>

          <StatusBanner status={heroStatus} message={heroError} />

          <button
            type="button"
            onClick={handleHeroSave}
            disabled={isPendingHeroSave || uploadProgress}
            className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-widest transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-[#1b1c1c] text-white hover:bg-[#0051C3]"
          >
            {isPendingHeroSave ? (
              <>
                <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full" />
                Saving Changes…
              </>
            ) : (
              <>
                <Save size={14} />
                Save Hero Settings
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Social Links Card ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-[#c3c6d6]/10 overflow-hidden">
        <div className="p-6 border-b border-[#c3c6d6]/10 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-pink-50 text-pink-600"><InstagramIcon size={18} /></div>
          <div>
            <h2 className="font-serif text-lg font-bold text-[#1b1c1c]">Contact & Social Links</h2>
            <p className="text-xs text-gray-400">Displayed in the site footer</p>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSocialSubmit} className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-widest text-gray-500 mb-1">
                <InstagramIcon size={12} /> Instagram URL
              </label>
              <input
                type="url"
                name="instagram"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/layanaofficial"
                className="w-full border-b border-gray-200 bg-transparent py-2 text-sm text-[#1b1c1c] focus:border-[#0051C3] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-widest text-gray-500 mb-1">
                <FacebookIcon size={12} /> Facebook URL
              </label>
              <input
                type="url"
                name="facebook"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://facebook.com/layanaboutique"
                className="w-full border-b border-gray-200 bg-transparent py-2 text-sm text-[#1b1c1c] focus:border-[#0051C3] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-widest text-gray-500 mb-1">
                <Mail size={12} /> Contact Email
              </label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@layanaboutique.com"
                className="w-full border-b border-gray-200 bg-transparent py-2 text-sm text-[#1b1c1c] focus:border-[#0051C3] focus:outline-none transition-colors"
              />
            </div>

            {/* Footer preview */}
            <div className="rounded-xl bg-gray-50 p-4 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Footer Preview</p>
              <div className="flex gap-5 flex-wrap">
                {instagram && (
                  <a href={instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-pink-600 transition-colors">
                    <InstagramIcon size={13} /> Instagram
                  </a>
                )}
                {facebook && (
                  <a href={facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-blue-600 transition-colors">
                    <FacebookIcon size={13} /> Facebook
                  </a>
                )}
                {email && (
                  <a href={`mailto:${email}`} className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#1b1c1c] transition-colors">
                    <Mail size={13} /> Email Us
                  </a>
                )}
                {!instagram && !facebook && !email && (
                  <span className="text-xs text-gray-400 italic">No links configured yet</span>
                )}
              </div>
            </div>

            <StatusBanner status={socialStatus} message={socialError} />

            <button
              type="submit"
              disabled={isPendingSocial}
              className="w-full flex items-center justify-center gap-2 bg-[#1b1c1c] text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#0051C3] transition-colors disabled:opacity-50"
            >
              <Save size={14} />
              {isPendingSocial ? 'Saving…' : 'Save Social Links'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
