import Navbar from "@/components/Navbar";
import PhoneShowcase from "@/components/PhoneShowcase";
import FinalCTA from "@/components/FinalCTA";

export default function Home() {
  return (
    <main className="bg-white">
      <Navbar />
      <PhoneShowcase />
      <FinalCTA />
    </main>
  );
}
