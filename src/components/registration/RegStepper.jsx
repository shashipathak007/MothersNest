const STEPS = [
  { id: 1, label: "Personal Info", sub: "Patient details & basic medical" },
  { id: 2, label: "Pregnancy", sub: "GP, LMP, EDD, gestational age" },
];

export default function RegStepper({ current, completed }) {
  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="lg:sticky lg:top-24 space-y-2">
        {STEPS.map(s => {
          const done = completed.includes(s.id);
          const active = current === s.id;
          return (
            <div
              key={s.id}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-colors ${active ? "bg-brand-700 border-brand-700 text-white" :
                  done ? "bg-emerald-50 border-emerald-300 text-emerald-800" :
                    "bg-white border-stone-200 text-stone-500"
                }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${active ? "bg-white/20" :
                  done ? "bg-emerald-500 text-white" :
                    "bg-stone-100"
                }`}>
                {done ? "✓" : s.id}
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-semibold ${active ? "text-white" : ""}`}>{s.label}</p>
                <p className={`text-[11px] mt-0.5 ${active ? "text-blue-200" : "text-stone-400"}`}>{s.sub}</p>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}






