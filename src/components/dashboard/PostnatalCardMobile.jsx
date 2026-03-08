import { useNavigate } from "react-router-dom";
import Card from "../ui/Card.jsx";
import { fmtDate } from "../../utils/helpers.js";

const RISK_BORDER = { high: "#f43f5e", moderate: "#f59e0b", low: "#10b981" };

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
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${patient.riskStatus === "high" ? "bg-red-50 text-rose-700" : patient.riskStatus === "moderate" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                    {patient.riskStatus}
                </span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${patient.deliveryMode?.includes("LSCS") ? "bg-violet-100 text-violet-700" : patient.deliveryMode?.includes("Assisted") ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {patient.deliveryMode}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${patient.babyStatus?.includes("Stillbirth") ? "bg-rose-100 text-rose-700" : patient.babyStatus?.includes("NICU") ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-600"}`}>
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
