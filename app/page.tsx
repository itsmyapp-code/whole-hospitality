import Hero from "./components/Hero";
import RealityCheck from "./components/RealityCheck";
import Solution from "./components/Solution";
import Features from "./components/Features";
import About from "./components/About";
import LeadMagnet from "./components/LeadMagnet";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen font-[family-name:var(--font-geist-sans)]">
      <Hero />
      <RealityCheck />
      <Solution />
      <Features />
      <About />
      <LeadMagnet />
      <Footer />
    </main>
  );
}
