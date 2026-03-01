import Card from "../ui/Card.jsx";
import { VISIT_BADGE, fmtDate } from "../../utils/helpers.js";

export default function VisitCard({ visit, isLatest = false }) {
  const typeCls = VISIT_BADGE[visit.type] ?? "bg-stone-100 text-stone-600";

  const bpCls =
    visit.bpFlag === "severe" ? "bg-rose-100 text-rose-800 font-bold" :
    visit.bpFlag === "high"   ? "bg-orange-100 text-orange-700 font-semibold" :
    visit.bpFlag === "low"    ? "bg-amber-100 text-amber-700 font-semibold" :
                                "bg-stone-100 text-stone-600";

  const fhrCls = visit.fhrFlag ? "bg-orange-100 text-orange-700 font-semibold" : "bg-stone-100 text-stone-600";

  return (
    <div className="relative pl-10">
      <span className={`absolute left-3.5 top-5 w-3 h-3 rounded-full border-2 border-[#f8fafc] shadow-sm ${
        isLatest ? "bg-brand-700 ring-4 ring-brand-100" : "bg-stone-300"
      }`} />

      <Card className={`p-4 ${isLatest ? "border-brand-200" : ""}`}>
        {/* Header */}
        <div className="flex items-center flex-wrap gap-2 mb-3">
          <span className="text-xs text-stone-400 font-mono">{fmtDate(visit.date)}</span>
          {visit.ga && (
            <span className="text-[10px] font-semibold bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
              GA {visit.ga}
            </span>
          )}
          <span className={`ml-auto text-[10px] font-semibold px-2.5 py-1 rounded-full ${typeCls}`}>
            {visit.type}
          </span>
        </div>

        {/* Vitals chips */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {visit.bp && (
            <span className={`text-xs px-2.5 py-1 rounded-lg ${bpCls}`}>
              BP {visit.bp} {visit.bpFlag ? `⚠` : ""}
            </span>
          )}
          {visit.weight && (
            <span className="text-xs px-2.5 py-1 rounded-lg bg-stone-100 text-stone-600">
              {visit.weight} kg
            </span>
          )}
          {visit.fetalHR && (
            <span className={`text-xs px-2.5 py-1 rounded-lg ${fhrCls}`}>
              FHR {visit.fetalHR} bpm {visit.fhrFlag ? "⚠" : ""}
            </span>
          )}
          {visit.fundal && (
            <span className="text-xs px-2.5 py-1 rounded-lg bg-stone-100 text-stone-600">
              FH {visit.fundal} cm
            </span>
          )}
          {visit.oedema && visit.oedema !== "None (−)" && (
            <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700">
              Oedema {visit.oedema}
            </span>
          )}
          {visit.presentation && (
            <span className="text-xs px-2.5 py-1 rounded-lg bg-stone-100 text-stone-500">
              {visit.presentation}
            </span>
          )}
        </div>

        {/* Findings */}
        <p className="text-sm text-stone-800 font-medium leading-relaxed mb-1.5">{visit.findings}</p>

        {/* Plan */}
        {visit.plan && (
          <p className="text-xs text-stone-500 flex items-start gap-1.5 mb-2">
            <span className="text-brand-600 font-bold shrink-0 mt-px">→</span>
            {visit.plan}
          </p>
        )}

        {/* Supplements + TT + Counselling chips */}
        {(visit.supplements?.length > 0 || visit.ttDose || visit.counselling?.length > 0) && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-stone-100 mt-2">
            {visit.ttDose && visit.ttDose !== "Not given" && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">{visit.ttDose}</span>
            )}
            {visit.supplements?.map(s => (
              <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">{s}</span>
            ))}
            {visit.counselling?.map(c => (
              <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-semibold">✓ {c}</span>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
