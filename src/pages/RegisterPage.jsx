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

const EMPTY = {
  // Personal
  name: "",
  age: "",
  phone: "",
  address: "",
  bloodGroup: "",
  religion: "",
  ethnicity: "",
  education: "",
  occupation: "",

  // Physical
  weight: "",
  heightFt: "",
  heightIn: "",

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
  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState([]);
  const [form, setFormState] = useState(EMPTY);
  const [errors, setErrors] = useState({});

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

    // ─── Convert ft/in → cm ───
    let heightCm = null;
    let bmi = null;

    if (form.heightFt) {
      const totalInches =
        parseFloat(form.heightFt || 0) * 12 +
        parseFloat(form.heightIn || 0);

      heightCm = totalInches * 2.54;

      if (form.weight && heightCm > 0) {
        const heightMeters = heightCm / 100;
        bmi = (
          parseFloat(form.weight) /
          (heightMeters * heightMeters)
        ).toFixed(1);
      }
    }

    dispatch({
      type: "ADD_PATIENT",
      payload: {
        id: nextId(state.patients),
        name: form.name.trim(),
        age: parseInt(form.age) || 0,
        phone: form.phone.trim(),
        address: form.address.trim(),
        bloodGroup: form.bloodGroup,
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
        riskLevel: "low",
        registeredOn: today(),
        visits: [],
        labs: [],
        firstVisit: null,
      },
    });

    navigate("/");
  }

  const STEP_TITLES = {
    1: "Personal Information",
    2: "Pregnancy Details",
  };

  const header = (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
      <BrandLogo />
      <div className="w-px h-5 bg-stone-200" />
      <BackButton label="Dashboard" to="/" />
      <div className="ml-auto">
        <span className="text-xs text-stone-400 font-medium">
          Step {step} of 2 — {STEP_TITLES[step]}
        </span>
      </div>
    </div>
  );

  return (
    <AppShell header={header}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1
            className="text-2xl font-bold text-stone-900 mb-1"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Register New Patient
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
              <RegPregnancy form={form} set={set} />
            )}

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone-200">
              <Button
                variant="ghost"
                onClick={step === 1 ? () => navigate("/") : back}
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