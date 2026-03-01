import { useNavigate } from "react-router-dom";
import { RiskBadge, TagChip } from "../ui/Badge.jsx";
import { fmtDate } from "../../utils/helpers.js";

export default function PatientTableRow({ patient }) {
  const navigate = useNavigate();

  return (
    <tr
      onClick={() => navigate(`/patient/${patient.id}`)}
      className="group cursor-pointer hover:bg-brand-50/40 transition-colors"
    >
      <td className="px-6 py-4">
        <p className="font-semibold text-stone-900 group-hover:text-brand-700 transition-colors">
          {patient.name}
        </p>
        <p className="text-[11px] text-stone-400 mt-0.5 font-mono">
          {patient.id} · {patient.phone}
        </p>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm font-semibold text-stone-700">{patient.ga || "—"}</p>
        <p className="text-[11px] text-stone-400 font-mono mt-0.5">{patient.edd || "—"}</p>
      </td>
      <td className="px-6 py-4 text-sm text-stone-600 font-medium">
        G{patient.gravida}·P{patient.para}
      </td>
      <td className="px-6 py-4">
        <span className={`text-sm font-semibold ${patient.bloodGroup?.includes("−") ? "text-violet-700" : "text-stone-700"}`}>
          {patient.bloodGroup || "—"}
        </span>
      </td>
      <td className="px-6 py-4">
        <RiskBadge level={patient.riskLevel} />
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1">
          {patient.tags.length === 0 ? (
            <span className="text-xs text-stone-300">—</span>
          ) : (
            <>
              {patient.tags.slice(0, 2).map((t) => <TagChip key={t} label={t} />)}
              {patient.tags.length > 2 && (
                <span className="text-[11px] text-stone-400 font-medium self-center">
                  +{patient.tags.length - 2}
                </span>
              )}
            </>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-xs text-stone-400">{fmtDate(patient.registeredOn)}</td>
      <td className="px-6 py-4 text-right">
        <span className="text-[11px] text-brand-700 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
          Open →
        </span>
      </td>
    </tr>
  );
}
