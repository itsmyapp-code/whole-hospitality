import { Hero, RealityCheck, Solution, Features, About, RoomInventoryPro, Footer } from "./components";

export default function Home() {
  return (
    <main className="min-h-screen font-[family-name:var(--font-geist-sans)]">
      <Hero />
      <RealityCheck />
      <Solution />
      <Features />
      <About />
      <RoomInventoryPro />
      <Footer />
    </main>
  );
}

