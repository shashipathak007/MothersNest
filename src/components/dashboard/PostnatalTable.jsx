import Card from "../ui/Card.jsx";
import { useNavigate } from "react-router-dom";
import { fmtDate } from "../../utils/helpers.js";

const RISK_DOT = { high: "bg-red-500", moderate: "bg-amber-500", low: "bg-emerald-500" };
const RISK_PILL = {
    high: "bg-red-50 text-rose-700 ring-1 ring-rose-200",
    moderate: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    low: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
};

const HEADERS = ["Patient", "Delivery Date", "G·P", "Weight", "APGAR (1/5/D)", "Delivery Mode", "Baby Status", "Follow-up", ""];

function PostnatalRow({ patient }) {
    const navigate = useNavigate();

    // Weight risk
    const w = parseFloat(patient.birthWeight);
    const wColor = w < 1.5 ? "text-rose-600" : w < 2.5 || w > 4.0 ? "text-amber-600" : "text-stone-700";

    // APGAR risk checks for coloring
    const isAPGARHigh = (s) => s && parseInt(s) <= 3;
    const isAPGARMod = (s) => s && parseInt(s) <= 6;
    const getAPGARColor = (s) => isAPGARHigh(s) ? "text-rose-600" : isAPGARMod(s) ? "text-amber-600" : "text-stone-700";

    return (
        <tr
            onClick={() => navigate(`/patient/${patient.id}`)}
            className="group cursor-pointer hover:bg-brand-50/40 transition-colors"
        >
            <td className="px-6 py-4">
                <p className="font-semibold text-stone-900 group-hover:text-brand-700 transition-colors">{patient.name}</p>
                <p className="text-[11px] text-stone-400 mt-0.5 font-mono">{patient.id} · {patient.phone}</p>
            </td>
            <td className="px-6 py-4 text-sm font-semibold text-stone-700">{fmtDate(patient.deliveryDate)}</td>
            <td className="px-6 py-4 text-sm text-stone-600 font-medium">G{patient.gravida}·P{patient.para}</td>
            <td className="px-6 py-4 text-sm font-bold">
                <span className={wColor}>{patient.birthWeight ? `${patient.birthWeight} kg` : "—"}</span>
            </td>
            <td className="px-6 py-4 text-xs font-bold font-mono">
                <span className={getAPGARColor(patient.apgar1)}>{patient.apgar1 || "—"}</span>/
                <span className={getAPGARColor(patient.apgar5)}>{patient.apgar5 || "—"}</span>/
                <span className={getAPGARColor(patient.apgarDischarge)}>{patient.apgarDischarge || "—"}</span>
            </td>
            <td className="px-6 py-4">
                <span className={`text-xs font-semibold px-2 py-1 rounded-lg 
                    ${patient.deliveryMode?.includes("Assisted Breech") 
                     ? "bg-rose-50 text-rose-700"
                     : patient.deliveryMode?.includes("LSCS")
                     || patient.deliveryMode?.includes("Vacuum") 
                     || patient.deliveryMode?.includes("Forceps") 
                     ? "bg-yellow-50 text-yellow-800"
                     :"bg-emerald-50 text-emerald-700"}`}>
                     {patient.deliveryMode || "—"}
                </span>
            </td>
            <td className="px-6 py-4">
                <span className={`text-xs font-semibold
                     ${patient.babyStatus?.includes("Stillbirth") 
                     || patient.babyStatus?.includes("Neonatal Death")
                    ? "text-rose-600" : patient.babyStatus?.includes("NICU")
                    || patient.babyStatus?.includes("Referred")
                    || patient.babyStatus?.includes("Anomaly")
                     ? "text-yellow-600" : "text-stone-700"}`}>
                    {patient.babyStatus || "—"}
                </span>
            </td>
            <td className="px-6 py-4 text-xs text-stone-400">{fmtDate(patient.followUpDate)}</td>
            <td className="px-6 py-4 text-right">
                <span className="text-[11px] text-brand-700 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Open →
                </span>
            </td>
        </tr>
    );
}

export default function PostnatalTable({ patients }) {
    if (patients.length === 0) return null;
    return (
        <Card className="hidden lg:block overflow-hidden">
            <table className="w-full">
                <thead className="border-b border-stone-100">
                    <tr className="bg-stone-50/70">
                        {HEADERS.map((h) => (
                            <th key={h} className="text-left px-6 py-3.5 text-[10px] font-bold text-stone-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                    {patients.map((p) => <PostnatalRow key={p.id} patient={p} />)}
                </tbody>
            </table>
        </Card>
    );
}


