import { useState } from "react";
import Button from "../ui/Button.jsx";
import FormInput from "../ui/FormInput.jsx";
import FormSelect from "../ui/FormSelect.jsx";
import { today, DELIVERY_TYPES } from "../../utils/helpers.js";
import Modal from "../ui/Modal.jsx";

const EMPTY_FORM = {
    deliveryDate: today(),
    deliveryTime: "",
    deliveryMode: "",
    durationOfLabor: "",
    maternalComplications: "None",
    episiotomy: "No",
    babySex: "Male",
    birthWeight: "",
    apgar1: "",
    apgar5: "",
    babyStatus: "Healthy & Stable",
    breastfeedingInitiated: "Yes",
    dischargeDate: "",
    followUpDate: "",
    familyPlanningCounseling: "Pending",
    signsExplained: "Yes",
    immunization: { bcg: false, opv: false, hepB: false }
};

/* ── Risk badge for delivery mode ─────────────────────────────────── */
function DeliveryRiskBadge({ deliveryMode }) {
    const dt = DELIVERY_TYPES.find(t => t.label === deliveryMode);
    if (!dt) return null;
    const config = {
        high: { bg: "bg-rose-600", border: "border-rose-700", text: "text-white", icon: "🔴", label: "HIGH RISK", desc: "Requires close monitoring and specialist care" },
        moderate: { bg: "bg-amber-500", border: "border-amber-600", text: "text-white", icon: "🟠", label: "MODERATE RISK", desc: "Monitor for complications" },
        low: { bg: "bg-emerald-500", border: "border-emerald-600", text: "text-white", icon: "🟢", label: "LOW RISK", desc: "Normal delivery pathway" },
    };
    const c = config[dt.risk];
    return (
        <div className={`${c.bg} ${c.text} rounded-2xl px-5 py-3.5 border-2 ${c.border} sm:col-span-2 flex items-center gap-4`}>
            <span className="text-2xl">{c.icon}</span>
            <div className="flex-1">
                <p className="text-sm font-bold uppercase tracking-wider">{c.label} — Delivery Mode</p>
                <p className="text-xs opacity-90 mt-0.5">{dt.label}</p>
                <p className="text-[10px] opacity-75 mt-0.5">{c.desc}</p>
            </div>
        </div>
    );
}

/* ── Complication flag ─────────────────────────────────────────────── */
function ComplicationFlag({ value, type }) {
    if (!value || value === "None" || value === "Healthy & Stable") return null;

    const isHigh = ["PPH (Postpartum Hemorrhage)", "Eclampsia", "Sepsis", "Retained Placenta", "Perineal Tear (3rd/4th Degree)"].includes(value)
        || ["Stillbirth", "Neonatal Death", "NICU admitted", "Referred", "Congenital Anomaly"].includes(value);

    const bg = isHigh ? "bg-rose-600" : "bg-amber-500";
    const icon = isHigh ? "⚠" : "⚡";

    return (
        <div className={`${bg} text-white rounded-xl px-4 py-2.5 flex items-center gap-3 sm:col-span-2`}>
            <span className="text-lg">{icon}</span>
            <div>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-90">{type}</p>
                <p className="text-sm font-bold">{value}</p>
            </div>
        </div>
    );
}

