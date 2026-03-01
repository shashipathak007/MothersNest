const FILTERS = [
  { value: "all",      label: "All Patients" },
  { value: "high",     label: "High Risk" },
  { value: "moderate", label: "Moderate" },
  { value: "low",      label: "Low Risk" },
];

export default function RiskFilterBar({ active, onChange, count }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex gap-1 p-1 bg-white border border-stone-200 rounded-xl">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => onChange(f.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
              active === f.value
                ? "bg-brand-700 text-white"
                : "text-stone-500 hover:bg-stone-100"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <span className="text-xs text-stone-400">
        {count} patient{count !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
