import { useState, useEffect } from "react";
import { useApp } from "../../hooks/useApp.js";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import FormInput from "../ui/FormInput.jsx";
import FormSelect from "../ui/FormSelect.jsx";
import {
  today, uid, getCurrentANCContact, ANC_VISIT_TESTS,
  LAB_TESTS, LAB_CATEGORIES, getLabUnit, autoLabStatus,
} from "../../utils/helpers.js";

export default function AddLabModal({ patient, onClose }) {
  const { dispatch } = useApp();
  const currentContact = getCurrentANCContact(patient.lmp);
  const suggestedTests = currentContact ? (ANC_VISIT_TESTS[currentContact] || []) : [];

  const [form, setForm] = useState({ test: "", date: today(), value: "", unit: "", status: "pending" });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Auto-fill unit and auto-status when test is selected
  useEffect(() => {
    if (form.test) {
      const unit = getLabUnit(form.test);
      if (unit) set("unit", unit);
    }
  }, [form.test]);

  // Auto-determine status when value changes
  useEffect(() => {
    if (form.test && form.value) {
      set("status", autoLabStatus(form.test, form.value));
    }
  }, [form.value, form.test]);

  function handleSubmit() {
    if (!form.test.trim()) return;
    // Allow pending labs with no value
    const payload = {
      ...form,
      id: uid(),
      status: form.value.trim() ? form.status : "pending",
      value: form.value.trim() || "",
    };
    dispatch({ type: "ADD_LAB", patientId: patient.id, payload });
    onClose();
  }

  return (
    <Modal title="Add Lab Result" subtitle={`${patient.name} · ${patient.id}`} onClose={onClose} size="md">
      <div className="space-y-4">
        {/* Suggested tests quick-select */}
        {suggestedTests.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-brand-700 uppercase tracking-wider mb-2">
              Suggested for ANC Visit {currentContact}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {suggestedTests.map(t => {
                const alreadyDone = patient.labs.some(l => l.test === t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { set("test", t); set("unit", getLabUnit(t)); }}
                    disabled={alreadyDone}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${form.test === t
                        ? "bg-brand-600 text-white"
                        : alreadyDone
                          ? "bg-emerald-100 text-emerald-600 cursor-not-allowed line-through"
                          : "bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200"
                      }`}
                  >
                    {alreadyDone ? "✓ " : ""}{t}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Test selection from full catalogue */}
        <FormSelect label="Test Name *" value={form.test} onChange={e => set("test", e.target.value)}>
          <option value="">Select a test...</option>
          {LAB_CATEGORIES.map(cat => (
            <optgroup key={cat} label={cat}>
              {LAB_TESTS.filter(t => t.category === cat).map(t => (
                <option key={t.name} value={t.name}>{t.name}</option>
              ))}
            </optgroup>
          ))}
        </FormSelect>

        <div className="grid grid-cols-2 gap-3">
          <FormInput label="Date" type="date" value={form.date} onChange={e => set("date", e.target.value)} />
          <FormSelect label="Status" value={form.status} onChange={e => set("status", e.target.value)}>
            <option value="pending">Pending</option>
            <option value="normal">Normal</option>
            <option value="abnormal">Abnormal</option>
          </FormSelect>
          <FormInput label="Value" value={form.value} onChange={e => set("value", e.target.value)} placeholder="e.g. 10.4 or Non-reactive" />
          <FormInput label="Unit" value={form.unit} onChange={e => set("unit", e.target.value)} placeholder="e.g. g/dL" />
        </div>

        {/* Auto-status indicator */}
        {form.test && form.value && (
          <div className={`rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-semibold ${form.status === "abnormal" ? "bg-rose-50 text-rose-700 border border-rose-200"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}>
            <span>{form.status === "abnormal" ? "⚠" : "✓"}</span>
            <span>Auto-detected: {form.status === "abnormal" ? "Abnormal" : "Normal"}</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button disabled={!form.test.trim()} onClick={handleSubmit}>Save Result</Button>
        </div>
      </div>
    </Modal>
  );
}
