import { useEffect } from "react";
import FormInput from "../ui/FormInput.jsx";
import SectionLabel from "../ui/SectionLabel.jsx";
import Card from "../ui/Card.jsx";
import { calcEDD, calcGA } from "../../utils/helpers.js";

export default function RegPregnancy({ form, set, patientMode }) {
  // Auto-calculate EDD and GA when LMP changes
  useEffect(() => {
    if (form.lmp) {
      set("edd", calcEDD(form.lmp));
      set("ga", calcGA(form.lmp));
    }
  }, [form.lmp]);


  return (
    <div className="space-y-6">
      <Card className="p-5">
        <SectionLabel>Current Pregnancy</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <FormInput label="Gravida *" type="number" min={1} value={form.gravida} onChange={e => set("gravida", e.target.value)} />
          <FormInput label="Para" type="number" min={0} value={form.para} onChange={e => set("para", e.target.value)} />
          <FormInput
            label="Last Menstrual Period*"
            type="date"
            value={form.lmp}
            onChange={e => set("lmp", e.target.value)}
            className="col-span-2 sm:col-span-1"
          />
          <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">EDD</label>
            <div className="px-3.5 py-2.5 text-sm bg-blue-50 border border-blue-200 rounded-xl text-blue-800 font-semibold">
              {form.edd || "—"}
            </div>
          </div>
        </div>
        {form.ga && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[11px] text-stone-400 font-medium">Current Gestational Age:</span>
            <span className="text-sm font-bold text-brand-700 bg-brand-50 px-3 py-1 rounded-full">{form.ga} weeks</span>
          </div>
        )}
      </Card>

      {/* Info note */}
      {patientMode !== 'returning' && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-blue-500 text-lg mt-0.5">ℹ</span>
          <div>
            <p className="text-sm font-semibold text-blue-800">Detailed History Will Be Taken at First Visit by the Clinician</p>
            <p className="text-xs text-blue-600 mt-0.5">
              Comprehensive obstetric, medical, surgical history and screenings will be recorded during the patient's first visit by the clinician.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
