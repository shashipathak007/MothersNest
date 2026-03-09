export default function SearchBar({ value, onChange, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <svg
        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by Name or ID"
        className="w-full pl-10 pr-4 py-2 text-sm bg-stone-100 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-brand-600 placeholder:text-stone-400"
      />
    </div>
  );
}
