export default function KVRow({ label, value, mono = false, accent = false }) {
  return (
    <div className="flex gap-4 py-2.5 border-b border-stone-50 last:border-0">
      <span className="text-xs text-stone-400 w-32 shrink-0 pt-px">{label}</span>
      <span
        className={`text-sm flex-1 ${mono ? "font-mono" : ""} ${
          accent ? "text-rose-700 font-semibold" : "text-stone-800 font-medium"
        }`}
      >
        {value || "—"}
      </span>
    </div>
  );
}
