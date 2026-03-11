import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../hooks/useApp.js";
import AppShell from "../components/layout/AppShell.jsx";
import BrandLogo from "../components/layout/BrandLogo.jsx";
import BackButton from "../components/layout/BackButton.jsx";
import Button from "../components/ui/Button.jsx";
import RegStepper from "../components/registration/RegStepper.jsx";
import RegPersonal from "../components/registration/RegPersonal.jsx";
import RegPregnancy from "../components/registration/RegPregnancy.jsx";
import { today, nextId, calcEDD, calcGA } from "../utils/helpers.js";
import Card from "../components/ui/Card.jsx";
import FormInput from "../components/ui/FormInput.jsx";

const EMPTY = {
  // Personal
  name: "",
  age: "",
  phone: "",
  address: "",
  religion: "",
  ethnicity: "",
  education: "",
  occupation: "",

  // Physical
  weight: "",
  heightFt: "",
  heightIn: "",

  // Blood
  bloodType: "",
  rh: "",
  bloodGroup: "",

  // Partner
  partner: {
    name: "",
    age: "",
    phone: "",
    education: "",
    occupation: "",
  },

  // Medical
  basicMedical: {},
  allergies: "",

  // Pregnancy
  gravida: "1",
  para: "0",
  lmp: "",
  edd: "",
  ga: "",
};