export default function RecordDeliveryModal({ open, onClose, onSave, patient }) {
    const [form, setForm] = useState(EMPTY_FORM);

    if (!open) return null;

    const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));
    const setImm = (key, val) => setForm((prev) => ({ ...prev, immunization: { ...prev.immunization, [key]: val } }));

    const isValid = form.deliveryDate && form.birthWeight && form.babyStatus;

    function handleSave() {
        if (!isValid) return;
        onSave(form);
    }

    return (
        <Modal
            title="Record Delivery"
            subtitle={patient ? `${patient.name} · ${patient.id}` : ""}
            onClose={onClose}
            size="lg"
        >
            <div className="space-y-8">
                {/* Maternal Details */}
                <div>
                    <h3 className="text-[10px] font-bold text-brand-600 uppercase tracking-wider mb-4 border-b border-brand-100 pb-2">
                        Delivery Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput label="Delivery Date*" type="date" value={form.deliveryDate} onChange={(e) => set("deliveryDate", e.target.value)} />
                        <FormInput label="Delivery Time" type="time" value={form.deliveryTime} onChange={(e) => set("deliveryTime", e.target.value)} />
                        <FormSelect
                            label="Mode of Delivery*"
                            value={form.deliveryMode}
                            onChange={(e) => set("deliveryMode", e.target.value)}
                        >
                            <option value="">Select Mode</option>
                            {DELIVERY_TYPES.map(t => (
                                <option key={t.label} value={t.label}>
                                    {t.label}
                                </option>
                            ))}
                        </FormSelect>
                        <FormInput label="Duration of Labor (hours)" type="text" placeholder="e.g. 8" value={form.durationOfLabor} onChange={(e) => set("durationOfLabor", e.target.value)} />

                        {/* BIG risk indicator for delivery mode */}
                        {form.deliveryMode && <DeliveryRiskBadge deliveryMode={form.deliveryMode} />}

                        <FormSelect
                            label="Maternal Complications"
                            value={form.maternalComplications}
                            onChange={(e) => set("maternalComplications", e.target.value)}
                            options={[
                                "None",
                                "PPH (Postpartum Hemorrhage)",
                                "Eclampsia",
                                "Retained Placenta",
                                "Perineal Tear (3rd/4th Degree)",
                                "Sepsis",
                                "Other"
                            ]}
                            className="sm:col-span-2"
                        />

                        {/* Maternal complication flag */}
                        <ComplicationFlag value={form.maternalComplications} type="Maternal Complication" />

                        <FormSelect
                            label="Episiotomy Performed?"
                            value={form.episiotomy}
                            onChange={(e) => set("episiotomy", e.target.value)}
                            options={["Yes", "No"]}
                        />
                    </div>
                </div>

                {/* Baby Details */}
                <div>
                    <h3 className="text-[10px] font-bold text-violet-600 uppercase tracking-wider mb-4 border-b border-violet-100 pb-2">
                        Baby Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormSelect label="Baby Sex*" value={form.babySex} onChange={(e) => set("babySex", e.target.value)} options={["Male", "Female"]} />
                        <FormInput label="Birth Weight (kg)*" type="number" step="0.1" placeholder="e.g. 3.2" value={form.birthWeight} onChange={(e) => set("birthWeight", e.target.value)} />
                        <FormInput label="APGAR Score (1 min)" type="number" max="10" placeholder="0-10" value={form.apgar1} onChange={(e) => set("apgar1", e.target.value)} />
                        <FormInput label="APGAR Score (5 mins)" type="number" max="10" placeholder="0-10" value={form.apgar5} onChange={(e) => set("apgar5", e.target.value)} />
                        <FormSelect label="Baby Status*" value={form.babyStatus} onChange={(e) => set("babyStatus", e.target.value)} options={["Healthy & Stable", "NICU admitted", "Referred", "Congenital Anomaly", "Stillbirth", "Neonatal Death"]} />

                        <FormSelect
                            label="Breastfeeding initiated?"
                            value={form.breastfeedingInitiated}
                            onChange={(e) => set("breastfeedingInitiated", e.target.value)}
                            options={["Yes", "No"]}
                        />

                        {/* Baby status flag */}
                        <ComplicationFlag value={form.babyStatus} type="Baby Status" />
                    </div>
                </div>

                {/* Postnatal and Discharge */}
                <div>
                    <h3 className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-4 border-b border-emerald-100 pb-2">
                        Discharge & Counseling
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput label="Discharge Date" type="date" value={form.dischargeDate} onChange={(e) => set("dischargeDate", e.target.value)} />
                        <FormInput label="Postnatal Follow-up Visit Date" type="date" value={form.followUpDate} onChange={(e) => set("followUpDate", e.target.value)} />
                        <FormSelect label="Family Planning Counseling" value={form.familyPlanningCounseling} onChange={(e) => set("familyPlanningCounseling", e.target.value)} options={["Pending", "Done"]} />

                        <FormSelect
                            label="Postnatal Danger Signs explained?"
                            value={form.signsExplained}
                            onChange={(e) => set("signsExplained", e.target.value)}
                            options={["Yes", "No"]}
                            className="sm:col-span-2"
                        />

                        <div className="sm:col-span-2 pt-2">
                            <p className="text-xs font-bold text-stone-700 mb-2">Baby Immunizations Given Before Discharge:</p>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={form.immunization.bcg} onChange={e => setImm("bcg", e.target.checked)} className="w-4 h-4 accent-emerald-600" />BCG</label>
                                <label className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={form.immunization.opv} onChange={e => setImm("opv", e.target.checked)} className="w-4 h-4 accent-emerald-600" />OPV</label>
                                <label className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={form.immunization.hepB} onChange={e => setImm("hepB", e.target.checked)} className="w-4 h-4 accent-emerald-600" />Hepatitis B</label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant={isValid ? "primary" : "ghost"}
                        disabled={!isValid}
                    >
                        Save Delivery Record
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
