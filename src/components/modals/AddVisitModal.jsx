import { useState, useEffect } from "react";
import { useApp } from "../../hooks/useApp.js";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import FormInput from "../ui/FormInput.jsx";
import FormSelect from "../ui/FormSelect.jsx";
import FormTextarea from "../ui/FormTextarea.jsx";
import SectionLabel from "../ui/SectionLabel.jsx";
import { today, uid, calcGA, VISIT_TYPES, bpFlag, fetalHRFlag, ANC_SCHEDULE } from "../../utils/helpers.js";

const OEDEMA_OPTIONS       = ["None (−)", "Mild (+)", "Moderate (++)", "Severe (+++)"];
const PRESENTATION_OPTIONS = ["Cephalic", "Breech", "Transverse", "Not assessed"];

function detectContact(visitType) {
  return ANC_SCHEDULE.find(c => c.visitType === visitType)?.contact ?? null;
}

export default function AddVisitModal({ patient, onClose }) {
  const { dispatch } = useApp();
  const [form, setForm] = useState({
    date: today(), type: "Unscheduled ANC Visit",
    ga: calcGA(patient.lmp) || "",
    bp: "", pulse: "", weight: "", height: "",
    fetalHR: "", fundal: "", oedema: "", presentation: "",
    findings: "", plan: "", examNotes: "",
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    if (patient.lmp) set("ga", calcGA(patient.lmp));
  }, [form.date]);

  const bpF  = bpFlag(form.bp);
  const fhrF = fetalHRFlag(form.fetalHR);
  const contact = detectContact(form.type);

  const bpFieldCls = `px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-shadow ${
    bpF === "severe" ? "bg-rose-50 border-rose-400 focus:ring-rose-500 font-bold text-rose-800" :
    bpF === "high"   ? "bg-orange-50 border-orange-400 focus:ring-orange-500 font-semibold text-orange-800" :
    bpF === "low"    ? "bg-amber-50 border-amber-400 focus:ring-amber-500 text-amber-800" :
                       "bg-white border-stone-200 focus:ring-brand-600"
  }`;

  const fhrFieldCls = `px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-shadow ${
    fhrF ? "bg-orange-50 border-orange-400 focus:ring-orange-500 font-semibold text-orange-800"
         : "bg-white border-stone-200 focus:ring-brand-600"
  }`;

  function handleSubmit() {
    if (!form.findings.trim()) return;
    dispatch({
      type: "ADD_VISIT",
      patientId: patient.id,
      payload: { ...form, id: uid(), ancContact: contact, bpFlag: bpF, fhrFlag: fhrF },
    });
    onClose();
  }

  return (
    <Modal title="Record ANC Visit" subtitle={`${patient.name} · ${patient.id}`} onClose={onClose} size="xl">
      <div className="space-y-6">

        {/* Date + Visit type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput label="Date *" type="date" value={form.date} onChange={e => set("date", e.target.value)} />
          <FormSelect label="Visit Type *" value={form.type} onChange={e => set("type", e.target.value)}>
            {VISIT_TYPES.map(t => <option key={t}>{t}</option>)}
          </FormSelect>
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

            {/* GA auto */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">GA (auto)</label>
              <div className="px-3.5 py-2.5 text-sm bg-brand-50 border border-brand-200 rounded-xl text-brand-800 font-semibold min-h-[42px]">
                {form.ga || "—"}
              </div>
            </div>

            {/* BP */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">BP (mmHg)</label>
              <input value={form.bp} onChange={e => set("bp", e.target.value)} placeholder="120/80" className={bpFieldCls} />
              {bpF && (
                <p className={`text-[10px] font-bold uppercase ${
                  bpF === "severe" ? "text-rose-600" : bpF === "high" ? "text-orange-600" : "text-amber-600"
                }`}>
                  ⚠ {bpF === "severe" ? "Severe HTN!" : bpF === "high" ? "Hypertension" : "Hypotension"}
                </p>
              )}
            </div>

            <FormInput label="Pulse (bpm)"    type="number" value={form.pulse}  onChange={e => set("pulse", e.target.value)}  placeholder="80" />
            <FormInput label="Weight (kg)"    type="number" value={form.weight} onChange={e => set("weight", e.target.value)} placeholder="62" />
            <FormInput label="Height (cm)"    type="number" value={form.height} onChange={e => set("height", e.target.value)} placeholder="158" />

            {/* Fetal HR */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Fetal HR (bpm)</label>
              <input type="number" value={form.fetalHR} onChange={e => set("fetalHR", e.target.value)} placeholder="140" className={fhrFieldCls} />
              {fhrF && (
                <p className="text-[10px] font-bold uppercase text-orange-600">
                  ⚠ {fhrF === "bradycardia" ? "Bradycardia (<110)" : "Tachycardia (>160)"}
                </p>
              )}
            </div>

            <FormInput label="Fundal Height (cm)" type="number" value={form.fundal} onChange={e => set("fundal", e.target.value)} placeholder="28" />

            <FormSelect label="Oedema" value={form.oedema} onChange={e => set("oedema", e.target.value)}>
              <option value="">Select</option>
              {OEDEMA_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </FormSelect>

            <FormSelect label="Presentation" value={form.presentation} onChange={e => set("presentation", e.target.value)}>
              <option value="">Select</option>
              {PRESENTATION_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </FormSelect>
          </div>

          <FormTextarea
            label="Examination Notes"
            value={form.examNotes}
            onChange={e => set("examNotes", e.target.value)}
            placeholder="General condition, abdomen, breast exam notes..."
            rows={2}
          />
        </div>

        {/* Findings + Plan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormTextarea
            label="Key Findings *"
            value={form.findings}
            onChange={e => set("findings", e.target.value)}
            placeholder="BP 130/84, Hb 10.8, FHR 148 bpm, fundal ht 28 cm..."
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

        <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button disabled={!form.findings.trim()} onClick={handleSubmit}>Save Visit</Button>
        </div>
      </div>
    </Modal>
  );
}
