import Image from "next/image";
import Link from "next/link";
import { SHOP_CATALOG_PATH } from "@/lib/catalog/categories";
import { getSiteSettings } from "@/lib/siteSettings";

export default async function Hero() {
  const { hero } = await getSiteSettings();

  return (
    <section className="relative h-[921px] w-full overflow-hidden bg-[var(--color-surface-low)]">
      <div className="absolute inset-0">
        <Image
          src={hero.imageUrl}
          alt={hero.alt}
          fill
          priority
          loading="eager"
          className="object-cover grayscale-[20%] scale-105 hover:scale-100 transform-gpu will-change-transform transition-transform duration-[2000ms] ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent opacity-80 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-on-surface)]/60 via-transparent to-transparent pointer-events-none"></div>
      </div>
      <div className="relative h-full flex flex-col justify-end items-start px-10 pb-20 max-w-[1440px] mx-auto w-full">
        <h1 className="font-serif text-5xl md:text-[5rem] leading-[0.9] text-white font-light tracking-tighter mb-8 max-w-2xl">
          The New <br />
          <i className="font-serif italic font-light">Minimalism</i>
        </h1>
        <Link href={SHOP_CATALOG_PATH} className="group relative inline-block px-10 py-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-container)] text-white text-xs tracking-widest uppercase font-semibold overflow-hidden transition-all duration-300 active:scale-95">
          <span className="relative z-10">Shop Now</span>
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        </Link>
      </div>
    </section>
  );
}
