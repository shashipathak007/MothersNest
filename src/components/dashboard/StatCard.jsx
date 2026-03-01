import Card from "../ui/Card.jsx";

export default function StatCard({ label, value, valueColor }) {
  return (
    <Card className="px-5 py-4 flex flex-col gap-1">
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
