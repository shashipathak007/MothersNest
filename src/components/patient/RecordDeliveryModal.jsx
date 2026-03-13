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

/* ── Risk-aware input border class helper ──────────────────────── */
function riskInputCls(risk) {
    if (!risk) return "bg-white border-stone-200 focus:ring-brand-600";
    if (risk.level === "high") return "bg-rose-50 border-rose-400 focus:ring-rose-500 font-semibold text-rose-800";
    if (risk.level === "moderate") return "bg-amber-50 border-amber-400 focus:ring-amber-500 font-semibold text-amber-800";
    return "bg-emerald-50 border-emerald-400 focus:ring-emerald-500 font-semibold text-emerald-800";
}

/* ── Subtle inline risk pill (small text label below input) ────── */
function InlineRiskPill({ risk }) {
    if (!risk) return null;
    if (risk.level === "normal") {
        return <p className="text-[10px] font-bold uppercase text-emerald-600">✓ Normal</p>;
    }
    if (risk.level === "moderate") {
        return <p className="text-[10px] font-bold uppercase text-amber-600">⚠ Moderate</p>;
    }
    return <p className="text-[10px] font-bold uppercase text-rose-600">⚠ High Risk</p>;
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



                {/* ── Delivery Details ─────────────────────────────── */}
                <div>
                    <h3 className="text-[10px] font-bold text-brand-600 uppercase tracking-wider mb-4 border-b border-brand-100 pb-2">
                        Delivery Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput label="Delivery Date*" type="date" value={form.deliveryDate} onChange={(e) => set("deliveryDate", e.target.value)} />
                        <FormInput label="Delivery Time" type="time" value={form.deliveryTime} onChange={(e) => set("deliveryTime", e.target.value)} />
                        <div className="flex flex-col gap-1.5">
                            <FormSelect
                                label="Mode of Delivery*"
                                value={form.deliveryMode}
                                onChange={(e) => set("deliveryMode", e.target.value)}
                                className={(() => {
                                    const dt = DELIVERY_TYPES.find(t => t.label === form.deliveryMode);
                                    if (!dt) return "";
                                    if (dt.risk === "high") return "[&_select]:bg-rose-50 [&_select]:border-rose-400 [&_select]:text-rose-800 [&_select]:font-semibold";
                                    if (dt.risk === "moderate") return "[&_select]:bg-amber-50 [&_select]:border-amber-400 [&_select]:text-amber-800 [&_select]:font-semibold";
                                    return "[&_select]:bg-emerald-50 [&_select]:border-emerald-400 [&_select]:text-emerald-800 [&_select]:font-semibold";
                                })()}
                            >
                                <option value="">Select Mode</option>
                                {DELIVERY_TYPES.map(t => (
                                    <option key={t.label} value={t.label}>
                                        {t.label}
                                    </option>
                                ))}
                            </FormSelect>
                            {(() => {
                                const dt = DELIVERY_TYPES.find(t => t.label === form.deliveryMode);
                                if (!dt) return null;
                                if (dt.risk === "low") return <p className="text-[10px] font-bold uppercase text-emerald-600">✓ Low Risk</p>;
                                if (dt.risk === "moderate") return <p className="text-[10px] font-bold uppercase text-amber-600">⚠ Moderate Risk</p>;
                                return <p className="text-[10px] font-bold uppercase text-rose-600">⚠ High Risk</p>;
                            })()}
                        </div>

                        {/* Gravida indicator */}
                        <div className="flex items-center gap-2 px-3 py-2 bg-brand-50 rounded-xl border border-brand-100">
                            <span className="text-xs">👶</span>
                            <p className="text-xs font-semibold text-brand-700">
                                {gravidaLabel} <span className="font-normal text-brand-500">(G{patient?.gravida || 1})</span>
                            </p>
                        </div>

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
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Stage 1 — Cervical Dilatation (hours)</label>
                            <input type="number" min="0" placeholder={isPrimigravida ? "e.g. 10" : "e.g. 6"} value={form.labourStage1} onChange={(e) => set("labourStage1", e.target.value)}
                                className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-shadow placeholder:text-stone-300 ${riskInputCls(stage1Risk)}`} />
                            {stage1Risk && stage1Risk.level !== "normal" && <InlineRiskPill risk={stage1Risk} />}
                            {stage1Risk && stage1Risk.level === "normal" && <InlineRiskPill risk={stage1Risk} />}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Stage 2 — Baby Delivery (min)</label>
                            <input type="number" min="0" placeholder={isPrimigravida ? "e.g. 60" : "e.g. 30"} value={form.labourStage2} onChange={(e) => set("labourStage2", e.target.value)}
                                className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-shadow placeholder:text-stone-300 ${riskInputCls(stage2Risk)}`} />
                            {stage2Risk && <InlineRiskPill risk={stage2Risk} />}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Stage 3 — Placenta Delivery (min)</label>
                            <input type="number" min="0" placeholder="e.g. 15" value={form.labourStage3} onChange={(e) => set("labourStage3", e.target.value)}
                                className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-shadow placeholder:text-stone-300 ${riskInputCls(stage3Risk)}`} />
                            {stage3Risk && <InlineRiskPill risk={stage3Risk} />}
                        </div>
                    </div>
                </div>

                {/* ── Baby Details ─────────────────────────────────── */}
                <div>
                    <h3 className="text-[10px] font-bold text-violet-600 uppercase tracking-wider mb-4 border-b border-violet-100 pb-2">
                        Baby Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormSelect label="Baby Sex*" value={form.babySex} onChange={(e) => set("babySex", e.target.value)} options={["Male", "Female"]} />

                        {/* Birth Weight with risk-colored border */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Birth Weight (kg)*</label>
                            <input type="number" step="0.1" placeholder="e.g. 3.2" value={form.birthWeight} onChange={(e) => set("birthWeight", e.target.value)}
                                className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-shadow placeholder:text-stone-300 ${riskInputCls(weightRisk)}`} />
                            {weightRisk && <InlineRiskPill risk={weightRisk} />}
                        </div>

                        {/* APGAR 1 min with risk-colored border */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">APGAR Score (1 min)</label>
                            <input type="number" min="0" max="10" placeholder="0-10" value={form.apgar1} onChange={(e) => set("apgar1", e.target.value)}
                                className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-shadow placeholder:text-stone-300 ${riskInputCls(apgar1Risk)}`} />
                            {apgar1Risk && <InlineRiskPill risk={apgar1Risk} />}
                        </div>

                        {/* APGAR 5 min with risk-colored border */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">APGAR Score (5 mins)</label>
                            <input type="number" min="0" max="10" placeholder="0-10" value={form.apgar5} onChange={(e) => set("apgar5", e.target.value)}
                                className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-shadow placeholder:text-stone-300 ${riskInputCls(apgar5Risk)}`} />
                            {apgar5Risk && <InlineRiskPill risk={apgar5Risk} />}
                        </div>

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

                        {/* APGAR at Discharge with risk-colored border */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">APGAR Score at Discharge</label>
                            <input type="number" min="0" max="10" placeholder="0-10" value={form.apgarDischarge} onChange={(e) => set("apgarDischarge", e.target.value)}
                                className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-shadow placeholder:text-stone-300 ${riskInputCls(apgarDischargeRisk)}`} />
                            {apgarDischargeRisk && <InlineRiskPill risk={apgarDischargeRisk} />}
                        </div>

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

                {/* ── Overall Auto-Assessed Risk Banner ──────────── */}
                {(() => {
                    // Collect ALL risk contributors
                    const riskItems = [];
                    const dt = DELIVERY_TYPES.find(t => t.label === form.deliveryMode);
                    if (dt && dt.risk !== "low") riskItems.push({ level: dt.risk === "high" ? "high" : "moderate", label: `Delivery Mode: ${dt.label}` });
                    if (weightRisk && weightRisk.level !== "normal") riskItems.push(weightRisk);
                    if (apgar1Risk && apgar1Risk.level !== "normal") riskItems.push(apgar1Risk);
                    if (apgar5Risk && apgar5Risk.level !== "normal") riskItems.push(apgar5Risk);
                    if (apgarDischargeRisk && apgarDischargeRisk.level !== "normal") riskItems.push(apgarDischargeRisk);
                    if (stage1Risk && stage1Risk.level !== "normal") riskItems.push(stage1Risk);
                    if (stage2Risk && stage2Risk.level !== "normal") riskItems.push(stage2Risk);
                    if (stage3Risk && stage3Risk.level !== "normal") riskItems.push(stage3Risk);
                    if (form.maternalComplications && form.maternalComplications !== "None") {
                        const isHighComp = ["PPH (Postpartum Hemorrhage)", "Eclampsia", "Sepsis", "Retained Placenta", "Perineal Tear (3rd/4th Degree)"].includes(form.maternalComplications);
                        riskItems.push({ level: isHighComp ? "high" : "moderate", label: form.maternalComplications });
                    }
                    if (form.babyStatus && !["Healthy & Stable"].includes(form.babyStatus)) {
                        const isHighBaby = ["Stillbirth", "Neonatal Death", "NICU admitted", "Referred", "Congenital Anomaly"].includes(form.babyStatus);
                        riskItems.push({ level: isHighBaby ? "high" : "moderate", label: `Baby: ${form.babyStatus}` });
                    }

                    const hasHigh = riskItems.some(r => r.level === "high");
                    const hasMod = riskItems.some(r => r.level === "moderate");
                    const overallLevel = hasHigh ? "high" : hasMod ? "moderate" : "low";

                    const config = {
                        high: { bg: "bg-rose-50", border: "border-rose-200", dot: "bg-rose-500", text: "text-rose-700", label: "HIGH RISK" },
                        moderate: { bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-400", text: "text-amber-700", label: "MODERATE RISK" },
                        low: { bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500", text: "text-emerald-700", label: "LOW RISK" },
                    };
                    const c = config[overallLevel];

                    // Build detail line
                    const detailParts = [];
                    if (dt) detailParts.push(dt.label);
                    if (hasHigh || hasMod) {
                        const topRisk = riskItems.find(r => r.level === (hasHigh ? "high" : "moderate"));
                        if (topRisk && topRisk.label !== dt?.label) detailParts.push(topRisk.label);
                    }
                    const detailLine = detailParts.join(" · ");
                    const adviceLine = hasHigh ? "Requires close monitoring and specialist care" : hasMod ? "Monitor for complications" : "Normal delivery pathway";

                    return (
                        <div className={`${c.bg} border ${c.border} rounded-xl px-4 py-3 flex items-center gap-3`}>
                            <span className={`w-3 h-3 rounded-full shrink-0 ${c.dot}`} />
                            <div className="flex-1">
                                <p className={`text-[11px] font-bold uppercase tracking-wider ${c.text}`}>
                                    AUTO-ASSESSED: {c.label}
                                </p>
                                {detailLine && <p className={`text-[10px] ${c.text} opacity-80 mt-0.5`}>{detailLine}</p>}
                                <p className={`text-[10px] ${c.text} opacity-60 mt-0.5`}>{adviceLine}</p>
                            </div>
                        </div>
                    );
                })()}

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
