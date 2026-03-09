import { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useApp } from "../hooks/useApp.js";
import AppShell from "../components/layout/AppShell.jsx";
import BrandLogo from "../components/layout/BrandLogo.jsx";
import BackButton from "../components/layout/BackButton.jsx";
import PatientBanner from "../components/patient/PatientBanner.jsx";
import PatientTabBar from "../components/patient/PatientTabBar.jsx";
import InfoTab from "../components/patient/InfoTab.jsx";
import FirstVisitTab from "../components/patient/FirstVisitTab.jsx";
import VisitsTab from "../components/patient/VisitsTab.jsx";
import AddVisitModal from "../components/modals/AddVisitModal.jsx";
import AddLabModal from "../components/modals/AddLabModal.jsx";
import RecordDeliveryModal from "../components/patient/RecordDeliveryModal.jsx";
import RecordPregnancyModal from "../components/modals/RecordPregnancyModal.jsx";
import Button from "../components/ui/Button.jsx";
import { getMissedContacts, today } from "../utils/helpers.js";

export default function PatientPage() {
  const { id } = useParams();
  const { state, dispatch } = useApp();
  const [tab, setTab] = useState("info");
  const [showVisit, setShowVisit] = useState(false);
  const [showLab, setShowLab] = useState(false);
  const [showDelivery, setShowDelivery] = useState(false);
  const [showPregnancy, setShowPregnancy] = useState(false);

  const patient = state.patients.find(p => p.id === id)
    || (state.postnatalPatients || []).find(p => p.id === id);
  if (!patient) return <Navigate to="/" replace />;
  const isPostnatal = patient.patientType === "postnatal";
  const missedContacts = isPostnatal ? [] : getMissedContacts(patient.lmp, patient.visits);
  const firstVisitDone = !!patient.firstVisit?.completed;
  const isDueOrPast = !isPostnatal && new Date(today()) >= new Date(patient.edd);

  const TABS = [
    { id: "info", label: "Patient Info" },
    { id: "firstVisit", label: firstVisitDone ? "Maternal health evaluation ✓" : "Maternal health evaluation", dot: !firstVisitDone },
    { id: "visits", label: `Visits (${patient.visits.length})`, dot: missedContacts.length > 0 },
  ];

  const header = (
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      <div className="flex items-center gap-4 h-14 border-b border-stone-100">
        <BrandLogo showText />
        <div className="w-px h-5 bg-stone-200" />
        <BackButton label="Dashboard" to="/" />
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" onClick={() => setShowVisit(true)}>+ Visit</Button>
          {isPostnatal && (
            <Button size="sm" variant="success" onClick={() => setShowPregnancy(true)}>
              Record Pregnancy
            </Button>
          )}
          {!isPostnatal && (
            <Button size="sm" variant="success" onClick={() => setShowDelivery(true)}>
              Record Delivery
            </Button>
          )}
        </div>
      </div>
      <PatientBanner patient={patient} />
      <PatientTabBar tabs={TABS} active={tab} onChange={setTab} />
    </div>
  );

  return (
    <AppShell header={header}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

        {/* EDD Reached alert banner */}
        {isDueOrPast && (
          <div className="mb-5 bg-violet-50 border border-violet-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-violet-500 text-xl shrink-0 mt-0.5">👶</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-violet-800">
                  Estimated Date of Delivery Reached
                </p>
                <p className="text-xs text-violet-600 mt-0.5">
                  The patient's EDD ({patient.edd}) has been reached or passed. Record delivery to close this pregnancy evaluation.
                </p>
              </div>
              <button
                onClick={() => setShowDelivery(true)}
                className="shrink-0 text-xs bg-violet-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-violet-700 transition-colors"
              >
                Record Delivery
              </button>
            </div>
          </div>
        )}

        {/* Missed ANC alert banner */}
        {missedContacts.length > 0 && !isDueOrPast && (
          <div className="mb-5 bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-amber-500 text-lg shrink-0 mt-0.5">⏰</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-amber-800">
                  {missedContacts.length} ANC Visit{missedContacts.length > 1 ? "s" : ""} Overdue
                </p>
                <p className="text-xs text-amber-600 mt-0.5">
                  {missedContacts.map(c => `${c.label} (${c.timing})`).join(" · ")}
                </p>
              </div>
              <button
                onClick={() => { setShowVisit(true); }}
                className="shrink-0 text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
              >
                Add Visit
              </button>
            </div>
          </div>
        )}

        {/* First visit prompt */}
        {!firstVisitDone && tab !== "firstVisit" && !isDueOrPast && (
          <div className="mb-5 bg-brand-50 border border-brand-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-brand-500 text-lg shrink-0 mt-0.5">📋</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-brand-800">Maternal health evaluation</p>
                <p className="text-xs text-brand-600 mt-0.5">Comprehensive history-taking has not been completed yet.</p>
              </div>
              <button
                onClick={() => setTab("firstVisit")}
                className="shrink-0 text-xs bg-brand-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-brand-700 transition-colors"
              >
                Start Now
              </button>
            </div>
          </div>
        )}

        {tab === "info" && <InfoTab patient={patient} onViewVisits={() => setTab("visits")} />}
        {tab === "firstVisit" && <FirstVisitTab patient={patient} />}
        {tab === "visits" && <VisitsTab patient={patient} visits={patient.visits} onAdd={() => setShowVisit(true)} missedContacts={missedContacts} />}
      </div>

      {showVisit && <AddVisitModal patient={patient} onClose={() => setShowVisit(false)} />}
      {showLab && <AddLabModal patient={patient} onClose={() => setShowLab(false)} />}
      <RecordDeliveryModal
        open={showDelivery}
        patient={patient}
        onClose={() => setShowDelivery(false)}
        onSave={(data) => {
          dispatch({ type: "RECORD_DELIVERY", patientId: patient.id, payload: data });
          setShowDelivery(false);
        }}
      />
      {showPregnancy && <RecordPregnancyModal patient={patient} onClose={() => setShowPregnancy(false)} />}
    </AppShell>
  );
}
