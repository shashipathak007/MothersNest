import { useState, useMemo } from "react";
import Button from "../ui/Button.jsx";
import FormInput from "../ui/FormInput.jsx";
import FormSelect from "../ui/FormSelect.jsx";
import {
    today, DELIVERY_TYPES,
    birthWeightRisk, apgarRisk, labourDurationRisk,
} from "../../utils/helpers.js";
import Modal from "../ui/Modal.jsx";

const EMPTY_FORM = {
    deliveryDate: today(),
    deliveryTime: "",
    deliveryMode: "",
    // Labour duration split by stage (minutes)
    labourStage1: "",
    labourStage2: "",
    labourStage3: "",
    maternalComplications: "",
    episiotomy: "",
    babySex: "",
    birthWeight: "",
    apgar1: "",
    apgar5: "",
    apgarDischarge: "",
    babyStatus: "",
    breastfeedingInitiated: "",
    dischargeDate: "",
    followUpDate: "",
    familyPlanningCounseling: "",
    signsExplained: "",
    immunization: { bcg: false, opv: false, hepB: false }
};

/* ── Generic risk badge ─────────────────────────────────────────── */
const RISK_STYLES = {
    high:     { bg: "bg-rose-600",    border: "border-rose-700",    text: "text-white",  icon: "🔴", label: "HIGH RISK" },
    moderate: { bg: "bg-yellow-200",  border: "border-yellow-300",  text: "text-black",  icon: "🟡", label: "MODERATE RISK" },
    normal:   { bg: "bg-emerald-500", border: "border-emerald-600", text: "text-white",  icon: "🟢", label: "NORMAL" },
};

function RiskBadge({ risk, title, detail }) {
    if (!risk) return null;
    const c = RISK_STYLES[risk.level] || RISK_STYLES.normal;
    return (
        <div className={`${c.bg} ${c.text} rounded-2xl px-5 py-3 border-2 ${c.border} sm:col-span-2 flex items-center gap-4 transition-all duration-300`}>
            <span className="text-2xl">{c.icon}</span>
            <div className="flex-1">
                <p className="text-sm font-bold uppercase tracking-wider">{c.label} — {title}</p>
                <p className="text-xs opacity-90 mt-0.5">{risk.label}</p>
                {detail && <p className="text-[10px] opacity-75 mt-0.5">{detail}</p>}
            </div>
        </div>
    );
}

