import Image from "next/image";
import Link from "next/link";

export interface JournalArticle {
  id: string;
  label: string;
  title: string;
  excerpt: string;
  image: string;
  alt: string;
}

export default function JournalPreview({ articles }: { articles: JournalArticle[] }) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-[var(--color-surface)] max-w-[1440px] mx-auto px-10">
      <div className="text-center mb-20">
        <h2 className="font-serif text-3xl font-light italic mb-4 text-[var(--color-on-surface)]">
          The Journal
        </h2>
        <div className="w-12 h-px bg-[var(--color-on-surface)] mx-auto"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
        {articles.map((article) => (
          <article key={article.id} className="flex flex-col gap-8 group cursor-pointer">
            <div className="overflow-hidden aspect-video bg-[var(--color-surface-elevated)] relative">
              <Image
                src={article.image}
                alt={article.alt}
                fill
                className="object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            
            <div className="max-w-md">
              <span className="font-sans text-[10px] text-[var(--color-secondary)] uppercase tracking-tighter mb-4 block font-bold tracking-widest">
                {article.label}
              </span>
              <h3 className="font-serif text-2xl font-light text-[var(--color-on-surface)] mb-4 group-hover:text-[var(--color-primary)] transition-colors">
                {article.title}
              </h3>
              <p className="font-sans text-sm text-[var(--color-secondary)] leading-relaxed mb-6">
                {article.excerpt}
              </p>
              <Link
                href={`/journal/${article.id}`}
                className="font-sans text-[10px] tracking-[0.2em] uppercase border-b border-[var(--color-on-surface)]/20 pb-1 text-[var(--color-on-surface)]"
              >
                Read Article
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
