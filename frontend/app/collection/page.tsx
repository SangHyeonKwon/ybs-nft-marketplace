import CollectionSection from "@/components/CollectionSection";

export default function CollectionPage() {
  return (
    <main className="min-h-screen pt-20 pb-24 lg:pb-0 relative overflow-hidden bg-background">
      {/* Background neon blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-neon-purple/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-neon-cyan/10 blur-[100px] rounded-full" />

      <CollectionSection />
    </main>
  );
}
