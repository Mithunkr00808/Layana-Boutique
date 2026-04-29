import Link from "next/link";
import { ChevronRight, Mail } from "lucide-react";
import { PRODUCT_CATEGORY_OPTIONS, getCategoryHref } from "@/lib/catalog/categories";

function InstagramIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export interface FooterSocialLinks {
  instagram?: string;
  facebook?: string;
  email?: string;
}

interface FooterProps {
  social?: FooterSocialLinks;
}

export default function Footer({ social }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const hasContact = social?.instagram || social?.facebook || social?.email;

  return (
    <footer className="w-full pt-20 pb-10 bg-[var(--color-surface-low)]">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-12 px-10 max-w-[1440px] mx-auto">
        <div className="flex flex-col gap-6">
          <Link href="/" className="font-serif text-xl italic text-zinc-900">
            Layana Boutique
          </Link>
          <p className="font-sans text-xs text-zinc-500 leading-relaxed uppercase tracking-widest">
            Curating the future of <br />
            conscious luxury.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-sans text-xs font-bold tracking-widest uppercase text-zinc-900">
            Collection
          </h4>
          {PRODUCT_CATEGORY_OPTIONS.map((category) => (
            <Link
              key={category.value}
              href={getCategoryHref(category.value)}
              className="font-sans text-xs tracking-widest uppercase text-zinc-500 hover:text-zinc-900 underline-offset-4 hover:underline transition-all"
            >
              {category.label}
            </Link>
          ))}
          <Link href="/cart" className="font-sans text-xs tracking-widest uppercase text-zinc-500 hover:text-zinc-900 underline-offset-4 hover:underline transition-all">
            Your Bag
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-sans text-xs font-bold tracking-widest uppercase text-zinc-900">
            Policies
          </h4>
          <Link href="/refund-policy" className="font-sans text-xs tracking-widest uppercase text-zinc-500 hover:text-zinc-900 underline-offset-4 hover:underline transition-all">
            Refund Policy
          </Link>
          <Link href="/terms-of-use" className="font-sans text-xs tracking-widest uppercase text-zinc-500 hover:text-zinc-900 underline-offset-4 hover:underline transition-all">
            Terms of Use
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-sans text-xs font-bold tracking-widest uppercase text-zinc-900">
            Contact
          </h4>
          {hasContact ? (
            <>
              {social?.instagram && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-sans text-xs tracking-widest uppercase text-zinc-500 hover:text-zinc-900 transition-all"
                >
                  <InstagramIcon />
                  Instagram
                </a>
              )}
              {social?.facebook && (
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-sans text-xs tracking-widest uppercase text-zinc-500 hover:text-zinc-900 transition-all"
                >
                  <FacebookIcon />
                  Facebook
                </a>
              )}
              {social?.email && (
                <a
                  href={`mailto:${social.email}`}
                  className="flex items-center gap-2 font-sans text-xs tracking-widest uppercase text-zinc-500 hover:text-zinc-900 transition-all"
                >
                  <Mail size={15} strokeWidth={2} />
                  Email Us
                </a>
              )}
            </>
          ) : (
            <>
              <span className="font-sans text-xs tracking-widest uppercase text-zinc-500 opacity-50 cursor-default">
                Instagram — Coming Soon
              </span>
              <span className="font-sans text-xs tracking-widest uppercase text-zinc-500 opacity-50 cursor-default">
                Facebook — Coming Soon
              </span>
              <span className="font-sans text-xs tracking-widest uppercase text-zinc-500 opacity-50 cursor-default">
                Email — Coming Soon
              </span>
            </>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <h4 className="font-sans text-xs font-bold tracking-widest uppercase text-zinc-900">
            Newsletter
          </h4>
          <div className="relative">
            <input
              type="email"
              placeholder="Email Address"
              className="w-full bg-transparent border-b border-[var(--color-outline-variant)] py-2 text-xs uppercase tracking-widest focus:ring-0 focus:border-zinc-900 transition-colors outline-none"
            />
            <button className="absolute right-0 bottom-2 text-sm text-[var(--color-on-surface)]" aria-label="Subscribe">
              <ChevronRight strokeWidth={1.5} size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-10 mt-20">
        <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-zinc-500 text-center">
          © {currentYear} LAYANA BOUTIQUE. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
}
