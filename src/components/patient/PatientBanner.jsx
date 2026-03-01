import { RiskBadge, TagChip } from "../ui/Badge.jsx";
import { OB_RISK_FLAGS } from "../../utils/helpers.js";

export default function PatientBanner({ patient }) {
  const obHighFlags = OB_RISK_FLAGS.filter(
    f => f.risk === "high" && patient.obstetricFlags?.[f.key]
  );

  return (
    <div className="py-4">
      <div className="flex items-start gap-3 flex-wrap">
        <h1
          className="text-2xl font-semibold text-stone-900"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {patient.name}
        </h1>
        <RiskBadge level={patient.riskLevel} />
        {patient.tags?.map(t => <TagChip key={t} label={t} />)}
      </div>

      {/* High-risk from obstetric history shown prominently */}
      {obHighFlags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {obHighFlags.map(f => (
            <span key={f.key}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-700 ring-1 ring-rose-200">
              ⚠ {f.label}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-stone-400">
        <span className="font-mono text-stone-500 font-medium">{patient.id}</span>
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
            <span className="text-rose-600 font-semibold">⚠ Allergy: {patient.allergies}</span>
          </>
        )}
      </div>
    </div>
  );
}
