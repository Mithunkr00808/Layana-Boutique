'use client';

import Image from 'next/image';
import { useRef, useState, useTransition, useCallback } from 'react';
import { ImageIcon, Mail, CheckCircle2, AlertCircle, Save, Upload, X } from 'lucide-react';
import { uploadAndSaveHeroImage, saveSocialSettings } from '../actions';
import type { SiteSettings } from '@/lib/siteSettings';

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
  const [heroAlt, setHeroAlt] = useState(settings.hero.alt);
  const [currentHeroUrl, setCurrentHeroUrl] = useState(settings.hero.imageUrl);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [heroStatus, setHeroStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [heroError, setHeroError] = useState('');
  const [heroProgress, setHeroProgress] = useState('');
  const [isPendingHero, startHeroTransition] = useTransition();

  // Social state
  const [instagram, setInstagram] = useState(settings.social.instagram);
  const [facebook, setFacebook] = useState(settings.social.facebook);
  const [email, setEmail] = useState(settings.social.email);
  const [socialStatus, setSocialStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [socialError, setSocialError] = useState('');
  const [isPendingSocial, startSocialTransition] = useTransition();

  // ── File picking helpers ────────────────────────────────────────────────────
  const applyFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setHeroError('Please select an image file (JPG, PNG, WebP, etc.)');
      setHeroStatus('error');
      setTimeout(() => setHeroStatus('idle'), 3000);
      return;
    }
    setPendingFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPendingPreview(objectUrl);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) applyFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) applyFile(file);
  }, [applyFile]);

  const clearPending = () => {
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingFile(null);
    setPendingPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Hero upload submit ──────────────────────────────────────────────────────
  function handleHeroSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pendingFile) {
      setHeroError('Please select an image first.');
      setHeroStatus('error');
      setTimeout(() => setHeroStatus('idle'), 3000);
      return;
    }

    const fd = new FormData();
    fd.append('heroImage', pendingFile);
    fd.append('alt', heroAlt);

    startHeroTransition(async () => {
      setHeroProgress('Uploading to Cloudinary…');
      const result = await uploadAndSaveHeroImage(fd);

      if (result.success && result.imageUrl) {
        setCurrentHeroUrl(result.imageUrl);
        clearPending();
        setHeroStatus('success');
        setHeroProgress('');
      } else {
        setHeroError(result.error || 'Upload failed.');
        setHeroStatus('error');
        setHeroProgress('');
      }
      setTimeout(() => setHeroStatus('idle'), 4000);
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

  const displayPreviewUrl = pendingPreview || currentHeroUrl;
  const isUploading = isPendingHero;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* ── Hero Image Card ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-[#c3c6d6]/10 overflow-hidden">
        <div className="p-6 border-b border-[#c3c6d6]/10 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><ImageIcon size={18} /></div>
          <div>
            <h2 className="font-serif text-lg font-bold text-[#1b1c1c]">Hero Image</h2>
            <p className="text-xs text-gray-400">Homepage banner — upload from your device</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Current / preview image */}
          <div className="relative w-full aspect-[16/7] rounded-xl overflow-hidden bg-gray-100 group">
            {displayPreviewUrl ? (
              <Image
                src={displayPreviewUrl}
                alt={heroAlt || 'Hero preview'}
                fill
                className="object-cover transition-opacity duration-300"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                <ImageIcon size={40} />
                <span className="text-xs font-medium">No image uploaded yet</span>
              </div>
            )}

            {/* Overlay gradient */}
            {displayPreviewUrl && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            )}

            {/* Pending file badge */}
            {pendingFile && (
              <div className="absolute top-3 left-3 flex items-center gap-2 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg">
                <Upload size={11} />
                Ready to upload
              </div>
            )}

            {/* Clear pending button */}
            {pendingFile && !isUploading && (
              <button
                type="button"
                onClick={clearPending}
                className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
                title="Remove selected image"
              >
                <X size={14} />
              </button>
            )}

            {/* Live / uploading badge */}
            <span className={`absolute bottom-3 left-3 text-white text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded ${
              isUploading ? 'bg-blue-600 animate-pulse' : 'bg-black/50'
            }`}>
              {isUploading ? (heroProgress || 'Uploading…') : (pendingFile ? 'Preview' : 'Current Hero')}
            </span>
          </div>

          <form onSubmit={handleHeroSubmit} className="space-y-4">
            {/* Drag & drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl py-8 px-4 cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-[#0051C3] bg-blue-50 scale-[1.01]'
                  : pendingFile
                  ? 'border-amber-400 bg-amber-50'
                  : 'border-gray-200 hover:border-[#0051C3]/50 hover:bg-gray-50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className={`p-3 rounded-full transition-colors ${
                pendingFile ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'
              }`}>
                <Upload size={22} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-[#1b1c1c]">
                  {pendingFile ? pendingFile.name : 'Click to browse or drag & drop'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {pendingFile
                    ? `${(pendingFile.size / 1024 / 1024).toFixed(2)} MB · ${pendingFile.type}`
                    : 'JPG, PNG, WebP · Recommended: 1920×1080 or wider'}
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Alt text */}
            <div>
              <label className="block text-[0.65rem] font-bold uppercase tracking-widest text-gray-500 mb-1">
                Image Alt Text
              </label>
              <input
                type="text"
                value={heroAlt}
                onChange={(e) => setHeroAlt(e.target.value)}
                placeholder="Describe the hero image for accessibility…"
                className="w-full border-b border-gray-200 bg-transparent py-2 text-sm text-[#1b1c1c] focus:border-[#0051C3] focus:outline-none transition-colors"
              />
            </div>

            <StatusBanner status={heroStatus} message={heroError} />

            <button
              type="submit"
              disabled={isUploading || !pendingFile}
              className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-widest transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-[#1b1c1c] text-white hover:bg-[#0051C3]"
            >
              {isUploading ? (
                <>
                  <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full" />
                  Uploading…
                </>
              ) : (
                <>
                  <Upload size={14} />
                  {pendingFile ? 'Upload & Save Hero Image' : 'Select an image to upload'}
                </>
              )}
            </button>
          </form>
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
