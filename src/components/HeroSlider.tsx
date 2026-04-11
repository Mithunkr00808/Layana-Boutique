'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SHOP_CATALOG_PATH } from '@/lib/catalog/categories';
import type { HeroImage } from '@/lib/siteSettings';

export default function HeroSlider({ images }: { images: HeroImage[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="relative h-[921px] w-full overflow-hidden bg-[var(--color-surface-low)]">
      {/* Slider Images */}
      {images.map((img, index) => (
        <div
          key={img.imageUrl}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <Image
            src={img.imageUrl}
            alt={img.alt || 'Hero Image'}
            fill
            priority={index === 0}
            loading={index === 0 ? 'eager' : 'lazy'}
            className="object-cover grayscale-[20%] scale-105 transform-gpu will-change-transform transition-transform duration-[6000ms] ease-out"
            style={{
              transform: index === currentIndex ? 'scale(1)' : 'scale(1.05)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent opacity-80 pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-on-surface)]/60 via-transparent to-transparent pointer-events-none"></div>
        </div>
      ))}

      {/* Content overlay */}
      <div className="relative z-20 h-full flex flex-col justify-end items-start px-10 pb-20 max-w-[1440px] mx-auto w-full">
        <h1 className="font-serif text-5xl md:text-[5rem] leading-[0.9] text-white font-light tracking-tighter mb-4 max-w-2xl">
          Designer <i className="font-serif italic font-light">Sarees,</i> <br />
          Kurties & Kids Wear
        </h1>
        <p className="text-white/70 text-sm tracking-[0.2em] uppercase font-sans mb-8">Curated by Layana Boutique</p>
        <Link 
          href={SHOP_CATALOG_PATH} 
          className="group relative inline-block px-10 py-4 border border-white/80 bg-white/10 backdrop-blur-sm text-white text-xs tracking-widest uppercase font-semibold overflow-hidden transition-all duration-300 hover:bg-white hover:text-zinc-900 active:scale-95"
        >
          <span className="relative z-10">Shop Now</span>
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        </Link>

        {/* Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-10 left-10 flex gap-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  idx === currentIndex ? 'w-8 bg-white' : 'w-4 bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
