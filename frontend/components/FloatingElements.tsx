export default function FloatingElements() {
  return (
    <div className="fixed top-1/4 right-10 flex flex-col gap-4 z-30 pointer-events-none opacity-20 lg:opacity-100">
      <div className="w-1 h-20 bg-gradient-to-b from-neon-cyan to-transparent rounded-full" />
      <div className="w-1 h-1 bg-neon-cyan rounded-full animate-ping" />
    </div>
  );
}
