import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import NewArrivals from "@/components/NewArrivals";

import JournalPreview from "@/components/JournalPreview";
import Footer from "@/components/FooterWithData";
import FadeIn from "@/components/FadeIn";
import { getNewArrivals, getJournalArticles } from "@/lib/data";

export default async function Home() {
  const newArrivals = await getNewArrivals();
  const articles = await getJournalArticles();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow overflow-x-hidden">
        <FadeIn delay={0.1}>
          <Hero />
        </FadeIn>
        {newArrivals.length > 0 ? (
          <FadeIn delay={0.2}>
            <NewArrivals products={newArrivals} />
          </FadeIn>
        ) : null}

        {articles.length > 0 ? (
          <FadeIn>
            <JournalPreview articles={articles} />
          </FadeIn>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
