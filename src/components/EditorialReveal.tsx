import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function EditorialReveal() {
  return (
    <section className="py-24 bg-[var(--color-surface-low)] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-10">
        <div className="grid grid-cols-12 gap-4 items-center">
          {/* Large Image */}
          <div className="col-span-12 md:col-span-7 relative z-10">
            <div className="aspect-[16/9] md:aspect-[4/5] overflow-hidden relative">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPG7WMckbaGDkL40dwdK6C7NXtIGM1jriRos9Kz1y8qxCi18ubEtPfnsP-LRWSGgYIyuCbQ5mA-DAedK8hroDyxv31-eJ9VpsjJ-ei8lI1bgYX9FKyDdymG0IzJzMIvgQGTbOInSSdyDFJ4SAPzuLCsmblyP82b0pPiYlzFhO0yspIbDfkXE4QRV-P_6_TyHiDGZYgw_qQRNlDwKfgQuMKfk0KATnqZcWKJSbcm5gXtUEZaL7YvxDCXxax7XsNIxkm5MXaKDIYAaAt"
                alt="Two models walking in high-fashion winter garments"
                fill
                className="object-cover ambient-shadow"
                sizes="(max-width: 768px) 100vw, 60vw"
              />
            </div>
          </div>
          
          {/* Floating Text Card */}
          <div className="col-span-12 md:col-span-5 md:-ml-20 relative z-20">
            <div className="glass p-10 md:p-16 shadow-[0_40px_80px_rgba(27,28,28,0.08)] bg-white/80">
              <span className="font-sans text-xs tracking-[0.3em] uppercase text-[var(--color-secondary)] mb-6 block">
                Winter 2024
              </span>
              <h2 className="font-serif text-4xl md:text-5xl font-light text-[var(--color-on-surface)] mb-8 leading-tight">
                The Sculpted <br />
                Silhouettes
              </h2>
              <p className="font-sans text-[var(--color-secondary)] mb-10 leading-relaxed text-sm max-w-sm">
                An exploration of form and structure. Discover the collection that redefines the boundaries of modern tailoring through the lens of architectural geometry.
              </p>
              <Link
                href="/collections/winter-2024"
                className="group inline-flex items-center gap-4 font-sans text-xs tracking-widest uppercase text-[var(--color-on-surface)] font-bold"
              >
                Explore Collection
                <ArrowRight 
                  strokeWidth={1.5} 
                  size={16} 
                  className="transition-transform duration-300 group-hover:translate-x-2" 
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
