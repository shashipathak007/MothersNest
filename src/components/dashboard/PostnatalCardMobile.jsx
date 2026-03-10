import { useNavigate } from "react-router-dom";
import Card from "../ui/Card.jsx";
import { fmtDate } from "../../utils/helpers.js";

const RISK_BORDER = { high: "#f43f5e", moderate: "#facc15", low: "#10b981" };

export default function PostnatalCardMobile({ patient }) {
    const navigate = useNavigate();
    return (
        <Card
            className="p-4 cursor-pointer active:scale-[0.99] transition-transform border-l-4"
            style={{ borderLeftColor: RISK_BORDER[patient.riskStatus] ?? "#94a3b8", touchAction: "manipulation" }}
            onClick={() => navigate(`/patient/${patient.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") navigate(`/patient/${patient.id}`); }}
        >
            <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                    <p className="font-semibold text-stone-900">{patient.name}</p>
                    <p className="text-[11px] text-stone-400 mt-0.5">{patient.id} · {patient.phone}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${patient.riskStatus === "high" ? "bg-rose-50 text-rose-700" : patient.riskStatus === "moderate" ? "bg-yellow-50 text-yellow-800" : "bg-emerald-50 text-emerald-700"}`}>
                    {patient.riskStatus}
                </span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${patient.deliveryMode?.includes("Assisted Breech") ? "bg-rose-100 text-rose-700" : patient.deliveryMode?.includes("LSCS") || patient.deliveryMode?.includes("Vacuum") || patient.deliveryMode?.includes("Forceps") ? "bg-yellow-100 text-yellow-800" : "bg-emerald-100 text-emerald-700"}`}>
                    {patient.deliveryMode}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${patient.babyStatus?.includes("Stillbirth") || patient.babyStatus?.includes("Neonatal Death") ? "bg-rose-100 text-rose-700" : patient.babyStatus?.includes("NICU") || patient.babyStatus?.includes("Referred") || patient.babyStatus?.includes("Anomaly") ? "bg-yellow-100 text-yellow-800" : "bg-stone-100 text-stone-700"}`}>
                    {patient.babyStatus}
                </span>
            </div>

            <div className="flex items-center justify-between text-xs text-stone-400">
                <span>Delivered <strong className="text-stone-700">{fmtDate(patient.deliveryDate)}</strong></span>
                <span>Follow-up <strong className="text-stone-700">{fmtDate(patient.followUpDate)}</strong></span>
            </div>
        </Card>
    );
}
