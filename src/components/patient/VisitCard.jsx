import Card from "../ui/Card.jsx";
import { VISIT_BADGE, fmtDate } from "../../utils/helpers.js";

export default function VisitCard({ visit, isLatest = false, onEdit }) {
  const typeCls = VISIT_BADGE[visit.type] ?? "bg-stone-100 text-stone-600";

  const bpCls =
    visit.bpFlag === "severe" ? "bg-rose-100 text-rose-800 font-bold" :
      visit.bpFlag === "high" ? "bg-orange-100 text-orange-700 font-semibold" :
        visit.bpFlag === "low" ? "bg-amber-100 text-amber-700 font-semibold" :
          visit.bpFlag === "normal" ? "bg-emerald-100 text-emerald-800 font-bold" :
            "bg-stone-100 text-stone-600";

  const fhrCls =
    visit.fhrFlag === "bradycardia" || visit.fhrFlag === "tachycardia" ? "bg-orange-100 text-orange-700 font-semibold" :
      visit.fhrFlag === "normal" ? "bg-emerald-100 text-emerald-800 font-bold" :
        "bg-stone-100 text-stone-600";

  const pulseCls =
    visit.pulseFlag === "high" || visit.pulseFlag === "low" ? "bg-orange-100 text-orange-700 font-semibold" :
      visit.pulseFlag === "normal" ? "bg-emerald-100 text-emerald-800 font-bold" :
        "bg-stone-100 text-stone-600";

  return (
    <div className="relative pl-10 group">
      <span className={`absolute left-3.5 top-5 w-3 h-3 rounded-full border-2 border-[#f8fafc] shadow-sm transition-transform group-hover:scale-110 ${isLatest ? "bg-brand-700 ring-4 ring-brand-100" : "bg-stone-300"
        }`} />

      <Card
        onClick={onEdit ? onEdit : undefined}
        className={`p-4 ${onEdit ? "cursor-pointer hover:border-brand-300 hover:shadow-md" : ""} transition-all ${isLatest ? "border-brand-200" : ""}`}
      >
        {/* Header */}
        <div className="flex items-center flex-wrap gap-2 mb-3">
          <span className="text-xs text-stone-400 font-mono">{fmtDate(visit.date)}</span>
          {visit.ga && (
            <span className="text-[10px] font-semibold bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
              GA {visit.ga}
            </span>
          )}
          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${typeCls}`}>
            {visit.type}
          </span>

          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="ml-auto p-1.5 text-stone-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
              title="Edit Visit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
        </div>

        {/* Vitals chips */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {visit.bp && (
            <span className={`text-xs px-2.5 py-1 rounded-lg ${bpCls}`}>
              BP {visit.bp} {visit.bpFlag && visit.bpFlag !== "normal" ? `⚠` : visit.bpFlag === "normal" ? "✓" : ""}
            </span>
          )}
          {visit.pulse && (
            <span className={`text-xs px-2.5 py-1 rounded-lg ${pulseCls}`}>
              Pulse {visit.pulse} bpm {visit.pulseFlag && visit.pulseFlag !== "normal" ? `⚠` : visit.pulseFlag === "normal" ? "✓" : ""}
            </span>
          )}
          {visit.weight && (
            <span className="text-xs px-2.5 py-1 rounded-lg bg-stone-100 text-stone-600">
              {visit.weight} kg
            </span>
          )}
          {visit.bmi && (
            <span className={`text-xs px-2.5 py-1 rounded-lg ${parseFloat(visit.bmi) < 18.5 || parseFloat(visit.bmi) > 24.9 ? "bg-rose-100 text-rose-800 font-bold" :
              "bg-emerald-100 text-emerald-800 font-bold"
              }`}>
              BMI {visit.bmi}{parseFloat(visit.bmi) < 18.5 ? " — Low" : parseFloat(visit.bmi) > 24.9 ? " — High" : ""}
            </span>
          )}
          {visit.fetalHR && (
            <span className={`text-xs px-2.5 py-1 rounded-lg ${fhrCls}`}>
              FHR {visit.fetalHR} bpm {visit.fhrFlag && visit.fhrFlag !== "normal" ? "⚠" : visit.fhrFlag === "normal" ? "✓" : ""}
            </span>
          )}
          {visit.fundal && (
            <span className="text-xs px-2.5 py-1 rounded-lg bg-stone-100 text-stone-600">
              FH {visit.fundal} cm
            </span>
          )}
          {visit.oedema && (
            <span className={`text-xs px-2.5 py-1 rounded-lg ${visit.oedema === "None (−)" ? "bg-emerald-100 text-emerald-800 font-bold" :
              "bg-orange-100 text-orange-700 font-semibold"
              }`}>
              Oedema {visit.oedema} {visit.oedema === "None (−)" ? "✓" : "⚠"}
            </span>
          )}
          {visit.presentation && (
            <span className={`text-xs px-2.5 py-1 rounded-lg ${visit.presentation === "Cephalic" ? "bg-emerald-100 text-emerald-800 font-bold" :
              visit.presentation === "Not assessed" ? "bg-stone-100 text-stone-500" :
                "bg-orange-100 text-orange-700 font-semibold"
              }`}>
              {visit.presentation} {visit.presentation === "Cephalic" ? "✓" : visit.presentation !== "Not assessed" ? "⚠" : ""}
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

        {/* Investigations/Tests */}
        {visit.tests?.length > 0 && visit.tests.some(t => t.value.trim() !== "") && (
          <div className="mt-3 pt-3 border-t border-stone-100">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Investigations</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {visit.tests.filter(t => t.value.trim() !== "").map(t => (
                <div key={t.test} className={`flex items-center justify-between px-3 py-1.5 rounded-lg border ${t.status === "abnormal" ? "bg-rose-50 border-rose-200" :
                  t.status === "normal" ? "bg-emerald-50 border-emerald-200" :
                    "bg-stone-50 border-stone-200"
                  }`}>
                  <span className={`text-xs font-semibold ${t.status === "abnormal" ? "text-rose-800" :
                    t.status === "normal" ? "text-emerald-800" :
                      "text-stone-600"
                    }`}>{t.test}</span>
                  <span className={`text-xs font-mono font-bold ${t.status === "abnormal" ? "text-rose-700" :
                    t.status === "normal" ? "text-emerald-700" :
                      "text-stone-700"
                    }`}>
                    {t.value} {t.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
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


