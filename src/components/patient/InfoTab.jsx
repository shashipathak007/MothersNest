import PersonalCard from "./PersonalCard.jsx";
import PregnancyCard from "./PregnancyCard.jsx";
import AllergyCard from "./AllergyCard.jsx";
import AlertsCard from "./AlertsCard.jsx";
import VisitCard from "./VisitCard.jsx";
import Card from "../ui/Card.jsx";
import SectionLabel from "../ui/SectionLabel.jsx";
import { BASIC_MEDICAL_FLAGS, RISK_CONFIG, computeOverallRisk } from "../../utils/helpers.js";

/* ─── Small helper components ──────────────────────────────────────── */
function RiskSourceBadge({ label, source }) {
  return (
    <div className="flex items-start gap-2 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
      <span className="text-rose-500 mt-0.5 shrink-0">⚠</span>
      <div>
        <p className="text-xs font-semibold text-rose-800">{label}</p>
        {source && <p className="text-[11px] text-rose-500 mt-0.5">{source}</p>}
      </div>
    </div>
  );
}

function RiskFlagPill({ label, level }) {
  const cls = level === "high"
    ? "bg-rose-100 text-rose-700 ring-1 ring-rose-200"
    : level === "moderate"
      ? "bg-amber-100 text-amber-700 ring-1 ring-amber-200"
      : "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200";
  const icon = level === "high" ? "🔴" : level === "moderate" ? "🟠" : "🟢";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${cls}`}>
      {icon} {label}
    </span>
  );
}

/* ─── Extract active risk factors from first visit ─────────────────── */
function getRiskFactors(patient) {
  const factors = { high: [], moderate: [], low: [] };
  const fv = patient.firstVisit;
  if (!fv?.completed) return factors;

  const ros = fv.reviewOfSystems || {};
  const med = fv.medicalHistory || {};
  const ob = fv.obstetricHistory || {};

  // DANGER SYMPTOMS from ROS
  if (ros.pvBleeding) factors.high.push("PV Bleeding");
  if (ros.fetalMovements) factors.high.push("Reduced / Absent Fetal Movements");
  if (ros.contractions) factors.high.push("Contractions (preterm)");
  if (ros.headache && ros.visualDisturbance) factors.high.push("Headache + Visual Disturbance → Pre-eclampsia");
  if (ros.headache && ros.epigastricPain) factors.high.push("Headache + Epigastric Pain → Pre-eclampsia");
  if (ros.oedema && med.hypertension) factors.high.push("Severe Oedema with Hypertension");

  if (ros.pvDischarge) factors.moderate.push("PV Discharge");
  if (ros.pelvicPain) factors.moderate.push("Pelvic Pain");
  if (ros.dyspareunia) factors.moderate.push("Dyspareunia");
  if (ros.oedema && !med.hypertension) factors.moderate.push("Oedema (mild, without hypertension)");

  // BAD OBSTETRIC HISTORY
  if (ob.prevPPH) factors.high.push("Previous PPH");
  if (ob.prevPreterm) factors.high.push("Previous Preterm Birth");
  if (ob.prevStillbirth) factors.high.push("Previous Stillbirth");
  if (ob.prevEclampsia) factors.high.push("Previous Eclampsia / PIH");
  if (ob.prevNeonatalDeath) factors.high.push("Previous Neonatal Death");
  if (ob.prevCongenitalAnomaly) factors.high.push("Previous Congenital Anomaly");
  if (ob.prevAbortion2Plus) factors.high.push("Previous Abortion (≥2)");
  if (ob.prevSevereAnaemia) factors.high.push("Severe Anaemia in prev. pregnancy");

  if (ob.prevCS) factors.moderate.push("Previous Caesarean Section");
  if (ob.prevForceps) factors.moderate.push("Previous Forceps / Vacuum");
  if (ob.prevGDM) factors.moderate.push("Previous GDM");

  // MEDICAL DISORDERS
  if (med.hypertension) factors.high.push("Hypertension");
  if (med.diabetes) factors.high.push("Diabetes" + (med.diabetesType ? ` (${med.diabetesType})` : ""));
  if (med.heartDisease) factors.high.push("Congenital / Valvular Heart Disease");
  if (med.sle) factors.high.push("SLE / Rheumatoid Arthritis");
  if (med.sickleCell) factors.high.push("Sickle Cell / Thalassaemia");
  if (med.hiv) factors.high.push("HIV");
  if (med.hepatitisB) factors.high.push("Hepatitis B");
  if (med.hepatitisC) factors.high.push("Hepatitis C");
  if (med.tb) factors.high.push("Tuberculosis (TB)");
  if (med.kidneyLiver) factors.high.push("Kidney / Liver Disease");
  if (med.cysticFibrosis) factors.high.push("Cystic Fibrosis");
  if (med.epilepsy) factors.high.push("Epilepsy");

  if (med.asthma) factors.moderate.push("Asthma (controlled)");
  if (med.thyroid) factors.moderate.push("Thyroid Disorder");

  return factors;
}

/* ─── Main InfoTab ─────────────────────────────────────────────────── */
export default function InfoTab({ patient, onViewVisits }) {
  const abnormalLabs = (patient.labs || []).filter(l => l.status === "abnormal");
  const pendingLabs = (patient.labs || []).filter(l => l.status === "pending");

  const lastVisit = patient.visits?.[0];
  const bpAlert = lastVisit?.bpFlag;
  const fhrAlert = lastVisit?.fhrFlag;

  const activeBasicMed = BASIC_MEDICAL_FLAGS.filter(f => patient.basicMedical?.[f.key]);

  const hasAnyAlert = activeBasicMed.length > 0 || abnormalLabs.length > 0 || bpAlert || fhrAlert;

  // Risk factors from first visit
  const riskFactors = getRiskFactors(patient);
  const hasRiskFactors = riskFactors.high.length > 0 || riskFactors.moderate.length > 0;

  // Collect the specific reasons driving the risk level
  const riskReasons = [];
  if (riskFactors.high.length > 0) riskReasons.push(...riskFactors.high.slice(0, 3));
  else if (riskFactors.moderate.length > 0) riskReasons.push(...riskFactors.moderate.slice(0, 3));
  if (activeBasicMed.length > 0 && riskReasons.length < 3) riskReasons.push(...activeBasicMed.map(f => f.label));
  if ((patient.tags || []).length > 0 && riskReasons.length < 3) riskReasons.push(...patient.tags.slice(0, 2));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

      {/* Left column */}
      <div className="space-y-4 lg:col-span-1">

        {/* Risk banner — High */}
        {patient.riskLevel === "high" && (
          <div className="bg-rose-600 text-white rounded-2xl px-4 py-3.5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">⚠</span>
              <p className="text-xs font-bold uppercase tracking-wider">High Risk Pregnancy</p>
            </div>
            {riskReasons.length > 0 && (
              <ul className="space-y-0.5 ml-1">
                {riskReasons.map((r, i) => (
                  <li key={i} className="text-[11px] text-rose-100">• {r}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Risk banner — Moderate */}
        {patient.riskLevel === "moderate" && (
          <div className="bg-amber-500 text-white rounded-2xl px-4 py-3.5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">⚠</span>
              <p className="text-xs font-bold uppercase tracking-wider">Moderate Risk</p>
            </div>
            {riskReasons.length > 0 && (
              <ul className="space-y-0.5 ml-1">
                {riskReasons.map((r, i) => (
                  <li key={i} className="text-[11px] text-amber-100">• {r}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Risk banner — Low */}
        {patient.riskLevel === "low" && (
          <div className="bg-emerald-500 text-white rounded-2xl px-4 py-3.5">
            <div className="flex items-center gap-2">
              <span className="text-base">✓</span>
              <p className="text-xs font-bold uppercase tracking-wider">Low Risk — Normal</p>
            </div>
          </div>
        )}

        <PersonalCard patient={patient} />
        <PregnancyCard patient={patient} />
        <AllergyCard allergies={patient.allergies} />

        {/* Basic Medical Flags */}
        {activeBasicMed.length > 0 && (
          <Card className="p-4">
            <SectionLabel>Basic Medical Flags</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {activeBasicMed.map(f => (
                <span key={f.key} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-rose-100 text-rose-700">
                  ⚠ {f.label}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Partner Info */}
        {patient.partner?.name && (
          <Card className="p-4">
            <SectionLabel>Partner Information</SectionLabel>
            <div className="space-y-1">
              <p className="text-sm font-medium text-stone-800">{patient.partner.name}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-stone-500">
                {patient.partner.age && <span>Age: <strong className="text-stone-700">{patient.partner.age}</strong></span>}
                {patient.partner.occupation && <span>{patient.partner.occupation}</span>}
                {patient.partner.phone && <span>📞 {patient.partner.phone}</span>}
                {patient.partner.education && <span>{patient.partner.education}</span>}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Right column */}
      <div className="space-y-4 lg:col-span-2">

        {/* ──── MATERNAL HEALTH RISK ASSESSMENT CARD ──── */}
        {hasRiskFactors && (
          <Card className="p-5 border-2 border-stone-200">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl"></span>
              <div>
                <p className="text-sm font-bold text-stone-900" style={{ fontFamily: "var(--font-display)" }}>
                  Maternal Health Evaluation
                </p>
                <p className="text-[10px] text-stone-400 mt-0.5">
                  Based on evaluation completed on {patient.firstVisit?.completedOn || "—"}
                </p>
              </div>
            </div>

            {/* HIGH RISK factors */}
            {riskFactors.high.length > 0 && (
              <div className="mb-4">
                <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  High Risk Conditions ({riskFactors.high.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {riskFactors.high.map((f, i) => (
                    <RiskFlagPill key={i} label={f} level="high" />
                  ))}
                </div>
              </div>
            )}

            {/* MODERATE RISK factors */}
            {riskFactors.moderate.length > 0 && (
              <div className="mb-4">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Moderate Risk Conditions ({riskFactors.moderate.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {riskFactors.moderate.map((f, i) => (
                    <RiskFlagPill key={i} label={f} level="moderate" />
                  ))}
                </div>
              </div>
            )}

            {/* Examination data from first visit */}
            {patient.firstVisit?.examination && (
              <div className="mt-4 pt-4 border-t border-stone-100">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">First Visit Examination</p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {patient.firstVisit.examination.bp && (
                    <div className="bg-stone-50 rounded-xl px-3 py-2 text-center">
                      <p className="text-[10px] text-stone-400">BP</p>
                      <p className="text-sm font-bold text-stone-800">{patient.firstVisit.examination.bp}</p>
                    </div>
                  )}
                  {patient.firstVisit.examination.weight && (
                    <div className="bg-stone-50 rounded-xl px-3 py-2 text-center">
                      <p className="text-[10px] text-stone-400">Weight</p>
                      <p className="text-sm font-bold text-stone-800">{patient.firstVisit.examination.weight} kg</p>
                    </div>
                  )}
                  {patient.firstVisit.examination.bmi && (
                    <div className="bg-stone-50 rounded-xl px-3 py-2 text-center">
                      <p className="text-[10px] text-stone-400">BMI</p>
                      <p className="text-sm font-bold text-stone-800">{patient.firstVisit.examination.bmi}</p>
                    </div>
                  )}
                  {patient.firstVisit.examination.pulse && (
                    <div className="bg-stone-50 rounded-xl px-3 py-2 text-center">
                      <p className="text-[10px] text-stone-400">Pulse</p>
                      <p className="text-sm font-bold text-stone-800">{patient.firstVisit.examination.pulse}</p>
                    </div>
                  )}
                  {patient.firstVisit.examination.fundalHeight && (
                    <div className="bg-stone-50 rounded-xl px-3 py-2 text-center">
                      <p className="text-[10px] text-stone-400">Fundal Ht</p>
                      <p className="text-sm font-bold text-stone-800">{patient.firstVisit.examination.fundalHeight} cm</p>
                    </div>
                  )}
                  {patient.firstVisit.examination.generalCondition && (
                    <div className="bg-stone-50 rounded-xl px-3 py-2 text-center">
                      <p className="text-[10px] text-stone-400">Condition</p>
                      <p className="text-sm font-bold text-stone-800">{patient.firstVisit.examination.generalCondition}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Combined alerts panel */}
        {hasAnyAlert && (
          <Card className="p-4">
            <SectionLabel>Active Alerts</SectionLabel>
            <div className="space-y-2">
              {activeBasicMed.map(f => (
                <RiskSourceBadge key={f.key} label={f.label} source="From registration · basic medical" />
              ))}

              {abnormalLabs.map(l => (
                <div key={l.id} className="flex items-center justify-between bg-rose-50 border border-rose-100 rounded-xl px-3 py-2.5">
                  <div>
                    <span className="text-sm font-semibold text-rose-800">{l.test}</span>
                    <span className="text-[11px] text-rose-500 ml-2">Lab result</span>
                  </div>
                  <span className="text-sm font-bold text-rose-700 font-mono">{l.value} {l.unit}</span>
                </div>
              ))}

              {pendingLabs.map(l => (
                <div key={l.id} className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
                  <span className="text-sm font-medium text-amber-800">{l.test}</span>
                  <span className="text-[10px] font-bold bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full uppercase">Pending</span>
                </div>
              ))}

              {bpAlert && (
                <div className="flex items-center justify-between bg-rose-50 border border-rose-100 rounded-xl px-3 py-2.5">
                  <span className="text-sm font-semibold text-rose-800">
                    {bpAlert === "severe" ? "⚠ Severe Hypertension" : bpAlert === "high" ? "Hypertension" : "Hypotension"}
                  </span>
                  <span className="text-[11px] text-rose-500">BP at last visit: {lastVisit.bp}</span>
                </div>
              )}

              {fhrAlert && (
                <div className="flex items-center justify-between bg-orange-50 border border-orange-100 rounded-xl px-3 py-2.5">
                  <span className="text-sm font-semibold text-orange-800">
                    {fhrAlert === "bradycardia" ? "Fetal Bradycardia" : "Fetal Tachycardia"}
                  </span>
                  <span className="text-[11px] text-orange-500">FHR at last visit: {lastVisit.fetalHR} bpm</span>
                </div>
              )}
            </div>
          </Card>
        )}

        <AlertsCard labs={patient.labs} />

        {/* First Visit Summary */}
        {patient.firstVisit?.completed && (
          <Card className="p-4">
            <SectionLabel>📋 First Visit Summary</SectionLabel>
            <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">{patient.firstVisit.summary}</p>
            <p className="text-[10px] text-stone-400 mt-2">Completed on {patient.firstVisit.completedOn}</p>
          </Card>
        )}

        {/* Last visit preview */}
        {patient.visits?.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <SectionLabel>Last Visit</SectionLabel>
              <button onClick={onViewVisits} className="text-xs text-brand-700 font-medium hover:underline">
                View all visits →
              </button>
            </div>
            <VisitCard visit={patient.visits[0]} isLatest />
          </Card>
        )}
      </div>
    </div>
  );
}
