import FormInput from "../ui/FormInput.jsx";
import FormSelect from "../ui/FormSelect.jsx";
import SectionLabel from "../ui/SectionLabel.jsx";
import Card from "../ui/Card.jsx";
import {
  BLOOD_GROUPS, EDUCATION_LEVELS, OCCUPATIONS,
  RELIGIONS, ETHNICITIES, BASIC_MEDICAL_FLAGS,
} from "../../utils/helpers.js";

export default function RegPersonal({ form, set, setPartner, setMedFlag }) {
  const p = form.partner;

  return (
    <div className="space-y-6">
      {/* ─── Patient details ─── */}
      <Card className="p-5">
        <SectionLabel>Patient Details</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormInput
            label="Full Name *"
            value={form.name}
            onChange={e => set("name", e.target.value)}
            placeholder="Patient's full name"
            className="sm:col-span-2 lg:col-span-2"
            autoFocus
          />
          <FormInput
            label="Age (years) *"
            type="number" min={12} max={60}
            value={form.age}
            onChange={e => set("age", e.target.value)}
            placeholder="28"
          />
          <FormInput
            label="Phone Number *"
            value={form.phone}
            onChange={e => set("phone", e.target.value)}
            placeholder="9876543210"
          />
          <FormSelect label="Blood Group" value={form.bloodGroup} onChange={e => set("bloodGroup", e.target.value)}>
            <option value="">Select</option>
            {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
          </FormSelect>
          <FormSelect label="Religion" value={form.religion} onChange={e => set("religion", e.target.value)}>
            <option value="">Select</option>
            {RELIGIONS.map(r => <option key={r}>{r}</option>)}
          </FormSelect>
          <FormSelect label="Ethnicity / Caste" value={form.ethnicity} onChange={e => set("ethnicity", e.target.value)}>
            <option value="">Select</option>
            {ETHNICITIES.map(e => <option key={e}>{e}</option>)}
          </FormSelect>
          <FormSelect label="Education" value={form.education} onChange={e => set("education", e.target.value)}>
            <option value="">Select</option>
            {EDUCATION_LEVELS.map(l => <option key={l}>{l}</option>)}
          </FormSelect>
          <FormSelect label="Occupation" value={form.occupation} onChange={e => set("occupation", e.target.value)}>
            <option value="">Select</option>
            {OCCUPATIONS.map(o => <option key={o}>{o}</option>)}
          </FormSelect>
          <FormInput
            label="Address"
            value={form.address}
            onChange={e => set("address", e.target.value)}
            placeholder="Full address"
            className="sm:col-span-2 lg:col-span-3"
          />
        </div>
      </Card>

      {/* ─── Anthropometrics ─── */}
      <Card className="p-5">
        <SectionLabel>Physical Measurements</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <FormInput
            label="Weight (kg)"
            type="number" min={20} max={200} step="0.1"
            value={form.weight}
            onChange={e => set("weight", e.target.value)}
            placeholder="58"
          />
          <FormInput
            label="Height (cm)"
            type="number" min={100} max={220}
            value={form.height}
            onChange={e => set("height", e.target.value)}
            placeholder="155"
          />
          {form.weight && form.height && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">BMI</label>
              <div className="px-3.5 py-2.5 text-sm bg-blue-50 border border-blue-200 rounded-xl text-blue-800 font-semibold">
                {(parseFloat(form.weight) / ((parseFloat(form.height) / 100) ** 2)).toFixed(1)}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* ─── Basic medical history ─── */}
      <Card className="p-5">
        <SectionLabel>Basic Medical History</SectionLabel>
        <p className="text-xs text-stone-400 mb-4">Select any pre-existing conditions.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {BASIC_MEDICAL_FLAGS.map(flag => {
            const checked = !!form.basicMedical[flag.key];
            return (
              <label
                key={flag.key}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${checked
                    ? "bg-rose-50 border-rose-400"
                    : "bg-stone-50 border-stone-200 hover:border-stone-300"
                  }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={e => setMedFlag(flag.key, e.target.checked)}
                  className="w-4 h-4 accent-rose-600 shrink-0"
                />
                <span className={`text-xs font-semibold ${checked ? "text-rose-800" : "text-stone-700"}`}>
                  {flag.label}
                </span>
              </label>
            );
          })}
        </div>
        <FormInput
          label="Known Allergies"
          value={form.allergies}
          onChange={e => set("allergies", e.target.value)}
          placeholder="Penicillin, NSAIDs (comma-separated)"
        />
      </Card>

      {/* ─── Partner details (optional) ─── */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <SectionLabel>Partner / Husband Details</SectionLabel>
          <span className="text-[11px] text-stone-400 bg-stone-100 px-2 py-1 rounded-lg font-medium">Optional</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormInput
            label="Partner's Name"
            value={p.name}
            onChange={e => setPartner("name", e.target.value)}
            placeholder="Full name"
            className="sm:col-span-2"
          />
          <FormInput
            label="Partner's Age"
            type="number"
            value={p.age}
            onChange={e => setPartner("age", e.target.value)}
            placeholder="32"
          />
          <FormInput
            label="Partner's Phone"
            value={p.phone}
            onChange={e => setPartner("phone", e.target.value)}
            placeholder="9876500000"
          />
          <FormSelect label="Partner's Education" value={p.education} onChange={e => setPartner("education", e.target.value)}>
            <option value="">Select</option>
            {EDUCATION_LEVELS.map(l => <option key={l}>{l}</option>)}
          </FormSelect>
          <FormSelect label="Partner's Occupation" value={p.occupation} onChange={e => setPartner("occupation", e.target.value)}>
            <option value="">Select</option>
            {OCCUPATIONS.map(o => <option key={o}>{o}</option>)}
          </FormSelect>
        </div>
      </Card>
    </div>
  );
}
