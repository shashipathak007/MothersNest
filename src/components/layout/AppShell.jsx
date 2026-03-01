export default function AppShell({ header, children }) {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="bg-white border-b border-stone-200/80 sticky top-0 z-20">
        {header}
      </header>
      <main className="animate-slide-up">
        {children}
      </main>
    </div>
  );
}
