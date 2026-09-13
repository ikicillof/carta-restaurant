import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { MenuSection } from "@/components/menu/MenuSection";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { Visitanos } from "@/components/visitanos/Visitanos";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col">
        <Hero />
        <About />
        <MenuSection />
        <ReviewsSection />
        <Visitanos />
      </main>
      <Footer />
    </>
  );
}
