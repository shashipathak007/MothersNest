import { useState } from "react";
import Card from "../ui/Card.jsx";
import { VISIT_BADGE, fmtDate } from "../../utils/helpers.js";

export default function VisitCard({ visit, isLatest = false, onEdit }) {
  const [expanded, setExpanded] = useState(false);
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
        onClick={() => setExpanded(e => !e)}
        className={`p-4 cursor-pointer hover:border-brand-300 hover:shadow-md transition-all ${isLatest ? "border-brand-200" : ""}`}
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

          {/* Expand/collapse indicator */}
          <span className={`ml-auto text-stone-400 text-xs transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>
            ▾
          </span>

          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-1.5 text-stone-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
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

        {/* ── Expanded Details ────────────────────────────────── */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-stone-100 space-y-4 animate-fadeIn">

            {/* Presenting Complaints */}
            {visit.presentingComplaints && (
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Presenting Complaints</p>
                <p className="text-sm text-stone-700 leading-relaxed">{visit.presentingComplaints}</p>
              </div>
            )}

            {/* Review of Systems */}
            {visit.reviewOfSystems && (
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Review of Systems</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(visit.reviewOfSystems).filter(([_, v]) => v).map(([key]) => (
                    <span key={key} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-100 text-rose-700">
                      ⚠ {key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())}
                    </span>
                  ))}
                  {Object.values(visit.reviewOfSystems).every(v => !v) && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-100 text-emerald-700">✓ All clear</span>
                  )}
                </div>
              </div>
            )}

            {/* Exam Notes */}
            {visit.examNotes && (
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Examination Notes</p>
                <p className="text-sm text-stone-700 leading-relaxed">{visit.examNotes}</p>
              </div>
            )}

            {/* GBV Screening */}
            {(visit.gbvScreening || visit.gbvRisk) && (
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">GBV Screening</p>
                {visit.gbvRisk && (
                  <div className="mb-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2">
                    <span className="text-rose-500 text-lg animate-pulse">⚠</span>
                    <div>
                      <p className="text-xs font-bold text-rose-800 uppercase tracking-tight">High Risk: Gender Based Violence Disclosed</p>
                      <p className="text-[10px] text-rose-600 font-medium leading-tight">Patient requires immediate safety monitoring and sensitive follow-up.</p>
                    </div>
                  </div>
                )}
                {visit.gbvScreening && (
                  <p className="text-sm text-stone-700 leading-relaxed">{visit.gbvScreening}</p>
                )}
              </div>
            )}

            {/* Investigations/Tests */}
            {visit.tests?.length > 0 && visit.tests.some(t => t.value && t.value.trim() !== "") && (
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Investigations / Test Results</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {visit.tests.filter(t => t.value && t.value.trim() !== "").map(t => {
                    const bgCls = t.status === "abnormal" ? "bg-rose-50 border-rose-200" :
                      t.status === "moderate" ? "bg-amber-50 border-amber-200" :
                        t.status === "normal" ? "bg-emerald-50 border-emerald-200" :
                          "bg-stone-50 border-stone-200";
                    const textCls = t.status === "abnormal" ? "text-rose-800" :
                      t.status === "moderate" ? "text-amber-800" :
                        t.status === "normal" ? "text-emerald-800" :
                          "text-stone-600";
                    const valCls = t.status === "abnormal" ? "text-rose-700" :
                      t.status === "moderate" ? "text-amber-700" :
                        t.status === "normal" ? "text-emerald-700" :
                          "text-stone-700";
                    const riskLabel = t.status === "abnormal" ? "⚠ HIGH RISK" :
                      t.status === "moderate" ? "⚡ MODERATE" : t.status === "normal" ? "✓ NORMAL" : "";
                    return (
                      <div key={t.test} className={`flex items-center justify-between px-3 py-2.5 rounded-xl border ${bgCls}`}>
                        <div className="flex flex-col">
                          <span className={`text-xs font-bold ${textCls}`}>{t.test}</span>
                          {riskLabel && (
                            <span className={`text-[9px] font-bold mt-0.5 ${valCls}`}>{riskLabel}</span>
                          )}
                        </div>
                        <span className={`text-sm font-mono font-bold ${valCls}`}>
                          {t.value} {t.unit}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No detailed info message */}
            {!visit.presentingComplaints && !visit.examNotes && !visit.gbvScreening &&
              (!visit.tests || visit.tests.length === 0 || !visit.tests.some(t => t.value && t.value.trim() !== "")) &&
              (!visit.reviewOfSystems || Object.values(visit.reviewOfSystems).every(v => !v)) && (
                <p className="text-xs text-stone-400 italic">No additional details recorded for this visit. Click Edit to add details.</p>
              )}

            {/* Auto-assessed risk banner */}
            {(() => {
              let level = "low";
              const promote = (lvl) => {
                const order = { low: 0, moderate: 1, high: 2 };
                if (order[lvl] > order[level]) level = lvl;
              };
              const details = [];

              if (visit.bpFlag === "severe") { promote("high"); details.push("Severe BP"); }
              else if (visit.bpFlag === "high") { promote("moderate"); details.push("High BP"); }
              if (visit.pulseFlag === "high" || visit.pulseFlag === "low") { promote("moderate"); details.push(`Pulse ${visit.pulseFlag}`); }
              if (visit.fhrFlag === "bradycardia" || visit.fhrFlag === "tachycardia") { promote("moderate"); details.push(`FHR ${visit.fhrFlag}`); }
              if (visit.oedema && visit.oedema !== "None (−)") { promote("moderate"); details.push(`Oedema ${visit.oedema}`); }
              if (visit.bmi) {
                const bv = parseFloat(visit.bmi);
                if (bv < 18.5) { promote("moderate"); details.push("Low BMI"); }
                if (bv > 24.9) { promote("moderate"); details.push("High BMI"); }
              }
              if (visit.gbvRisk) { promote("high"); details.push("GBV Risk"); }
              if (visit.reviewOfSystems) {
                const ros = visit.reviewOfSystems;
                if (ros.pvBleeding) { promote("high"); details.push("PV Bleeding"); }
                if (ros.fetalMovements) { promote("high"); details.push("Reduced Fetal Movements"); }
                if (ros.contractions) { promote("high"); details.push("Contractions"); }
                if (ros.headache && ros.visualDisturbance) { promote("high"); details.push("Pre-eclampsia Signs"); }
                else if (ros.headache) { promote("moderate"); details.push("Headache"); }
                if (ros.pvDischarge) { promote("moderate"); details.push("PV Discharge"); }
                if (ros.pelvicPain) { promote("moderate"); details.push("Pelvic Pain"); }
              }
              visit.tests?.filter(t => t.value && t.value.trim() !== "").forEach(t => {
                if (t.status === "abnormal") { promote("high"); details.push(`${t.test}`); }
                else if (t.status === "moderate") { promote("moderate"); details.push(`${t.test}`); }
              });

              const cfg = {
                high: { bg: "bg-rose-50", border: "border-rose-200", dot: "bg-rose-500", text: "text-rose-700", label: "HIGH RISK" },
                moderate: { bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-400", text: "text-amber-700", label: "MODERATE RISK" },
                low: { bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500", text: "text-emerald-700", label: "LOW RISK" },
              };
              const c = cfg[level];
              const detailLine = details.slice(0, 3).join(" · ") + (details.length > 3 ? ` +${details.length - 3} more` : "");

              return (
                <div className={`${c.bg} border ${c.border} rounded-xl px-4 py-2.5 flex items-center gap-3 mt-2`}>
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${c.dot}`} />
                  <div className="flex-1">
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${c.text}`}>
                      AUTO-ASSESSED: {c.label}
                    </p>
                    {detailLine && <p className={`text-[9px] ${c.text} opacity-75 mt-0.5`}>{detailLine}</p>}
                  </div>
                </div>
              );
            })()}
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