export default function RegisterPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [form, setFormState] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [patientMode, setPatientMode] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReturning, setSelectedReturning] = useState(null);

  const set = (key, value) =>
    setFormState((prev) => ({ ...prev, [key]: value }));

  const setPartner = (key, value) =>
    setFormState((prev) => ({
      ...prev,
      partner: { ...prev.partner, [key]: value },
    }));

  const setMedFlag = (key, checked) =>
    setFormState((prev) => ({
      ...prev,
      basicMedical: { ...prev.basicMedical, [key]: checked },
    }));

  function validate(s) {
    const e = {};
    if (s === 1) {
      if (!form.name.trim()) e.name = "Name is required";
      if (!form.phone.trim()) e.phone = "Phone is required";
    }
    if (s === 2) {
      if (!form.lmp) e.lmp = "LMP is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const returningResults = searchQuery.trim()
    ? (state.postnatalPatients || []).filter((p) => {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.phone.includes(q)
      );
    })
    : [];

  function selectReturningPatient(p) {
    setSelectedReturning(p);
    const heightCm = parseFloat(p.height || 0);
    const ft = heightCm ? Math.floor(heightCm / 30.48).toString() : "";
    const inch = heightCm
      ? Math.round((heightCm % 30.48) / 2.54).toString()
      : "";

    // Build previous pregnancy entry from the delivery that just happened
    const prevDeliveryEntry = p.deliveryDate ? {
      year: p.deliveryDate.slice(0, 4),
      outcome: p.babyStatus === "Stillbirth" ? "Stillbirth" :
        p.babyStatus === "Neonatal Death" ? "Neonatal Death" : "Live Birth",
      ancAttended: true,
      placeOfDelivery: "Hospital",
      ga: p.gaAtDelivery || "",
      typeOfLabour: p.durationOfLabor ? "Spontaneous" : "",
      modeOfDelivery: p.deliveryMode || "",
      complications: p.maternalComplications && p.maternalComplications !== "None" ? p.maternalComplications : "",
      babyComplications: p.babyStatus !== "Stable" && p.babyStatus !== "Healthy & Stable" ? p.babyStatus : "",
      babySex: p.babySex || "",
      babyWeight: p.birthWeight ? `${p.birthWeight} kg` : "",
      apgar: p.apgar5 ? `5min: ${p.apgar5}` : "",
      timeOfBirth: p.deliveryTime || "",
      immunisations: p.immunization ? Object.entries(p.immunization).filter(([_, v]) => v).map(([k]) => k.toUpperCase()).join(", ") : "",
      breastfeeding: p.bfedInitiated === "Yes" ? "Exclusive (6 months)" : "",
    } : null;

    // Combine with existing previous pregnancies from old firstVisit
    const existingPrevPregs = p.firstVisit?.obstetricHistory?.previousPregnancies || [];
    const allPrevPregs = prevDeliveryEntry
      ? [prevDeliveryEntry, ...existingPrevPregs]
      : existingPrevPregs;

    // Build prevFirstVisit with updated OB history
    // IMPORTANT: Strip 'completed' so computeOverallRisk treats this as
    // returning-patient history (scans previousPregnancies for delivery
    // complications) instead of a current first visit.
    const { completed: _stripped, ...prevFvBase } = p.firstVisit || {};
    const prevFirstVisit = p.firstVisit ? {
      ...prevFvBase,
      obstetricHistory: {
        ...(p.firstVisit.obstetricHistory || {}),
        previousPregnancies: allPrevPregs,
      },
    } : allPrevPregs.length > 0 ? {
      obstetricHistory: { previousPregnancies: allPrevPregs },
    } : null;

    setFormState((prev) => ({
      ...prev,
      name: p.name,
      age: String(p.age || ""),
      phone: p.phone || "",
      address: p.address || "",
      bloodType: p.bloodGroup ? p.bloodGroup.replace(/[+\u2212-]/g, "") : "",
      rh:
        p.bloodGroup?.includes("−") || p.bloodGroup?.includes("-")
          ? "Negative"
          : p.bloodGroup
            ? "Positive"
            : "",
      bloodGroup: p.bloodGroup || "",
      religion: p.religion || "",
      ethnicity: p.ethnicity || "",
      education: p.education || "",
      occupation: p.occupation || "",
      weight: p.weight || "",
      heightFt: ft,
      heightIn: inch,
      partner: p.partner || prev.partner,
      basicMedical: p.basicMedical || {},
      allergies: p.allergies || "",
      // Gravida always +1 — every pregnancy counts
      gravida: String((parseInt(p.gravida) || 0) + 1),
      // User requested: only make gravida plus 1 but no para
      para: String(parseInt(p.para) || 0),
      prevFirstVisit: prevFirstVisit,
    }));
    setStep(1);
  }

  function next() {
    if (!validate(step)) return;
    setCompleted((prev) => [...new Set([...prev, step])]);
    setStep((s) => s + 1);
  }

  function back() {
    setStep((s) => s - 1);
  }

  function handleSubmit() {
    if (!validate(step)) return;

    const rhSymbol = form.rh === "Negative" ? "−" : "+";
    const composedBloodGroup = form.bloodType
      ? `${form.bloodType}${rhSymbol}`
      : form.bloodGroup;

    let heightCm = null;
    let bmi = null;

    if (form.heightFt) {
      const totalInches =
        parseFloat(form.heightFt || 0) * 12 + parseFloat(form.heightIn || 0);
      heightCm = totalInches * 2.54;
      if (form.weight && heightCm > 0) {
        const heightMeters = heightCm / 100;
        bmi = (
          parseFloat(form.weight) /
          (heightMeters * heightMeters)
        ).toFixed(1);
      }
    }

    const registeredPatient = {
      id: nextId(state.patients),
      name: form.name.trim(),
      age: parseInt(form.age) || 0,
      phone: form.phone.trim(),
      address: form.address.trim(),
      bloodGroup: composedBloodGroup,
      religion: form.religion,
      ethnicity: form.ethnicity,
      education: form.education,
      occupation: form.occupation,
      weight: form.weight,
      height: heightCm ? heightCm.toFixed(1) : null,
      bmi: bmi,
      partner: form.partner,
      basicMedical: form.basicMedical,
      allergies: form.allergies.trim(),
      gravida: parseInt(form.gravida) || 1,
      para: parseInt(form.para) || 0,
      lmp: form.lmp,
      edd: form.edd || calcEDD(form.lmp),
      ga: form.ga || calcGA(form.lmp),
      tags: [],
      registeredOn: today(),
      visits: [],
      labs: [],
      firstVisit: form.prevFirstVisit || null,
      prevFirstVisit: form.prevFirstVisit || null,
    };

    dispatch({
      type: "ADD_PATIENT",
      payload: registeredPatient,
    });

    navigate("/");
  }

  const STEP_TITLES = {
    1: "Personal Information",
    2: "Pregnancy Details",
  };

  // ─── Step 0: Patient type selection ───────────────────────────────────────
  if (step === 0) {
    return (
      <AppShell
        header={
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
            <BrandLogo />
            <div className="w-px h-5 bg-stone-200" />
            <BackButton label="Dashboard" to="/" />
          </div>
        }
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">

          {/* Heading */}
          <div className="mb-10">
            <h1
              className="text-2xl font-bold text-stone-900 mb-1.5"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Register Patient
            </h1>
            <p className="text-sm text-stone-400">
              Are you a new patient or a returning one?
            </p>
          </div>

          {/* Selection cards */}
          <div className="grid grid-cols-2 gap-4">

            {/* New Patient */}
            <button
              onClick={() => { setPatientMode("new"); setStep(1); }}
              className="group relative text-left p-6 rounded-2xl border-2 border-stone-200 bg-white hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-100 transition-all duration-200 active:scale-[0.98] overflow-hidden"
            >
              <div className="absolute inset-0 bg-linear-to-br from-emerald-50/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center mb-5 transition-colors duration-200">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="font-bold text-stone-900 text-base mb-1" style={{ fontFamily: "var(--font-display)" }}>
                  New Patient
                </p>
                <p className="text-xs text-stone-400 leading-snug">
                  First-time visit with no prior records in the system
                </p>
                <div className="mt-5 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Continue <span>→</span>
                </div>
              </div>
            </button>

            {/* Returning Patient */}
            <button
              onClick={() =>
                setPatientMode(patientMode === "returning" ? null : "returning")
              }
              className={`group relative text-left p-6 rounded-2xl border-2 transition-all duration-200 active:scale-[0.98] overflow-hidden
                ${patientMode === "returning"
                  ? "border-brand-400 bg-white shadow-lg shadow-brand-100"
                  : "border-stone-200 bg-white hover:border-brand-400 hover:shadow-lg hover:shadow-brand-100"
                }`}
            >
              <div
                className={`absolute inset-0 bg-linear-to-br from-brand-50/80 to-transparent transition-opacity duration-200
                  ${patientMode === "returning" ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
              />
              {patientMode === "returning" && (
                <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-brand-500 shadow-sm shadow-brand-300" />
              )}
              <div className="relative">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-200
                    ${patientMode === "returning"
                      ? "bg-brand-200"
                      : "bg-brand-100 group-hover:bg-brand-200"
                    }`}
                >
                  <svg className="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="font-bold text-stone-900 text-base mb-1" style={{ fontFamily: "var(--font-display)" }}>
                  Returning Patient
                </p>
                <p className="text-xs text-stone-400 leading-snug">
                  Previously registered with existing pregnancy records
                </p>
                <div
                  className={`mt-5 flex items-center gap-1 text-[11px] font-semibold text-brand-600 transition-opacity duration-200
                    ${patientMode === "returning" ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                >
                  {patientMode === "returning" ? "Search below ↓" : "Select to search →"}
                </div>
              </div>
            </button>
          </div>

          {/* Returning patient search panel */}
          {patientMode === "returning" && (
            <div className="mt-4 rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
              <div className="px-5 py-3 bg-stone-50 border-b border-stone-100 flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
                  Search existing records
                </p>
              </div>

              <div className="p-5">
                <FormInput
                  label="Name, ID, or Phone"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Maria Santos or 09171234567"
                  autoFocus
                />

                {returningResults.length > 0 && (
                  <div className="mt-3 space-y-1.5 max-h-60 overflow-y-auto -mx-1 px-1">
                    {returningResults.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => selectReturningPatient(p)}
                        className="w-full text-left flex items-center gap-3 p-3 rounded-xl border border-stone-100 hover:border-brand-300 hover:bg-brand-50/40 transition-colors group/row"
                      >
                        <div className="w-9 h-9 rounded-full bg-stone-100 group-hover/row:bg-brand-100 flex items-center justify-center shrink-0 text-sm font-bold text-stone-500 group-hover/row:text-brand-600 transition-colors">
                          {p.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-stone-900 text-sm truncate">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-stone-400 truncate">
                            {p.id} · {p.phone}
                            {p.bloodGroup ? ` · ${p.bloodGroup}` : ""}
                          </p>
                        </div>
                        <span className="text-stone-300 group-hover/row:text-brand-400 transition-colors text-sm">
                          →
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {searchQuery.trim() && returningResults.length === 0 && (
                  <div className="mt-4 py-8 text-center">
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3">
                      <svg className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-stone-500 font-medium">No patients found</p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Try a different name, ID, or phone number
                    </p>
                  </div>
                )}

                {!searchQuery.trim() && (
                  <p className="mt-3 text-[11px] text-stone-400 text-center">
                    Search postnatal records to pre-fill the registration form
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </AppShell>
    );
  }

  // ─── Steps 1 & 2: Registration form ───────────────────────────────────────
  const header = (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
      <BrandLogo />
      <div className="w-px h-5 bg-stone-200" />
      <BackButton label="Dashboard" to="/" />
      <div className="ml-auto">
        <span className="text-xs text-stone-400 font-medium">
          Step {step} of 2 — {STEP_TITLES[step]}
          {selectedReturning ? ` (Returning: ${selectedReturning.name})` : ""}
        </span>
      </div>
    </div>
  );

  return (
    <AppShell header={header}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1
            className="text-2xl font-bold text-stone-900 mb-1"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Register {selectedReturning ? "Returning" : "New"} Patient
          </h1>
          <p className="text-sm text-stone-400">
            Complete both sections to register the patient.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <RegStepper current={step} completed={completed} />

          <div className="flex-1 min-w-0">
            {Object.keys(errors).length > 0 && (
              <div className="mb-4 bg-rose-50 border border-rose-200 rounded-2xl p-4">
                <p className="text-sm font-semibold text-rose-800">
                  Please fix the following:
                </p>
                <ul className="mt-1 space-y-0.5">
                  {Object.values(errors).map((e, i) => (
                    <li key={i} className="text-xs text-rose-600">
                      • {e}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {step === 1 && (
              <RegPersonal
                form={form}
                set={set}
                setPartner={setPartner}
                setMedFlag={setMedFlag}
              />
            )}

            {step === 2 && (
              <RegPregnancy form={form} set={set} patientMode={patientMode} />
            )}

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone-200">
              <Button
                variant="ghost"
                onClick={step === 1 ? () => setStep(0) : back}
              >
                {step === 1 ? "Cancel" : "← Back"}
              </Button>

              {step < 2 ? (
                <Button onClick={next}>Continue →</Button>
              ) : (
                <Button
                  variant="success"
                  onClick={handleSubmit}
                  disabled={!form.name || !form.phone}
                >
                  ✓ Register Patient
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}