import { useNavigate } from "react-router-dom";
import Card from "../ui/Card.jsx";
import { RiskBadge, TagChip } from "../ui/Badge.jsx";
import { fmtDate } from "../../utils/helpers.js";

const RISK_BORDER = {
  high:     "#f43f5e",
  moderate: "#f59e0b",
  low:      "#10b981",
};

export default function PatientCardMobile({ patient }) {
  const navigate = useNavigate();

  return (
    <Card
      className="p-4 cursor-pointer active:scale-[0.99] transition-transform border-l-4"
      style={{ borderLeftColor: RISK_BORDER[patient.riskLevel] ?? "#94a3b8" }}
      onClick={() => navigate(`/patient/${patient.id}`)}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="font-semibold text-stone-900">{patient.name}</p>
          <p className="text-[11px] text-stone-400 mt-0.5">{patient.id} · {patient.phone}</p>
        </div>
        <RiskBadge level={patient.riskLevel} />
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {patient.tags.slice(0, 3).map((t) => <TagChip key={t} label={t} />)}
        {patient.tags.length > 3 && (
          <span className="text-[11px] text-stone-400 self-center">+{patient.tags.length - 3}</span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-stone-400">
        <span>GA <strong className="text-stone-700">{patient.ga || "—"}</strong></span>
        <span>EDD <strong className="text-stone-700">{patient.edd || "—"}</strong></span>
        <span>{fmtDate(patient.registeredOn)}</span>
      </div>
    </Card>
  );
}
