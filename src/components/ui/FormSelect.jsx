const fieldCls =
  "w-full px-3.5 py-2.5 text-sm bg-white border border-stone-200 rounded-xl " +
  "focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent " +
  "appearance-none pr-8 transition-shadow";

export default function FormSelect({ label, children, options, error, className = "", ...rest }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        <select className={`${fieldCls} ${error ? "border-rose-400" : ""}`} {...rest}>
          {options ? (
            options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))
          ) : (
            children
          )}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}


