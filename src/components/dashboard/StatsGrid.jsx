import StatCard from "./StatCard.jsx";

export default function StatsGrid({ patients }) {
  const total    = patients.length;
  const high     = patients.filter((p) => p.riskLevel === "high").length;
  const moderate = patients.filter((p) => p.riskLevel === "moderate").length;
  const low      = patients.filter((p) => p.riskLevel === "low").length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCard label="Total Patients" value={total}    valueColor="text-stone-800" />
      <StatCard label="High Risk"      value={high}     valueColor="text-rose-600" />
      <StatCard label="Moderate"       value={moderate} valueColor="text-amber-600" />
      <StatCard label="Low Risk"       value={low}      valueColor="text-emerald-600" />
    </div>
  );
}
