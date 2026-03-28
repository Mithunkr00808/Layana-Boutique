"use client";

import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative h-[921px] w-full overflow-hidden bg-[var(--color-surface-low)]">
      <div className="absolute inset-0">
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD315us5QSxHnxztOXDZ8ttyjNhERsYzKjADSyBq75CASgaps_JA9zS0rdzP_dPN1bpscfJuYkI3j3-GPLU0DTyLml8mA6SPnaLUTELp3VwKIsPkI9rkDnzEPfutX5NILavsl41IXPCWWfAEgXAyOrpa75BQ0bisSsEQXH3U1vYhVjqgIHzOvZsDbN-dNmHJH8Z8qao4by3NB8hnCQnId8zey-8t0h7eOCxSG3IFcFUOPARCycg_FziDBev2QjpChOfUFlEvs9SbIa_"
          alt="Editorial fashion model posing in minimalist architectural setting"
          fill
          priority
          className="object-cover grayscale-[20%] scale-105 hover:scale-100 transition-transform duration-[2000ms] ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-on-surface)]/40 to-transparent pointer-events-none"></div>
      </div>
      <div className="relative h-full flex flex-col justify-end items-start px-10 pb-20 max-w-[1440px] mx-auto w-full">
        <h1 className="font-serif text-5xl md:text-[5rem] leading-[0.9] text-white font-light tracking-tighter mb-8 max-w-2xl">
          The New <br />
          <i className="font-serif italic font-light">Minimalism</i>
        </h1>
        <Link href="/ready-to-wear" className="group relative inline-block px-10 py-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-container)] text-white text-xs tracking-widest uppercase font-semibold overflow-hidden transition-all duration-300 active:scale-95">
          <span className="relative z-10">Shop Now</span>
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        </Link>
      </div>
    </section>
  );
}
