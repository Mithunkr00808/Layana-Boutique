import { Metadata } from "next";
import { getSiteSettings } from "@/lib/siteSettings";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const metadata: Metadata = {
  title: "Terms of Use | Layana Boutique",
  description: "Read the Terms of Use and User Agreement for Layana Boutique (Panchali Vastra).",
};

export default async function TermsOfUsePage() {
  const settings = await getSiteSettings();
  const termsOfUseText = settings.policies.termsOfUse;

  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-serif mb-8 text-center">Terms of Use</h1>
      
      <div className="prose prose-zinc max-w-none font-sans text-sm md:text-base leading-relaxed text-zinc-700">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({node, ...props}) => <h1 className="text-3xl font-serif mt-8 mb-4" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-zinc-900 mt-8 mb-4" {...props} />,
            h3: ({node, ...props}) => <h3 className="font-semibold text-zinc-900 mt-6 mb-2" {...props} />,
            p: ({node, ...props}) => <p className="mb-4" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-6 space-y-2" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-6 space-y-3" {...props} />,
            li: ({node, ...props}) => <li {...props} />,
            strong: ({node, ...props}) => <strong className="font-semibold text-zinc-900" {...props} />,
            a: ({node, ...props}) => <a className="hover:text-zinc-900 underline underline-offset-4" {...props} />
          }}
        >
          {termsOfUseText}
        </ReactMarkdown>
      </div>
    </div>
  );
}