/* ── Risk badge for delivery mode ─────────────────────────────────── */
function DeliveryRiskBadge({ deliveryMode }) {
    const dt = DELIVERY_TYPES.find(t => t.label === deliveryMode);
    if (!dt) return null;
    const config = {
        high: { bg: "bg-rose-600", border: "border-rose-700", text: "text-white", icon: "🔴", label: "HIGH RISK", desc: "Requires close monitoring and specialist care" },
        moderate: { bg: "bg-yellow-200", border: "border-yellow-300", text: "text-black", icon: "🟡", label: "MODERATE RISK", desc: "Monitor for complications" },
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
    const icon = isHigh ? "⚠" : "⚠";

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

    // Determine primigravida vs multigravida from patient data
    // Consider only multigravida if she has given birth previously (para > 0)
    const isPrimigravida = (parseInt(patient?.para) || 0) === 0;
    const gravidaLabel = isPrimigravida ? "Primigravida" : "Multigravida";

    // Compute all risk flags live
    const weightRisk = birthWeightRisk(form.birthWeight);
    const apgar1Risk = apgarRisk(form.apgar1);
    const apgar5Risk = apgarRisk(form.apgar5);
    const apgarDischargeRisk = apgarRisk(form.apgarDischarge);
    const stage1Risk = labourDurationRisk(1, form.labourStage1, isPrimigravida);
    const stage2Risk = labourDurationRisk(2, form.labourStage2, isPrimigravida);
    const stage3Risk = labourDurationRisk(3, form.labourStage3, isPrimigravida);

    // Collect all non-normal risks for the summary banner
    const allRisks = [
        weightRisk, apgar1Risk, apgar5Risk, apgarDischargeRisk,
        stage1Risk, stage2Risk, stage3Risk,
    ].filter(r => r && r.level !== "normal");

    const hasAnyHighRisk = allRisks.some(r => r.level === "high");
    const hasAnyModRisk = allRisks.some(r => r.level === "moderate");

    // Build backward-compatible durationOfLabor string
    const buildDurationString = () => {
        const parts = [];
        if (form.labourStage1) parts.push(`Stage 1: ${form.labourStage1} hours`);
        if (form.labourStage2) parts.push(`Stage 2: ${form.labourStage2} min`);
        if (form.labourStage3) parts.push(`Stage 3: ${form.labourStage3} min`);
        return parts.join(", ") || "";
    };

    const isValid = form.deliveryDate && form.birthWeight && form.babyStatus;

    function handleSave() {
        if (!isValid) return;
        // Include computed risk flags in the saved data
        const payload = {
            ...form,
            durationOfLabor: buildDurationString(),
            // Attach risk assessments
            _risks: {
                birthWeight: weightRisk,
                apgar1: apgar1Risk,
                apgar5: apgar5Risk,
                apgarDischarge: apgarDischargeRisk,
                labourStage1: stage1Risk,
                labourStage2: stage2Risk,
                labourStage3: stage3Risk,
                isPrimigravida,
            },
        };
        onSave(payload);
    }

    return (
        <Modal
            title="Record Delivery"
            subtitle={patient ? `${patient.name} · ${patient.id}` : ""}
            onClose={onClose}
            size="lg"
        >
            <div className="space-y-8">

                {/* ── Overall risk summary banner ──────────────────── */}
                {(hasAnyHighRisk || hasAnyModRisk) && (
                    <div className={`${hasAnyHighRisk ? "bg-rose-50 border-rose-200" : "bg-yellow-50 border-yellow-200"} border-2 rounded-2xl p-4`}>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{hasAnyHighRisk ? "🔴" : "🟡"}</span>
                            <p className={`text-xs font-bold uppercase tracking-wider ${hasAnyHighRisk ? "text-rose-700" : "text-yellow-800"}`}>
                                {allRisks.length} Risk Flag{allRisks.length > 1 ? "s" : ""} Detected
                                <span className="font-normal ml-1 opacity-80">({gravidaLabel})</span>
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {allRisks.map((r, i) => (
                                <span key={i} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    r.level === "high" ? "bg-rose-200 text-rose-800" : "bg-yellow-200 text-yellow-800"
                                }`}>
                                    {r.level === "high" ? "🔴" : "🟡"} {r.label}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Delivery Details ─────────────────────────────── */}
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

                        {/* Gravida indicator */}
                        <div className="flex items-center gap-2 px-3 py-2 bg-brand-50 rounded-xl border border-brand-100">
                            <span className="text-xs">👶</span>
                            <p className="text-xs font-semibold text-brand-700">
                                {gravidaLabel} <span className="font-normal text-brand-500">(G{patient?.gravida || 1})</span>
                            </p>
                        </div>

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

                {/* ── Duration of Labour (by Stage) ───────────────── */}
                <div>
                    <h3 className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-4 border-b border-indigo-100 pb-2">
                        Duration of Labour — By Stage
                        <span className="ml-2 font-normal text-indigo-400">({gravidaLabel})</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                        <FormInput
                            label="Stage 1 — Cervical Dilatation (hours)"
                            type="number"
                            min="0"
                            placeholder={isPrimigravida ? "e.g. 10" : "e.g. 6"}
                            value={form.labourStage1}
                            onChange={(e) => set("labourStage1", e.target.value)}
                        />
                        <FormInput
                            label="Stage 2 — Baby Delivery (min)"
                            type="number"
                            min="0"
                            placeholder={isPrimigravida ? "e.g. 60" : "e.g. 30"}
                            value={form.labourStage2}
                            onChange={(e) => set("labourStage2", e.target.value)}
                        />
                        <FormInput
                            label="Stage 3 — Placenta Delivery (min)"
                            type="number"
                            min="0"
                            placeholder="e.g. 15"
                            value={form.labourStage3}
                            onChange={(e) => set("labourStage3", e.target.value)}
                        />
                    </div>

                    {/* Labour duration risk badges */}
                    <div className="space-y-2">
                        {stage1Risk && <RiskBadge risk={stage1Risk} title="Labour Stage 1" detail={isPrimigravida ? "Normal: 8–12h · Moderate: 12–20h · High: >20h" : "Normal: 5–8h · Moderate: 8–14h · High: >14h"} />}
                        {stage2Risk && <RiskBadge risk={stage2Risk} title="Labour Stage 2" detail={isPrimigravida ? "Normal: 30min–2h · Moderate: 2–3h · High: >3h" : "Normal: 5–60min · Moderate: 1–2h · High: >2h"} />}
                        {stage3Risk && <RiskBadge risk={stage3Risk} title="Labour Stage 3" detail="Normal: 5–30min · Moderate: 30–60min · High: >60min" />}
                    </div>
                </div>

                {/* ── Baby Details ─────────────────────────────────── */}
                <div>
                    <h3 className="text-[10px] font-bold text-violet-600 uppercase tracking-wider mb-4 border-b border-violet-100 pb-2">
                        Baby Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormSelect label="Baby Sex*" value={form.babySex} onChange={(e) => set("babySex", e.target.value)} options={["Male", "Female"]} />
                        <FormInput label="Birth Weight (kg)*" type="number" step="0.1" placeholder="e.g. 3.2" value={form.birthWeight} onChange={(e) => set("birthWeight", e.target.value)} />

                        {/* Birth weight risk badge */}
                        {weightRisk && <RiskBadge risk={weightRisk} title="Birth Weight" />}

                        <FormInput label="APGAR Score (1 min)" type="number" min="0" max="10" placeholder="0-10" value={form.apgar1} onChange={(e) => set("apgar1", e.target.value)} />
                        <FormInput label="APGAR Score (5 mins)" type="number" min="0" max="10" placeholder="0-10" value={form.apgar5} onChange={(e) => set("apgar5", e.target.value)} />

                        {/* APGAR 1 min risk */}
                        {apgar1Risk && <RiskBadge risk={apgar1Risk} title="APGAR (1 min)" detail="0–3: High · 4–6: Moderate · 7–10: Normal" />}
                        {/* APGAR 5 min risk */}
                        {apgar5Risk && <RiskBadge risk={apgar5Risk} title="APGAR (5 min)" detail="0–3: High · 4–6: Moderate · 7–10: Normal" />}

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

                {/* ── Postnatal and Discharge ─────────────────────── */}
                <div>
                    <h3 className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-4 border-b border-emerald-100 pb-2">
                        Discharge & Counseling
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput label="Discharge Date" type="date" value={form.dischargeDate} onChange={(e) => set("dischargeDate", e.target.value)} />

                        {/* APGAR at Discharge */}
                        <FormInput
                            label="APGAR Score at Discharge"
                            type="number"
                            min="0"
                            max="10"
                            placeholder="0-10"
                            value={form.apgarDischarge}
                            onChange={(e) => set("apgarDischarge", e.target.value)}
                        />

                        {/* APGAR Discharge risk */}
                        {apgarDischargeRisk && <RiskBadge risk={apgarDischargeRisk} title="APGAR at Discharge" detail="0–3: High · 4–6: Moderate · 7–10: Normal" />}

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
