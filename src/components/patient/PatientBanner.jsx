import { RiskBadge, TagChip } from "../ui/Badge.jsx";
import { getPatientConditions } from "../../utils/helpers.js";

export default function PatientBanner({ patient }) {
  // Build concise risk reasons from central helper
  const conditions = getPatientConditions(patient);
  const riskReasons = conditions
    .filter(c => c.risk === "high" || c.risk === "moderate")
    .map(c => c.label);

  const obHighFlags = conditions.filter(c => c.risk === "high" && c.label.startsWith("Prev "));

  return (
    <div className="py-4">
      <div className="flex items-start gap-4 flex-wrap">
        <h1
          className="text-2xl font-semibold text-stone-900"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {patient.name}
        </h1>
        <div className="flex flex-wrap gap-2">
          <RiskBadge level={patient.riskLevel} />
          {patient.tags?.map(t => <TagChip key={t} label={t} />)}
        </div>
      </div>

      {/* Risk reasons summary */}
      {riskReasons.length > 0 && patient.riskLevel !== "low" && (
        <p className="mt-1.5 text-[11px] text-stone-500 flex items-center gap-1.5">
          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider ${patient.riskLevel === "high" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
            }`}>
            {patient.riskLevel === "high" ? "High Risk" : "Moderate Risk"}
          </span>
          <span className="text-stone-400">·</span>
          {riskReasons.slice(0, 5).join(" · ")}{riskReasons.length > 5 ? ` +${riskReasons.length - 5} more` : ""}
        </p>
      )}

      {/* Prominent high-risk markers */}
      {obHighFlags.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {obHighFlags.map(f => (
            <span key={f.label}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white text-rose-700 ring-1 ring-rose-200 shadow-sm shadow-rose-100">
              <span className="text-rose-400">⚠</span> {f.label}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-3 text-xs text-stone-400">
        <span className="px-2 py-0.5 bg-stone-100 rounded text-stone-500 font-mono font-bold">{patient.id}</span>
        <span>·</span>
        <span>{patient.age} yrs</span>
        <span>·</span>
        <span>G{patient.gravida} P{patient.para}</span>
        <span>·</span>
        <span className="font-semibold text-stone-600">GA {patient.ga || "—"}</span>
        <span>·</span>
        <span>EDD <strong className="text-stone-700">{patient.edd || "—"}</strong></span>
        <span>·</span>
        <span className={`font-semibold ${patient.bloodGroup?.includes("−") ? "text-violet-600" : "text-stone-600"}`}>
          {patient.bloodGroup || "—"}
        </span>
        {patient.allergies && (
          <>
            <span>·</span>
            <span className="inline-flex items-center gap-1 text-rose-600 font-bold px-2 py-0.5 bg-rose-50 rounded-md">
              ⚠ Allergy: {patient.allergies}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
