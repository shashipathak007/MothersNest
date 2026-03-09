export default function PatientTabBar({ tabs, active, onChange }) {
  return (
    <div className="flex border-t border-stone-100 -mx-4 sm:-mx-6 px-4 sm:px-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-3 text-xs font-semibold border-b-[3px] transition-all whitespace-nowrap relative ${active === tab.id
              ? "border-brand-600 text-brand-700"
              : "border-transparent text-stone-400 hover:text-stone-700"
            }`}
        >
          {tab.label}
          {tab.dot && (
            <span className="ml-1.5 w-1.5 h-1.5 inline-block rounded-full bg-rose-500 align-middle" />
          )}
        </button>
      ))}
    </div>
  );
}
