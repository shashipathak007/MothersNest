import { useState, useEffect, useMemo } from "react";
import { useApp } from "../../hooks/useApp.js";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import FormInput from "../ui/FormInput.jsx";
import FormSelect from "../ui/FormSelect.jsx";
import FormTextarea from "../ui/FormTextarea.jsx";
import SectionLabel from "../ui/SectionLabel.jsx";
import { 
  today, uid, calcGA, calcBMI, VISIT_TYPES, bpFlag, fetalHRFlag, 
  pulseFlag, ANC_SCHEDULE, getCurrentANCContact, ANC_VISIT_TESTS, 
  autoLabStatus, getLabUnit, getLabMeta, getLabOptions 
} from "../../utils/helpers.js";

const OEDEMA_OPTIONS = ["None (−)", "Mild (+)", "Moderate (++)", "Severe (+++)"];
const PRESENTATION_OPTIONS = ["Cephalic", "Breech", "Transverse", "Not assessed"];

function detectContact(visitType) {
  return ANC_SCHEDULE.find(c => c.visitType === visitType)?.contact ?? null;
}

function getTestsForContact(contact) {
  return ANC_VISIT_TESTS[contact] || [];
}

export default function AddVisitModal({ patient, initialVisit, onClose }) {
  const { dispatch } = useApp();
  const isEdit = !!initialVisit;
  const lastV = patient.visits?.[0];

  const defaults = {
    date: today(), type: "Unscheduled ANC Visit",
    ga: calcGA(patient.lmp) || "",
    bp: "", pulse: lastV?.pulse || "",
    weight: patient.weight || "",
    heightFt: patient.height ? Math.floor(parseFloat(patient.height) / 30.48).toString() : "",
    heightIn: patient.height ? Math.round((parseFloat(patient.height) % 30.48) / 2.54).toString() : "",
    fetalHR: "", fundal: "",
    oedema: lastV?.oedema || "",
    presentation: lastV?.presentation || "",
    findings: "", plan: "", examNotes: "",
    tests: [],
    presentingComplaints: "",
    reviewOfSystems: {
      pvBleeding: false, pvDischarge: false, pelvicPain: false,
      fetalMovements: false, contractions: false, headache: false,
      visualDisturbance: false, epigastricPain: false, oedemaROS: false,
    },
    gbvScreening: "",
    gbvRisk: false,
  };

  const buildEditForm = (visit) => {
    const hCm = parseFloat(visit.height) || 0;
    return {
      ...defaults,
      ...visit,
      heightFt: hCm ? Math.floor(hCm / 30.48).toString() : defaults.heightFt,
      heightIn: hCm ? Math.round((hCm % 30.48) / 2.54).toString() : defaults.heightIn,
      reviewOfSystems: { ...defaults.reviewOfSystems, ...(visit.reviewOfSystems || {}) },
      tests: visit.tests || [],
      presentingComplaints: visit.presentingComplaints || "",
      gbvScreening: visit.gbvScreening || "",
      gbvRisk: visit.gbvRisk || false,
      examNotes: visit.examNotes || "",
    };
  };

  const [form, setForm] = useState(isEdit ? buildEditForm(initialVisit) : defaults);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    if (patient.lmp) {
      const currentGa = calcGA(patient.lmp);
      set("ga", currentGa);

      const currentAnc = getCurrentANCContact(patient.lmp);
      if (currentAnc) {
        const typeStr = ANC_SCHEDULE.find(c => c.contact === currentAnc)?.visitType;
        if (typeStr && form.type === "Unscheduled ANC Visit") {
          set("type", typeStr);
        }
      }
    }
  }, [form.date]);

  useEffect(() => {
    const contact = detectContact(form.type);
    if (contact) {
      const suggested = getTestsForContact(contact);
      setForm(prev => {
        const existingTests = [...prev.tests];
        const newTests = suggested.filter(s => !existingTests.some(e => e.test === s)).map(t => ({
          test: t,
          value: "",
          unit: getLabUnit(t),
          status: "pending"
        }));
        return { ...prev, tests: [...existingTests, ...newTests] };
      });
    }
  }, [form.type]);

  const handleTestChange = (index, value) => {
    setForm(prev => {
      const updatedTests = [...prev.tests];
      updatedTests[index].value = value;
      updatedTests[index].status = autoLabStatus(updatedTests[index].test, value);
      return { ...prev, tests: updatedTests };
    });
  };

  const heightCm = useMemo(() => {
    if (!form.heightFt && !form.heightIn) return null;
    const ft = parseFloat(form.heightFt) || 0;
    const inc = parseFloat(form.heightIn) || 0;
    return (ft * 30.48) + (inc * 2.54);
  }, [form.heightFt, form.heightIn]);

  const bmi = useMemo(() => {
    if (!form.weight || !heightCm || heightCm === 0) return null;
    return calcBMI(form.weight, heightCm);
  }, [form.weight, heightCm]);

  const bmiStatus = useMemo(() => {
    if (!bmi) return { cls: "bg-stone-50 border-stone-200 text-stone-500", label: "" };
    const val = parseFloat(bmi);
    if (val < 18.5) return { cls: "bg-rose-50 border-rose-200 text-rose-700 font-bold", label: "Low" };
    if (val > 24.9) return { cls: "bg-rose-50 border-rose-200 text-rose-700 font-bold", label: "High" };
    return { cls: "bg-emerald-50 border-emerald-200 text-emerald-700 font-bold", label: "" };
  }, [bmi]);

  const bpF = bpFlag(form.bp);
  const fhrF = fetalHRFlag(form.fetalHR);
  const pulseF = pulseFlag(form.pulse);
  const contact = detectContact(form.type);

  const bpFieldCls = `px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-shadow ${bpF === "severe" ? "bg-rose-50 border-rose-400 focus:ring-rose-500 font-bold text-rose-800" :
    bpF === "high" ? "bg-orange-50 border-orange-400 focus:ring-orange-500 font-semibold text-orange-800" :
      bpF === "low" ? "bg-amber-50 border-amber-400 focus:ring-amber-500 text-amber-800" :
        bpF === "normal" ? "bg-emerald-50 border-emerald-400 focus:ring-emerald-500 font-semibold text-emerald-800" :
          "bg-white border-stone-200 focus:ring-brand-600"
    }`;

  const fhrFieldCls = `px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-shadow ${fhrF === "bradycardia" || fhrF === "tachycardia" ? "bg-orange-50 border-orange-400 focus:ring-orange-500 font-semibold text-orange-800" :
    fhrF === "normal" ? "bg-emerald-50 border-emerald-400 focus:ring-emerald-500 font-semibold text-emerald-800"
      : "bg-white border-stone-200 focus:ring-brand-600"
    }`;

  const pulseFieldCls = `px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-shadow ${pulseF === "high" || pulseF === "low" ? "bg-orange-50 border-orange-400 focus:ring-orange-500 font-semibold text-orange-800" :
    pulseF === "normal" ? "bg-emerald-50 border-emerald-400 focus:ring-emerald-500 font-semibold text-emerald-800" :
      "bg-white border-stone-200 focus:ring-brand-600"
    }`;

  function handleSubmit() {
    if (!form.findings.trim()) return;

    if (isEdit) {
      dispatch({
        type: "UPDATE_VISIT",
        patientId: patient.id,
        visitId: initialVisit.id,
        payload: { ...form, bmi, height: heightCm, bpFlag: bpF, fhrFlag: fhrF, pulseFlag: pulseF, gbvRisk: form.gbvRisk },
      });
    } else {
      dispatch({
        type: "ADD_VISIT",
        patientId: patient.id,
        payload: { ...form, bmi, height: heightCm, id: uid(), ancContact: contact, bpFlag: bpF, fhrFlag: fhrF, pulseFlag: pulseF, gbvRisk: form.gbvRisk },
      });
    }
    
    form.tests.forEach(testObj => {
      if (testObj.value.trim() !== "") {
        dispatch({
          type: "ADD_LAB",
          patientId: patient.id,
          payload: { ...testObj, id: uid(), date: form.date }
        });
      }
    });

    onClose();
  }

  return (
    <Modal title={isEdit ? "Edit ANC Visit" : "Record ANC Visit"} subtitle={`${patient.name} · ${patient.id}`} onClose={onClose} size="xl">
      <div className="space-y-6">

        {/* Date + Visit type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput label="Date *" type="date" value={form.date} onChange={e => set("date", e.target.value)} />
          <FormSelect label="Visit Type *" value={form.type} onChange={e => set("type", e.target.value)}>
            {VISIT_TYPES.map(t => <option key={t}>{t}</option>)}
          </FormSelect>
        </div>

        {/* Presenting Complaints & ROS */}
        <div>
          <SectionLabel>Presenting Complaints</SectionLabel>
          <FormTextarea
            label="Presenting Complaints"
            value={form.presentingComplaints}
            onChange={e => set("presentingComplaints", e.target.value)}
            placeholder="Current symptoms..."
            rows={2}
          />
          <div className="mt-3">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">Review of Systems</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                ["pvBleeding", "PV Bleeding"], ["pvDischarge", "PV Discharge"], ["pelvicPain", "Pelvic Pain"],
                ["fetalMovements", "Reduced Fetal Movements"], ["contractions", "Contractions"],
                ["headache", "Headache"], ["visualDisturbance", "Visual Disturbance"],
                ["epigastricPain", "Epigastric Pain"], ["oedemaROS", "Oedema"],
              ].map(([key, label]) => (
                <label key={key} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs font-semibold transition-colors ${form.reviewOfSystems[key] ? "bg-rose-50 border-rose-400 text-rose-800" : "bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-300"
                  }`}>
                  <input type="checkbox" checked={!!form.reviewOfSystems[key]}
                    onChange={e => setForm(p => ({ ...p, reviewOfSystems: { ...p.reviewOfSystems, [key]: e.target.checked } }))}
                    className="w-3.5 h-3.5 accent-rose-600" />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Contact banner */}
        {contact && (
          <div className="bg-brand-50 border border-brand-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="text-2xl font-bold text-brand-700" style={{ fontFamily: "var(--font-display)" }}>{contact}</span>
            <div>
              <p className="text-xs font-bold text-brand-800 uppercase tracking-wide">
                {ANC_SCHEDULE[contact - 1].label} — {ANC_SCHEDULE[contact - 1].timing}
              </p>
            </div>
          </div>
        )}

        {/* Vitals */}
        <div>
          <SectionLabel>Vitals & Examination</SectionLabel>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">GA (auto)</label>
              <div className="px-3.5 py-2.5 text-sm bg-brand-50 border border-brand-200 rounded-xl text-brand-800 font-semibold min-h-10.5">
                {form.ga || "—"}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">BP (mmHg)</label>
              <input value={form.bp} onChange={e => set("bp", e.target.value)} placeholder="120/80" className={bpFieldCls} />
              {bpF && bpF !== "normal" && (
                <p className={`text-[10px] font-bold uppercase ${bpF === "severe" ? "text-rose-600" : bpF === "high" ? "text-orange-600" : "text-amber-600"
                  }`}>
                  ⚠ {bpF === "severe" ? "Severe High!" : bpF === "high" ? "High" : "Low"}
                </p>
              )}
              {bpF === "normal" && (
                <p className="text-[10px] font-bold uppercase text-emerald-600">✓ Normal</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Pulse (bpm)</label>
              <input type="number" value={form.pulse} onChange={e => set("pulse", e.target.value)} placeholder="80" className={pulseFieldCls} />
              {pulseF && pulseF !== "normal" && (
                <p className="text-[10px] font-bold uppercase text-orange-600">
                  ⚠ {pulseF === "low" ? "Low (<60)" : "High (>100)"}
                </p>
              )}
              {pulseF === "normal" && (
                <p className="text-[10px] font-bold uppercase text-emerald-600">✓ Normal</p>
              )}
            </div>

            <FormInput label="Weight (kg)" type="number" value={form.weight} onChange={e => set("weight", e.target.value)} placeholder="62" />

            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Height & BMI</label>
              <div className="flex items-center gap-2 w-full">
                <input type="number" placeholder="ft" value={form.heightFt} onChange={e => set("heightFt", e.target.value)} className="w-15 px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600 bg-white" />
                <input type="number" placeholder="in" value={form.heightIn} onChange={e => set("heightIn", e.target.value)} className="w-15 px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600 bg-white" />
                <div className={`flex-1 px-3 py-2.5 text-sm border rounded-xl text-center ${bmiStatus.cls}`}>
                  {bmi ? `${bmi} BMI${bmiStatus.label ? ` — ${bmiStatus.label}` : ""}` : "—"}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Fetal HR (bpm)</label>
              <input type="number" value={form.fetalHR} onChange={e => set("fetalHR", e.target.value)} placeholder="140" className={fhrFieldCls} />
              {fhrF && fhrF !== "normal" && (
                <p className="text-[10px] font-bold uppercase text-orange-600">
                  ⚠ {fhrF === "bradycardia" ? "Low (<110)" : "High (>160)"}
                </p>
              )}
              {fhrF === "normal" && (
                <p className="text-[10px] font-bold uppercase text-emerald-600">✓ Normal</p>
              )}
            </div>

            <FormInput label="Fundal Height (cm)" type="number" value={form.fundal} onChange={e => set("fundal", e.target.value)} placeholder="28" />

            <div className="flex flex-col gap-1.5">
              <FormSelect label="Oedema" value={form.oedema} onChange={e => set("oedema", e.target.value)}
                className={form.oedema === "None (-)" ? "bg-emerald-50 border-emerald-400 text-emerald-800 font-semibold" :
                  form.oedema ? "bg-orange-50 border-orange-400 text-orange-800 font-bold" : ""}>
                <option value="">Select</option>
                {OEDEMA_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </FormSelect>
              {form.oedema === "None (-)" && <p className="text-[10px] font-bold uppercase text-emerald-600">✓ Normal</p>}
              {form.oedema && form.oedema !== "None (-)" && <p className="text-[10px] font-bold uppercase text-orange-600">⚠ Abnormal</p>}
            </div>

            <div className="flex flex-col gap-1.5 col-span-2">
              <FormTextarea
                label="Examination Notes"
                value={form.examNotes}
                onChange={e => set("examNotes", e.target.value)}
                placeholder="General condition, abdomen, breast exam notes..."
                rows={2}
              />
            </div>
          </div>

          {/* Findings + Plan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormTextarea
              label="Key Findings *"
              value={form.findings}
              onChange={e => set("findings", e.target.value)}
              placeholder="BP 130/84, Hb 10.8, FHR 148 bpm"
              rows={4}
            />
            <FormTextarea
              label="Plan / Action"
              value={form.plan}
              onChange={e => set("plan", e.target.value)}
              placeholder="Continue iron + folic acid, repeat Hb in 4 weeks, next visit at 32 wks..."
              rows={4}
            />
          </div>

          {/* GBV Screening Section */}
          <div className="space-y-2 mt-4">
            <SectionLabel>Gender Based Voilence Screening</SectionLabel>
            <div className="mb-2">
              <label className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all ${form.gbvRisk
                ? "bg-rose-50 border-rose-300 ring-1 ring-rose-200"
                : "bg-stone-50 border-stone-200 hover:bg-stone-100"
                }`}>
                <input
                  type="checkbox"
                  checked={form.gbvRisk}
                  onChange={e => set("gbvRisk", e.target.checked)}
                  className="w-4 h-4 rounded accent-rose-600"
                />
                <div className="flex-1">
                  <p className={`text-xs font-bold ${form.gbvRisk ? "text-rose-800" : "text-stone-700"}`}>
                    Gender Based Violence
                  </p>
                </div>
                {form.gbvRisk && <span className="text-rose-500 text-sm animate-pulse">⚠</span>}
              </label>
            </div>
            <FormTextarea
              value={form.gbvScreening}
              onChange={e => set("gbvScreening", e.target.value)}
              placeholder="Screening results, concerns disclosed..."
              rows={2}
            />
          </div>

          {/* Tests Section */}
          {form.tests.length > 0 && (
            <div className="mt-6">
              <SectionLabel>Investigations / Tests</SectionLabel>
              <p className="text-[11px] text-stone-500 mb-3">Recommended Tests for this ANC visit. Enter values directly.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {form.tests.map((t, idx) => {
                  const bgCls = t.status === "abnormal" ? "bg-rose-50 border-rose-200" :
                    t.status === "moderate" ? "bg-amber-50 border-amber-200" :
                      t.status === "normal" ? "bg-emerald-50 border-emerald-200" :
                        "bg-stone-50 border-stone-200";
                  const labelCls = t.status === "abnormal" ? "text-rose-800" :
                    t.status === "moderate" ? "text-amber-800" :
                      t.status === "normal" ? "text-emerald-800" :
                        "text-stone-600";
                  const pillCls = t.status === "abnormal" ? "bg-rose-200 text-rose-800" :
                    t.status === "moderate" ? "bg-amber-200 text-amber-800" :
                      "bg-emerald-200 text-emerald-800";
                  const pillLabel = t.status === "abnormal" ? "⚠ High Risk" :
                    t.status === "moderate" ? "⚡ Moderate" :
                      t.status === "normal" ? "✓ Normal" : "";

                  return (
                    <div key={t.test} className={`p-3 border rounded-xl flex flex-col gap-2 ${bgCls}`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${labelCls}`}>{t.test}</span>
                        {t.status !== "pending" && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pillCls}`}>
                            {pillLabel}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-auto">
                        {(() => {
                          const options = getLabOptions(t.test);
                          if (options) {
                            return (
                              <select
                                value={t.value}
                                onChange={(e) => handleTestChange(idx, e.target.value)}
                                className="flex-1 w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 bg-white"
                              >
                                <option value="">Select...</option>
                                {options.map(o => <option key={o} value={o}>{o}</option>)}
                              </select>
                            );
                          }
                          const meta = getLabMeta(t.test);
                          let ph = "Result value...";
                          if (meta) {
                            if (meta.text) ph = "e.g. Normal, Negative";
                            else if (meta.low !== null && meta.high !== null) ph = `Normal: ${meta.low}–${meta.high}`;
                            else if (meta.low !== null) ph = `Normal: >${meta.low}`;
                            else if (meta.high !== null) ph = `Normal: <${meta.high}`;
                          }
                          return (
                            <input
                              type="text"
                              placeholder={ph}
                              value={t.value}
                              onChange={(e) => handleTestChange(idx, e.target.value)}
                              className="flex-1 w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 bg-white"
                            />
                          );
                        })()}
                        {t.unit && <span className="text-xs font-mono text-stone-500 shrink-0 w-12">{t.unit}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 mt-6">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button disabled={!form.findings.trim()} onClick={handleSubmit}>Save Visit</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}