import PersonalCard from "./PersonalCard.jsx";
import PregnancyCard from "./PregnancyCard.jsx";
import AllergyCard from "./AllergyCard.jsx";
import AlertsCard from "./AlertsCard.jsx";
import VisitCard from "./VisitCard.jsx";
import Card from "../ui/Card.jsx";
import SectionLabel from "../ui/SectionLabel.jsx";
import { BASIC_MEDICAL_FLAGS, RISK_CONFIG } from "../../utils/helpers.js";

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

export default function InfoTab({ patient, onViewVisits }) {
  // Lab alerts
  const abnormalLabs = (patient.labs || []).filter(l => l.status === "abnormal");
  const pendingLabs = (patient.labs || []).filter(l => l.status === "pending");

  // Visit-based BP/FHR alerts
  const lastVisit = patient.visits?.[0];
  const bpAlert = lastVisit?.bpFlag;
  const fhrAlert = lastVisit?.fhrFlag;

  // Basic medical flags from registration
  const activeBasicMed = BASIC_MEDICAL_FLAGS.filter(f => patient.basicMedical?.[f.key]);

  // First visit risk
  const fvRisk = patient.firstVisit?.autoRisk;

  const hasAnyAlert = activeBasicMed.length > 0 || abnormalLabs.length > 0 || bpAlert || fhrAlert;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

      {/* Left column */}
      <div className="space-y-4 lg:col-span-1">

        {/* Risk banner */}
        {patient.riskLevel === "high" && (
          <div className="bg-rose-600 text-white rounded-2xl px-4 py-3.5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">⚠</span>
              <p className="text-xs font-bold uppercase tracking-wider">High Risk Pregnancy</p>
            </div>
            {activeBasicMed.length > 0 && (
              <ul className="space-y-0.5 ml-1">
                {activeBasicMed.map(f => (
                  <li key={f.key} className="text-[11px] text-rose-100">• {f.label}</li>
                ))}
              </ul>
            )}
            {fvRisk === "high" && (
              <p className="text-[11px] text-rose-100 mt-1">• First visit assessment: High Risk</p>
            )}
          </div>
        )}


        {patient.riskLevel === "moderate" && (
          <div className="bg-amber-500 text-white rounded-2xl px-4 py-3.5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">⚠</span>
              <p className="text-xs font-bold uppercase tracking-wider">Moderate Risk</p>
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
      </div>

      {/* Right column */}
      <div className="space-y-4 lg:col-span-2">

        {/* Combined alerts panel */}
        {hasAnyAlert && (
          <Card className="p-4">
            <SectionLabel>🚨 Active Alerts</SectionLabel>
            <div className="space-y-2">
              {/* Basic medical flags from registration */}
              {activeBasicMed.map(f => (
                <RiskSourceBadge
                  key={f.key}
                  label={f.label}
                  source="From registration · basic medical"
                />
              ))}

              {/* Abnormal labs */}
              {abnormalLabs.map(l => (
                <div key={l.id}
                  className="flex items-center justify-between bg-rose-50 border border-rose-100 rounded-xl px-3 py-2.5"
                >
                  <div>
                    <span className="text-sm font-semibold text-rose-800">{l.test}</span>
                    <span className="text-[11px] text-rose-500 ml-2">Lab result</span>
                  </div>
                  <span className="text-sm font-bold text-rose-700 font-mono">{l.value} {l.unit}</span>
                </div>
              ))}

              {/* Pending labs */}
              {pendingLabs.map(l => (
                <div key={l.id}
                  className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5"
                >
                  <span className="text-sm font-medium text-amber-800">{l.test}</span>
                  <span className="text-[10px] font-bold bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full uppercase">Pending</span>
                </div>
              ))}

              {/* BP alert from last visit */}
              {bpAlert && (
                <div className="flex items-center justify-between bg-rose-50 border border-rose-100 rounded-xl px-3 py-2.5">
                  <span className="text-sm font-semibold text-rose-800">
                    {bpAlert === "severe" ? "⚠ Severe Hypertension" : bpAlert === "high" ? "Hypertension" : "Hypotension"}
                  </span>
                  <span className="text-[11px] text-rose-500">BP at last visit: {lastVisit.bp}</span>
                </div>
              )}

              {/* FHR alert from last visit */}
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

        {/* First Visit summary */}
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
