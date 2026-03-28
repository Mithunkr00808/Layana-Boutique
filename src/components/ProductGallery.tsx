"use client";

import Image from "next/image";

interface ImageProps {
  src: string;
  alt: string;
  type: string;
}

export default function ProductGallery({ images }: { images: ImageProps[] }) {
  return (
    <div className="md:col-span-7 space-y-10">
      {/* 1. Large Image */}
      {images[0] && (
        <div className="aspect-[3/4] overflow-hidden bg-[var(--color-surface-container-low)]">
          <Image
            src={images[0].src}
            alt={images[0].alt}
            width={800}
            height={1066}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* 2. Half Images */}
      <div className="grid grid-cols-2 gap-10">
        {images[1] && (
          <div className="aspect-[3/4] overflow-hidden bg-[var(--color-surface-container-low)]">
            <Image
              src={images[1].src}
              alt={images[1].alt}
              width={400}
              height={533}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        {images[2] && (
          <div className="aspect-[3/4] overflow-hidden bg-[var(--color-surface-container-low)]">
            <Image
              src={images[2].src}
              alt={images[2].alt}
              width={400}
              height={533}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* 3. Large Image */}
      {images[3] && (
        <div className="aspect-[3/4] overflow-hidden bg-[var(--color-surface-container-low)]">
          <Image
            src={images[3].src}
            alt={images[3].alt}
            width={800}
            height={1066}
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
