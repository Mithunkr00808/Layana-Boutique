"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductMedia } from "@/types/product-media";

function MediaCard({ media, priority }: { media: ProductMedia; priority?: boolean }) {
  const isVideo = media.resourceType === "video";

  return (
    <div className="h-full w-full overflow-hidden bg-[var(--color-surface-container-low)]">
      {isVideo ? (
        <video
          src={media.src}
          poster={media.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
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
  const [current, setCurrent] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartRef = useRef<number>(0);
  const count = images.length;

  const goTo = useCallback(
    (index: number) => {
      const next = ((index % count) + count) % count;
      setCurrent(next);
      trackRef.current?.scrollTo({ left: next * trackRef.current.clientWidth, behavior: "smooth" });
    },
    [count]
  );

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (count <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => {
        const next = (prev + 1) % count;
        trackRef.current?.scrollTo({ left: next * trackRef.current.clientWidth, behavior: "smooth" });
        return next;
      });
    }, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [count]);

  const resetAutoSlide = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (count <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => {
        const next = (prev + 1) % count;
        trackRef.current?.scrollTo({ left: next * trackRef.current.clientWidth, behavior: "smooth" });
        return next;
      });
    }, 5000);
  }, [count]);

  const handlePrev = () => { resetAutoSlide(); goTo(current - 1); };
  const handleNext = () => { resetAutoSlide(); goTo(current + 1); };

  const handleTouchStart = (e: React.TouchEvent) => { touchStartRef.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { resetAutoSlide(); goTo(diff > 0 ? current + 1 : current - 1); }
  };

  const handleScroll = () => {
    if (!trackRef.current) return;
    const idx = Math.round(trackRef.current.scrollLeft / trackRef.current.clientWidth);
    if (idx !== current && idx >= 0 && idx < count) setCurrent(idx);
  };

  if (!images.length) {
    return (
      <div className="md:col-span-7">
        <div className="aspect-[3/4] overflow-hidden rounded-[20px] bg-[var(--color-surface-container-low)]" />
      </div>
    );
  }

  return (
    <div className="md:col-span-7">
      <div className="group/gallery relative w-full overflow-hidden rounded-2xl shadow-sm">
        {/* Carousel track */}
        <div
          ref={trackRef}
          className="flex w-full snap-x snap-mandatory overflow-x-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onScroll={handleScroll}
        >
          {images.map((media, index) => (
            <div
              key={`${media.publicId || media.src}-${index}`}
              className="w-full flex-shrink-0 snap-center aspect-[3/4]"
            >
              <MediaCard media={media} priority={index === 0} />
            </div>
          ))}
        </div>

        {/* Arrow navigation — visible on hover (desktop) */}
        {count > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-zinc-800 shadow-md border border-zinc-200 transition-all duration-200 hover:scale-110 hover:shadow-lg active:scale-95"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} strokeWidth={1.5} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-zinc-800 shadow-md border border-zinc-200 transition-all duration-200 hover:scale-110 hover:shadow-lg active:scale-95"
              aria-label="Next image"
            >
              <ChevronRight size={20} strokeWidth={1.5} />
            </button>
          </>
        )}

        {/* Slide counter badge */}
        {count > 1 && (
          <div className="absolute top-4 right-4 z-10 rounded-full bg-black/50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
            {current + 1} / {count}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {count > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {images.map((media, index) => {
            const isVideo = media.resourceType === "video";
            return (
              <button
                key={`thumb-${media.publicId || media.src}-${index}`}
                onClick={() => { resetAutoSlide(); goTo(index); }}
                className={`relative flex-shrink-0 w-16 h-20 md:w-20 md:h-24 rounded-md overflow-hidden transition-all duration-300 ${
                  index === current
                    ? "ring-2 ring-[var(--color-on-surface)] opacity-100"
                    : "opacity-50 hover:opacity-80"
                }`}
              >
                {isVideo ? (
                  <video
                    src={media.src}
                    poster={media.poster}
                    muted
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Image
                    src={media.src}
                    alt={media.alt}
                    width={80}
                    height={100}
                    className="h-full w-full object-cover"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
