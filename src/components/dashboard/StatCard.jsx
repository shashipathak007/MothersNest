import Card from "../ui/Card.jsx";

export default function StatCard({ label, value, valueColor, onClick, active }) {
  return (
    <Card
      className={`px-5 py-4 flex flex-col gap-1 transition-all ${onClick ? "cursor-pointer hover:ring-2 hover:ring-brand-300 active:scale-[0.98]" : ""} ${active ? "ring-2 ring-brand-500 bg-brand-50/30" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
        {label}
      </span>
      <span
        className={`text-3xl font-bold ${valueColor}`}
        style={{ fontFamily: "var(--font-display)" }}
      >
        {value}
      </span>
    </Card>
  );
}
