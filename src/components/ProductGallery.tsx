"use client";

import Image from "next/image";
import type { ProductMedia } from "@/types/product-media";

function getLayoutClass(index: number) {
  if (index === 0) {
    return "col-span-2 aspect-[3/4]";
  }

  if (index === 1 || index === 2) {
    return "col-span-1 aspect-[3/4]";
  }

  return "col-span-2 aspect-[3/4]";
}

function MediaCard({ media, priority }: { media: ProductMedia; priority?: boolean }) {
  const isVideo = media.resourceType === "video";

  return (
    <div className="h-full w-full rounded-[20px] overflow-hidden bg-[var(--color-surface-container-low)]">
      {isVideo ? (
        <video
          src={media.src}
          poster={media.poster}
          controls
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />
      ) : (
        <Image
          src={media.src}
          alt={media.alt}
          width={800}
          height={1066}
          priority={priority}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}

export default function ProductGallery({ images }: { images: ProductMedia[] }) {
  if (!images.length) {
    return (
      <div className="space-y-10 md:col-span-7">
        <div className="aspect-[3/4] overflow-hidden bg-[var(--color-surface-container-low)]" />
      </div>
    );
  }

  return (
    <div className="space-y-10 md:col-span-7">
      <div className="grid grid-cols-2 gap-10">
        {images.map((media, index) => (
          <div key={`${media.publicId || media.src}-${index}`} className={getLayoutClass(index)}>
            <MediaCard media={media} priority={index === 0} />
          </div>
        ))}
      </div>
    </div>
  );
}
