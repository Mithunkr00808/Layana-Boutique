import React from "react";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/jsonld";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-surface)]">
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      
      <main className="flex flex-grow flex-col items-center justify-center px-6 py-24 text-center">
        <FadeIn delay={0.1}>
          <h1 className="font-serif text-5xl md:text-7xl tracking-wide text-[var(--color-primary)]">
            Layana Boutique
          </h1>
        </FadeIn>
        
        <FadeIn delay={0.3}>
          <div className="mt-8 mb-12 h-px w-24 bg-[var(--color-outline-variant)] mx-auto"></div>
        </FadeIn>

        <FadeIn delay={0.5}>
          <h2 className="font-sans text-2xl md:text-3xl font-light text-[var(--color-on-surface)] mb-6">
            Opening Soon
          </h2>
          <p className="max-w-md text-sm md:text-base text-[var(--color-secondary)] mx-auto leading-relaxed">
            We are crafting something beautiful for you. Our curated collection of handpicked sarees, kurties, and kids wear will be available shortly.
          </p>
        </FadeIn>
        
        <FadeIn delay={0.7}>
          <div className="mt-12">
            <p className="text-xs uppercase tracking-widest text-[var(--color-secondary)] mb-4">
              Stay tuned for our launch
            </p>
            <div className="flex gap-4 justify-center">
              <span className="h-2 w-2 rounded-full bg-[var(--color-primary-container)] animate-pulse"></span>
              <span className="h-2 w-2 rounded-full bg-[var(--color-primary-container)] animate-pulse" style={{ animationDelay: "0.2s" }}></span>
              <span className="h-2 w-2 rounded-full bg-[var(--color-primary-container)] animate-pulse" style={{ animationDelay: "0.4s" }}></span>
            </div>
          </div>
        </FadeIn>
      </main>

      <footer className="py-8 text-center text-xs text-[var(--color-secondary)]">
        &copy; {new Date().getFullYear()} Layana Boutique. All rights reserved.
      </footer>
    </div>
  );
}
