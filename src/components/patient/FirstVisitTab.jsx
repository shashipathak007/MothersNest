import { useState } from "react";
import { useApp } from "../../hooks/useApp.js";
import Card from "../ui/Card.jsx";
import SectionLabel from "../ui/SectionLabel.jsx";
import FormInput from "../ui/FormInput.jsx";
import FormTextarea from "../ui/FormTextarea.jsx";
import FormSelect from "../ui/FormSelect.jsx";
import Button from "../ui/Button.jsx";
import KVRow from "../ui/KVRow.jsx";
import { today, calcBMI, autoRiskFromFirstVisit, RISK_CONFIG, CONTRACEPTIVE_METHODS } from "../../utils/helpers.js";

/* ─── Collapsible section wrapper ─────────────────────────────────── */
function Section({ title, icon, children, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <Card className="overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <span className="text-base">{icon}</span>
                    <p className="text-sm font-semibold text-stone-800">{title}</p>
                </div>
                <span className={`text-stone-400 transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
            </button>
            {open && <div className="px-4 pb-5 border-t border-stone-100 pt-4">{children}</div>}
        </Card>
    );
}

/* ─── Bool toggle row ─────────────────────────────────────────────── */
function BoolToggle({ label, value, onChange }) {
    return (
        <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${value ? "bg-rose-50 border-rose-400" : "bg-stone-50 border-stone-200 hover:border-stone-300"
            }`}>
            <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} className="w-4 h-4 accent-rose-600 shrink-0" />
            <span className={`text-xs font-semibold ${value ? "text-rose-800" : "text-stone-700"}`}>{label}</span>
        </label>
    );
}

/* ─── Read-only view of completed first visit ─────────────────────── */
function FirstVisitReadView({ fv }) {
    const risk = fv.autoRisk || "low";
    const rc = RISK_CONFIG[risk];

    return (
        <div className="space-y-4">
            {/* Risk banner */}
            {risk !== "low" && (
                <div className={`rounded-2xl px-4 py-3.5 ${risk === "high" ? "bg-rose-600 text-white" : "bg-amber-500 text-white"}`}>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">⚠</span>
                        <p className="text-xs font-bold uppercase tracking-wider">{rc.label} — From Maternal Health Evaluation</p>
                    </div>
                </div>
            )}

            {/* Summary */}
            {fv.summary && (
                <Card className="p-4 bg-brand-50 border border-brand-200">
                    <SectionLabel>Summary</SectionLabel>
                    <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">{fv.summary}</p>
                    <p className="text-[10px] text-stone-400 mt-2">Completed on {fv.completedOn}</p>
                </Card>
            )}

            {/* Presenting Complaints (legacy, show if exists) */}
            {fv.presentingComplaints && (
                <Card className="p-4">
                    <SectionLabel>Presenting Complaints (from initial evaluation)</SectionLabel>
                    <p className="text-sm text-stone-700 leading-relaxed">{fv.presentingComplaints}</p>
                    {fv.historyOfComplaints && (
                        <div className="mt-3">
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">History of Presenting Complaints</p>
                            <p className="text-sm text-stone-700 leading-relaxed">{fv.historyOfComplaints}</p>
                        </div>
                    )}
                </Card>
            )}

            {/* Review of Systems */}
            {fv.reviewOfSystems && (
                <Card className="p-4">
                    <SectionLabel>Review of Systems</SectionLabel>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(fv.reviewOfSystems).map(([key, val]) => (
                            <span key={key} className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${val ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                                {key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())} — {val ? "Yes" : "No"}
                            </span>
                        ))}
                    </div>
                </Card>
            )}

            {/* Menstrual History */}
            {fv.menstrualHistory && (
                <Card className="p-4">
                    <SectionLabel>Menstrual History</SectionLabel>
                    <KVRow label="LMP" value={fv.menstrualHistory.lmp} />
                    <KVRow label="Cycle Nature" value={fv.menstrualHistory.cycleNature} />
                </Card>
            )}

            {/* Obstetric History */}
            {fv.obstetricHistory && (
                <Card className="p-4">
                    <SectionLabel>Previous Obstetric History</SectionLabel>
                    {fv.obstetricHistory.detailedHistory && (
                        <p className="text-sm text-stone-700 leading-relaxed bg-stone-50 rounded-xl p-3 mb-3 whitespace-pre-line">{fv.obstetricHistory.detailedHistory}</p>
                    )}
                    {/* Previous pregnancies — detailed read view */}
                    {fv.obstetricHistory.previousPregnancies?.length > 0 && (
                        <div className="mt-4 space-y-3">
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Previous Pregnancies — Detailed</p>
                            {fv.obstetricHistory.previousPregnancies.map((preg, i) => (
                                <div key={i} className="bg-stone-50 rounded-xl p-4 text-xs text-stone-600 space-y-2 border border-stone-200">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-bold text-stone-800">Pregnancy {i + 1} ({preg.year})</p>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${preg.outcome === "Stillbirth" ? "bg-rose-100 text-rose-700"
                                            : preg.outcome === "Neonatal Death" ? "bg-red-100 text-red-700"
                                                : preg.outcome === "Live Birth" ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-stone-200 text-stone-600"
                                            }`}>{preg.outcome || "Live Birth"}</span>
                                    </div>
                                    {/* ANC & delivery */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
                                        <p><strong>ANC Attended:</strong> {preg.ancAttended ? "Yes" : "No"}</p>
                                        <p><strong>Place:</strong> {preg.placeOfDelivery || "—"}</p>
                                        <p><strong>GA at Delivery:</strong> {preg.ga || "—"}</p>
                                        <p><strong>Type of Labour:</strong> {preg.typeOfLabour || "—"}</p>
                                        <p><strong>Mode:</strong> {preg.modeOfDelivery || "—"}</p>
                                        <p><strong>Indication:</strong> {preg.indication || "None"}</p>
                                        <p><strong>Anaesthesia:</strong> {preg.anaesthesia || "None"}</p>
                                        <p><strong>Interventions:</strong> {preg.interventions || "None"}</p>
                                    </div>
                                    {preg.complications && <p className="text-rose-600"><strong>Complications:</strong> {preg.complications}</p>}
                                    {/* Baby details */}
                                    <div className="mt-2 pt-2 border-t border-stone-200">
                                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Baby Details</p>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
                                            <p><strong>Sex:</strong> {preg.babySex || "—"}</p>
                                            <p><strong>Weight:</strong> {preg.babyWeight || "—"}</p>
                                            <p><strong>Apgar:</strong> {preg.apgar || "—"}</p>
                                            <p><strong>Time of Birth:</strong> {preg.timeOfBirth || "—"}</p>
                                            {preg.congenitalAnomalies && <p><strong>Congenital Anomalies:</strong> {preg.congenitalAnomalies}</p>}
                                            {preg.babyComplications && <p className="text-rose-600"><strong>Baby Complications:</strong> {preg.babyComplications}</p>}
                                            {preg.immunisations && <p><strong>Immunisations:</strong> {preg.immunisations}</p>}
                                            {preg.breastfeeding && <p><strong>Breastfeeding:</strong> {preg.breastfeeding}</p>}
                                        </div>
                                    </div>
                                    {/* Stillbirth / NND */}
                                    {preg.outcome === "Stillbirth" && preg.stillbirthType && (
                                        <p className="text-rose-700 mt-1"><strong>Stillbirth Type:</strong> {preg.stillbirthType}</p>
                                    )}
                                    {preg.outcome === "Neonatal Death" && preg.nndCause && (
                                        <p className="text-red-700 mt-1"><strong>NND Cause:</strong> {preg.nndCause}</p>
                                    )}
                                    {/* Flags / Conditions for this pregnancy */}
                                    <div className="mt-2 pt-2 border-t border-stone-200">
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                ["prevCS", "Caesarean Section"], ["prevPPH", "PPH"], ["prevPreterm", "Preterm Birth"],
                                                ["prevStillbirth", "Stillbirth"], ["prevEclampsia", "Eclampsia/PIH"],
                                                ["prevGDM", "GDM"], ["prevNeonatalDeath", "Neonatal Death"],
                                                ["prevCongenitalAnomaly", "Congenital Anomaly"], ["prevForceps", "Forceps/Vacuum"],
                                                ["prevAbortion2Plus", "Abortion (≥2)"], ["prevSevereAnaemia", "Severe Anaemia"],
                                            ].filter(([k]) => preg[k]).map(([k, label]) => (
                                                <span key={k} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-100 text-rose-700">⚠ {label}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {/* Abortions */}
                    {fv.obstetricHistory.abortions?.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Abortions / Ectopic / Molar</p>
                            {fv.obstetricHistory.abortions.map((ab, i) => (
                                <div key={i} className="bg-amber-50 rounded-xl p-3 text-xs text-amber-800 border border-amber-200 space-y-1">
                                    <p className="font-bold">#{i + 1} — {ab.type} ({ab.year})</p>
                                    <p><strong>GA:</strong> {ab.ga || "—"} | <strong>Method:</strong> {ab.method || "—"} | <strong>Management:</strong> {ab.management || "—"}</p>
                                    {ab.complications && <p className="text-rose-600"><strong>Complications:</strong> {ab.complications}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            )}

            {/* Medical History */}
            {fv.medicalHistory && (
                <Card className="p-4">
                    <SectionLabel>Medical History</SectionLabel>
                    <div className="flex flex-wrap gap-2">
                        {[
                            ["asthma", "Asthma"], ["epilepsy", "Epilepsy"], ["hypertension", "Hypertension"],
                            ["heartDisease", "Heart Disease"], ["diabetes", "Diabetes"], ["sle", "SLE/RA"],
                            ["sickleCell", "Sickle Cell/Thalassaemia"], ["hiv", "HIV"], ["hepatitisB", "Hepatitis B"],
                            ["hepatitisC", "Hepatitis C"], ["tb", "TB"], ["thyroid", "Thyroid"],
                            ["kidneyLiver", "Kidney/Liver"], ["cysticFibrosis", "Cystic Fibrosis"],
                        ].map(([k, label]) => (
                            <span key={k} className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${fv.medicalHistory[k] ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                                {label}: {fv.medicalHistory[k] ? "Yes" : "No"}
                            </span>
                        ))}
                    </div>
                    {fv.medicalHistory.other && <p className="text-sm text-stone-600 mt-2">Other: {fv.medicalHistory.other}</p>}
                </Card>
            )}

            {/* Treatment History */}
            {fv.treatmentHistory && (
                <Card className="p-4">
                    <SectionLabel>Treatment History</SectionLabel>
                    <KVRow label="Previous Admissions" value={fv.treatmentHistory.prevAdmission || "None"} />
                    <KVRow label="Blood Transfusion" value={fv.treatmentHistory.bloodTransfusion ? "Yes" : "No"} />
                    <KVRow label="Drug Allergy" value={fv.treatmentHistory.drugAllergy || "None"} />
                    <KVRow label="Tetanus Immunised" value={fv.treatmentHistory.tetanusImmunised ? "Yes" : "No"} />
                    <KVRow label="Rh Immunoglobulin" value={fv.treatmentHistory.rhImmunoglobulin ? "Yes" : "No"} />
                    <KVRow label="Current Medications" value={fv.treatmentHistory.currentMedications || "None"} />
                </Card>
            )}

            {/* Surgical, Family, Social, Personal, etc */}
            {fv.surgicalHistory && (
                <Card className="p-4">
                    <SectionLabel>Surgical History</SectionLabel>
                    <p className="text-sm text-stone-700">{fv.surgicalHistory}</p>
                </Card>
            )}

            {fv.familyHistory && (
                <Card className="p-4">
                    <SectionLabel>Family History</SectionLabel>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {[
                            ["diabetes", "Diabetes"], ["hypertension", "HTN"], ["geneticDisorder", "Genetic Disorder"],
                            ["cancers", "Cancers"], ["chronicInfections", "Chronic Infections/TB"], ["psychiatricIllness", "Psychiatric"],
                        ].filter(([k]) => fv.familyHistory[k]).map(([k, label]) => (
                            <span key={k} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-100 text-amber-700">{label}</span>
                        ))}
                    </div>
                    {fv.familyHistory.details && <p className="text-sm text-stone-600">{fv.familyHistory.details}</p>}
                </Card>
            )}

            {fv.socialHistory && (
                <Card className="p-4">
                    <SectionLabel>Social History</SectionLabel>
                    <KVRow label="Employment" value={fv.socialHistory.employment} />
                    <KVRow label="Home Circumstances" value={fv.socialHistory.homeCircumstances} />
                    <KVRow label="Financial Condition" value={fv.socialHistory.financialCondition} />
                    <KVRow label="Domestic Violence" value={fv.socialHistory.domesticViolence ? "Yes — Flagged" : "No"} />
                    <KVRow label="Marital Status" value={fv.socialHistory.maritalStatus} />
                </Card>
            )}

            {fv.personalHistory && (
                <Card className="p-4">
                    <SectionLabel>Personal History</SectionLabel>
                    <div className="flex flex-wrap gap-2">
                        {[["smoking", "Smoking"], ["alcohol", "Alcohol"], ["drugs", "Drugs"]].map(([k, label]) => (
                            <span key={k} className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${fv.personalHistory[k] ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                                {label}: {fv.personalHistory[k] ? "Yes" : "No"}
                            </span>
                        ))}
                    </div>
                </Card>
            )}

            {fv.contraceptiveHistory && (
                <Card className="p-4">
                    <SectionLabel>FP / Contraceptive History</SectionLabel>
                    <div className="flex items-center gap-3">
                        <p className="text-sm text-stone-700 font-semibold">{fv.contraceptiveHistory}</p>
                        {(() => {
                            const risk = CONTRACEPTIVE_METHODS.find(m => m.label === fv.contraceptiveHistory)?.risk;
                            if (!risk) return null;
                            const cls = risk === 'moderate' ? 'bg-amber-100 text-amber-700' :
                                risk === 'low' ? 'bg-blue-100 text-blue-700' :
                                    'bg-emerald-100 text-emerald-700';
                            return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${cls}`}>{risk} Risk</span>;
                        })()}
                    </div>
                </Card>
            )}

            {fv.nutritionalHistory && (
                <Card className="p-4">
                    <SectionLabel>Nutritional History</SectionLabel>
                    <KVRow label="Diet Type" value={fv.nutritionalHistory.dietType} />
                    <KVRow label="Food Taboos" value={fv.nutritionalHistory.foodTaboos || "None"} />
                </Card>
            )}

            {fv.gynaecologicalHistory && (
                <Card className="p-4">
                    <SectionLabel>Gynaecological History</SectionLabel>
                    <p className="text-sm text-stone-700">{fv.gynaecologicalHistory}</p>
                </Card>
            )}

            {fv.stiHistory && (
                <Card className="p-4">
                    <SectionLabel>STI / HIV History</SectionLabel>
                    <p className="text-sm text-stone-700">{fv.stiHistory}</p>
                </Card>
            )}

            {fv.gbvScreening && (
                <Card className="p-4">
                    <SectionLabel>Gender-Based Violence Screening (from initial evaluation)</SectionLabel>
                    <p className="text-sm text-stone-700">{fv.gbvScreening}</p>
                </Card>
            )}

            {/* Examination */}
            {fv.examination && (
                <Card className="p-4">
                    <SectionLabel>First Visit Examination</SectionLabel>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4">
                        <KVRow label="General Condition" value={fv.examination.generalCondition} />
                        <KVRow label="BP" value={fv.examination.bp} />
                        <KVRow label="Pulse" value={fv.examination.pulse} />
                        <KVRow label="Weight" value={fv.examination.weight ? `${fv.examination.weight} kg` : "—"} />
                        <KVRow label="Height" value={fv.examination.height ? `${fv.examination.height} cm` : "—"} />
                        <KVRow label="BMI" value={(() => {
                            const b = fv.examination.bmi;
                            if (!b) return "—";
                            const v = parseFloat(b);
                            if (v < 18.5) return <span className="text-rose-700 font-bold">{b} — Low</span>;
                            if (v > 24.9) return <span className="text-rose-700 font-bold">{b} — High</span>;
                            return b;
                        })()} />
                        <KVRow label="Breast Exam" value={fv.examination.breastExam} />
                        <KVRow label="Abdominal Exam" value={fv.examination.abdominalExam} />
                        <KVRow label="Fundal Height" value={fv.examination.fundalHeight ? `${fv.examination.fundalHeight} cm` : "—"} />
                        <KVRow label="Pelvic Exam" value={fv.examination.pelvicExam} />
                    </div>
                </Card>
            )}
        </div>
    );
}

/* ─── Empty per-pregnancy / abortion templates ───────────────────── */
const EMPTY_PREGNANCY = {
    year: "", outcome: "Live Birth", ancAttended: true, placeOfDelivery: "",
    ga: "", typeOfLabour: "", modeOfDelivery: "", indication: "",
    anaesthesia: "", interventions: "", complications: "",
    babySex: "", babyWeight: "", apgar: "", timeOfBirth: "",
    congenitalAnomalies: "", babyComplications: "", immunisations: "", breastfeeding: "",
    stillbirthType: "", nndCause: "",
    prevCS: false, prevPPH: false, prevPreterm: false,
    prevStillbirth: false, prevEclampsia: false, prevGDM: false, prevNeonatalDeath: false,
    prevCongenitalAnomaly: false, prevForceps: false, prevAbortion2Plus: false, prevSevereAnaemia: false,
};

const EMPTY_ABORTION = {
    type: "", year: "", ga: "", method: "", management: "", complications: "",
};

/* ─── Helper to transform finished pregnancy to history entry ────── */
function transformToHistory(p) {
    if (!p.deliveryDate) return null;
    return {
        year: p.deliveryDate.slice(0, 4),
        outcome: p.babyStatus === "Stillbirth" ? "Stillbirth" :
            p.babyStatus === "Neonatal Death" ? "Neonatal Death" : "Live Birth",
        ancAttended: true,
        placeOfDelivery: "Hospital",
        ga: p.gaAtDelivery || "",
        typeOfLabour: p.durationOfLabor ? "Spontaneous" : "",
        modeOfDelivery: p.deliveryMode || "",
        indication: "",
        anaesthesia: "",
        interventions: p.episiotomy === "Yes" ? "Episiotomy" : "",
        complications: p.maternalComplications !== "None" ? p.maternalComplications : "",
        babySex: p.babySex || "",
        babyWeight: p.birthWeight ? `${p.birthWeight} kg` : "",
        apgar: p.apgar5 ? `5min: ${p.apgar5}` : "",
        timeOfBirth: p.deliveryTime || "",
        congenitalAnomalies: p.babyStatus === "Congenital Anomaly" ? "Yes" : "",
        babyComplications: p.babyStatus !== "Healthy & Stable" ? p.babyStatus : "",
        immunisations: p.immunization ? Object.entries(p.immunization).filter(([_, v]) => v).map(([k]) => k.toUpperCase()).join(", ") : "",
        breastfeeding: p.bfedInitiated === "Yes" ? "Exclusive (6 months)" : "",
        stillbirthType: p.babyStatus === "Stillbirth" ? "Unknown" : "",
        nndCause: p.babyStatus === "Neonatal Death" ? "Unknown" : "",
    };
}

/* ─── Empty first visit form state ────────────────────────────────── */
const EMPTY_FORM = (patient) => {
    const prev = patient.prevFirstVisit || {};

    // If returning mother, the pregnancy she just "finished" in our system
    // should be added to the previous pregnancies history.
    const autoHistoryEntry = transformToHistory(patient);
    const existingHistory = prev.obstetricHistory?.previousPregnancies || [];
    const combinedHistory = autoHistoryEntry
        ? [autoHistoryEntry, ...existingHistory]
        : existingHistory;

    return {
        presentingComplaints: "",
        historyOfComplaints: "",
        reviewOfSystems: {
            pvBleeding: false, pvDischarge: false, pelvicPain: false,
            dysmenorrhea: false, dyspareunia: false, fetalMovements: false,
            contractions: false, headache: false, visualDisturbance: false,
            epigastricPain: false, oedema: false,
        },
        menstrualHistory: { cycleNature: prev.menstrualHistory?.cycleNature || "", lmp: patient.lmp || "", regularCycles: prev.menstrualHistory?.regularCycles ?? true },
        obstetricHistory: prev.obstetricHistory ? {
            ...prev.obstetricHistory,
            previousPregnancies: combinedHistory
        } : {
            detailedHistory: "",
            previousPregnancies: combinedHistory,
            abortions: [],
        },
        medicalHistory: prev.medicalHistory ? { ...prev.medicalHistory } : {
            asthma: false, epilepsy: false, hypertension: !!patient.basicMedical?.highBP,
            heartDisease: false, diabetes: !!patient.basicMedical?.diabetes, diabetesType: "",
            sle: false, sickleCell: false, hiv: false, hepatitisB: false, hepatitisC: false,
            tb: false, thyroid: !!patient.basicMedical?.thyroid, kidneyLiver: false,
            cysticFibrosis: false, other: "",
        },
        treatmentHistory: prev.treatmentHistory ? { ...prev.treatmentHistory, currentMedications: "" } : { prevAdmission: "", bloodTransfusion: false, drugAllergy: patient.allergies || "", tetanusImmunised: false, rhImmunoglobulin: false, currentMedications: "" },
        surgicalHistory: prev.surgicalHistory || "",
        familyHistory: prev.familyHistory ? { ...prev.familyHistory } : { diabetes: false, hypertension: false, geneticDisorder: false, cancers: false, chronicInfections: false, psychiatricIllness: false, details: "" },
        socialHistory: prev.socialHistory ? { ...prev.socialHistory, employment: patient.occupation || "" } : { employment: patient.occupation || "", homeCircumstances: "", financialCondition: "", domesticViolence: false, maritalStatus: "" },
        personalHistory: prev.personalHistory ? { ...prev.personalHistory } : { smoking: false, alcohol: false, drugs: false, prenatalCare: false },
        contraceptiveHistory: prev.contraceptiveHistory || "",
        nutritionalHistory: prev.nutritionalHistory ? { ...prev.nutritionalHistory } : { dietType: "", foodTaboos: "" },
        gynaecologicalHistory: prev.gynaecologicalHistory || "",
        stiHistory: prev.stiHistory || "",
        gbvScreening: "",
        examination: { generalCondition: "", bp: "", pulse: "", weight: patient.weight || "", height: patient.height || "", bmi: "", breastExam: "", abdominalExam: "", fundalHeight: "", pelvicExam: "" },
        summary: "",
    };
};

/* ─── Editable first visit form ───────────────────────────────────── */
function FirstVisitForm({ patient, onSaved }) {
    const { dispatch } = useApp();
    const [form, setForm] = useState(EMPTY_FORM(patient));

    const set = (key, val) => setForm(p => ({ ...p, [key]: val }));
    const setNested = (section, key, val) => setForm(p => ({ ...p, [section]: { ...p[section], [key]: val } }));
    const setROS = (key, val) => setNested("reviewOfSystems", key, val);
    const setMenstrual = (key, val) => setNested("menstrualHistory", key, val);
    const setOb = (key, val) => setNested("obstetricHistory", key, val);
    const setMed = (key, val) => setNested("medicalHistory", key, val);
    const setTreat = (key, val) => setNested("treatmentHistory", key, val);
    const setFamily = (key, val) => setNested("familyHistory", key, val);
    const setSocial = (key, val) => setNested("socialHistory", key, val);
    const setPersonal = (key, val) => setNested("personalHistory", key, val);
    const setNutrition = (key, val) => setNested("nutritionalHistory", key, val);
    const setExam = (key, val) => setNested("examination", key, val);

    // Auto-calc BMI in exam
    const examBMI = calcBMI(form.examination.weight, form.examination.height);

    function handleSave() {
        const payload = {
            ...form,
            completed: true,
            completedOn: today(),
            examination: { ...form.examination, bmi: examBMI },
            autoRisk: autoRiskFromFirstVisit({ ...form, completed: true }),
        };
        dispatch({ type: "SAVE_FIRST_VISIT", patientId: patient.id, payload });
        onSaved();
    }

    const ROS_ITEMS = [
        ["pvBleeding", "PV Bleeding"], ["pvDischarge", "PV Discharge"], ["pelvicPain", "Pelvic Pain"],
        ["dysmenorrhea", "Dysmenorrhea"], ["dyspareunia", "Dyspareunia"], ["fetalMovements", "Fetal Movements"],
        ["contractions", "Contractions"], ["headache", "Headache"], ["visualDisturbance", "Visual Disturbance"],
        ["epigastricPain", "Epigastric Pain"], ["oedema", "Oedema"],
    ];

    const MEDICAL_ITEMS = [
        ["asthma", "Asthma"], ["epilepsy", "Epilepsy"], ["hypertension", "Hypertension"],
        ["heartDisease", "Congenital/Valvular Heart Disease"], ["diabetes", "Diabetes"],
        ["sle", "SLE / Rheumatoid Arthritis"], ["sickleCell", "Sickle Cell / Thalassaemia"],
        ["hiv", "HIV"], ["hepatitisB", "Hepatitis B"], ["hepatitisC", "Hepatitis C"],
        ["tb", "Tuberculosis (TB)"], ["thyroid", "Thyroid Disorder"],
        ["kidneyLiver", "Kidney / Liver Disease"], ["cysticFibrosis", "Cystic Fibrosis"],
    ];

    const OB_FLAGS = [
        ["prevCS", "Previous Caesarean Section"], ["prevPPH", "Previous PPH"],
        ["prevPreterm", "Previous Preterm Birth"], ["prevStillbirth", "Previous Stillbirth"],
        ["prevEclampsia", "Previous Eclampsia / PIH"], ["prevGDM", "Previous GDM"],
        ["prevNeonatalDeath", "Previous Neonatal Death"], ["prevCongenitalAnomaly", "Previous Congenital Anomaly"],
        ["prevForceps", "Previous Forceps/Vacuum"], ["prevAbortion2Plus", "Previous Abortion (≥2)"],
        ["prevSevereAnaemia", "Severe Anaemia in prev. pregnancy"],
    ];

    const FAMILY_ITEMS = [
        ["diabetes", "Diabetes"], ["hypertension", "Hypertension"], ["geneticDisorder", "Genetic Disorder / Congenital Anomaly"],
        ["cancers", "Cancers (esp. genital tract)"], ["chronicInfections", "Chronic Infections / TB"], ["psychiatricIllness", "Psychiatric Illness"],
    ];

    return (
        <div className="space-y-3">
            {/* Info banner */}
            <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4 flex items-start gap-3 mb-2">
                <span className="text-brand-600 text-lg mt-0.5">📋</span>
                <div>
                    <p className="text-sm font-semibold text-brand-800">History Taking</p>
                    <p className="text-xs text-brand-600 mt-0.5">Take comprehensive history as per WHO/Nepal ANC protocol.</p>
                </div>
            </div>

            {/* 1. Menstrual History (was section 2, now first) */}
            <Section title="Menstrual History" defaultOpen>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">LMP </label>
                        <div className="px-3.5 py-2.5 text-sm bg-blue-50 border border-blue-200 rounded-xl text-blue-800 font-semibold">{form.menstrualHistory.lmp || "—"}</div>
                    </div>
                    <FormSelect label="Regular Cycles?" value={form.menstrualHistory.regularCycles ? "yes" : "no"} onChange={e => setMenstrual("regularCycles", e.target.value === "yes")}>
                        <option value="yes">Yes — Regular</option>
                        <option value="no">No — Irregular</option>
                    </FormSelect>
                </div>
                <div className="mt-3">
                    <FormTextarea label="Nature of Menstrual Cycle" value={form.menstrualHistory.cycleNature} onChange={e => setMenstrual("cycleNature", e.target.value)} placeholder="Cycle length, flow duration, dysmenorrhea..." rows={2} />
                </div>
            </Section>

            {/* 3. Previous Obstetric History */}
            <Section title="Previous Obstetric History" >
                {/* General OB summary (optional) */}
                <FormTextarea label="Summary Obstetric History" value={form.obstetricHistory.detailedHistory} onChange={e => setOb("detailedHistory", e.target.value)}
                    placeholder="e.g. G3P2L1A1 — brief summary..." rows={2} />

                {/* ── Per-pregnancy entries ────────────────────────── */}
                <div className="mt-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Previous Pregnancies — Detailed</p>
                        <button type="button" onClick={() => {
                            const prev = form.obstetricHistory.previousPregnancies;
                            setOb("previousPregnancies", [...prev, { ...EMPTY_PREGNANCY }]);
                        }} className="text-xs bg-brand-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-brand-700 transition-colors">
                            + Add Pregnancy
                        </button>
                    </div>

                    {form.obstetricHistory.previousPregnancies.length === 0 && (
                        <p className="text-xs text-stone-400 italic">No previous pregnancies recorded. Click "+ Add Pregnancy" above to add entries.</p>
                    )}

                    {form.obstetricHistory.previousPregnancies.map((preg, idx) => {
                        const setPregField = (field, val) => {
                            const updated = [...form.obstetricHistory.previousPregnancies];
                            updated[idx] = { ...updated[idx], [field]: val };
                            setOb("previousPregnancies", updated);
                        };
                        const removePregEntry = () => {
                            const updated = form.obstetricHistory.previousPregnancies.filter((_, i) => i !== idx);
                            setOb("previousPregnancies", updated);
                        };
                        return (
                            <div key={idx} className="bg-stone-50 border border-stone-200 rounded-2xl p-4 mb-3">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm font-bold text-stone-800">Pregnancy #{idx + 1}</p>
                                    <button type="button" onClick={removePregEntry} className="text-[10px] text-rose-500 font-semibold hover:text-rose-700">✕ Remove</button>
                                </div>

                                {/* Row 1: Year, Outcome, ANC */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                                    <FormInput label="Year" value={preg.year} onChange={e => setPregField("year", e.target.value)} placeholder="2022" />
                                    <FormSelect label="Outcome" value={preg.outcome} onChange={e => setPregField("outcome", e.target.value)}>
                                        <option value="Live Birth">Live Birth</option>
                                        <option value="Stillbirth">Stillbirth</option>
                                        <option value="Neonatal Death">Neonatal Death (early NND)</option>
                                    </FormSelect>
                                    <FormSelect label="ANC Attended?" value={preg.ancAttended ? "yes" : "no"} onChange={e => setPregField("ancAttended", e.target.value === "yes")}>
                                        <option value="yes">Yes</option>
                                        <option value="no">No</option>
                                    </FormSelect>
                                    <FormInput label="GA at Delivery" value={preg.ga} onChange={e => setPregField("ga", e.target.value)} placeholder="39 weeks" />
                                </div>

                                {/* Row 2: Place, Labour, Mode, Indication */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                                    <FormSelect label="Place of Delivery" value={preg.placeOfDelivery} onChange={e => setPregField("placeOfDelivery", e.target.value)}>
                                        <option value="">Select</option>
                                        <option>Hospital</option>
                                        <option>Health Centre</option>
                                        <option>Home</option>
                                        <option>On the Way</option>
                                    </FormSelect>
                                    <FormSelect label="Type of Labour" value={preg.typeOfLabour} onChange={e => setPregField("typeOfLabour", e.target.value)}>
                                        <option value="">Select</option>
                                        <option>Spontaneous</option>
                                        <option>Induced</option>
                                        <option>Augmented</option>
                                    </FormSelect>
                                    <FormSelect label="Mode of Delivery" value={preg.modeOfDelivery} onChange={e => setPregField("modeOfDelivery", e.target.value)}>
                                        <option value="">Select</option>
                                        <option>SVD (Normal)</option>
                                        <option>LSCS</option>
                                        <option>Forceps</option>
                                        <option>Vacuum</option>
                                        <option>Assisted Breech</option>
                                    </FormSelect>
                                    <FormInput label="Indication (if operative)" value={preg.indication} onChange={e => setPregField("indication", e.target.value)} placeholder="Failure to progress, Fetal distress..." />
                                </div>

                                {/* Row 3: Anaesthesia, Interventions, Complications */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                                    <FormSelect label="Anaesthesia" value={preg.anaesthesia} onChange={e => setPregField("anaesthesia", e.target.value)}>
                                        <option value="">None / Not Applicable</option>
                                        <option>Spinal</option>
                                        <option>Epidural</option>
                                        <option>General</option>
                                        <option>Local</option>
                                    </FormSelect>
                                    <FormInput label="Interventions during Labour" value={preg.interventions} onChange={e => setPregField("interventions", e.target.value)} placeholder="Episiotomy, ARM, Oxytocin..." />
                                    <FormInput label="Complications" value={preg.complications} onChange={e => setPregField("complications", e.target.value)} placeholder="PPH, Eclampsia, GDM..." />
                                </div>

                                {/* Baby details sub-section */}
                                <div className="mt-3 pt-3 border-t border-stone-200">
                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Baby Details</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
                                        <FormSelect label="Sex" value={preg.babySex} onChange={e => setPregField("babySex", e.target.value)}>
                                            <option value="">Select</option>
                                            <option>Male</option>
                                            <option>Female</option>
                                            <option>Ambiguous</option>
                                        </FormSelect>
                                        <FormInput label="Birth Weight" value={preg.babyWeight} onChange={e => setPregField("babyWeight", e.target.value)} placeholder="3.1 kg" />
                                        <FormInput label="Apgar Score" value={preg.apgar} onChange={e => setPregField("apgar", e.target.value)} placeholder="8/9" />
                                        <FormInput label="Time of Birth" value={preg.timeOfBirth} onChange={e => setPregField("timeOfBirth", e.target.value)} placeholder="Term / Preterm" />
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <FormInput label="Congenital Anomalies" value={preg.congenitalAnomalies} onChange={e => setPregField("congenitalAnomalies", e.target.value)} placeholder="None / Specify..." />
                                        <FormInput label="Baby Complications" value={preg.babyComplications} onChange={e => setPregField("babyComplications", e.target.value)} placeholder="NICU, Jaundice..." />
                                        <FormInput label="Immunisations" value={preg.immunisations} onChange={e => setPregField("immunisations", e.target.value)} placeholder="BCG, OPV..." />
                                        <FormSelect label="Breastfeeding" value={preg.breastfeeding} onChange={e => setPregField("breastfeeding", e.target.value)}>
                                            <option value="">Select</option>
                                            <option>Exclusive (6 months)</option>
                                            <option>Partial</option>
                                            <option>Not Breastfed</option>
                                        </FormSelect>
                                    </div>
                                </div>

                                {/* Conditional: Stillbirth / NND details */}
                                {preg.outcome === "Stillbirth" && (
                                    <div className="mt-3 bg-rose-50 border border-rose-200 rounded-xl p-3">
                                        <FormSelect label="Stillbirth Type" value={preg.stillbirthType} onChange={e => setPregField("stillbirthType", e.target.value)}>
                                            <option value="">Select</option>
                                            <option>Fresh</option>
                                            <option>Macerated</option>
                                        </FormSelect>
                                    </div>
                                )}
                                {preg.outcome === "Neonatal Death" && (
                                    <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3">
                                        <FormInput label="Cause of Early NND (if known)" value={preg.nndCause} onChange={e => setPregField("nndCause", e.target.value)} placeholder="Prematurity, Birth asphyxia, Sepsis..." />
                                    </div>
                                )}

                                {/* Complications Checkboxes */}
                                <div className="mt-3 pt-3 border-t border-stone-200">
                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Complications Recorded</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {OB_FLAGS.map(([key, label]) => (
                                            <BoolToggle key={key} label={label} value={preg[key]} onChange={v => setPregField(key, v)} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── Abortions / Ectopic / Molar pregnancies ─────── */}
                <div className="mt-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Abortions / Ectopic / Molar Pregnancy</p>
                        <button type="button" onClick={() => {
                            const prev = form.obstetricHistory.abortions || [];
                            setOb("abortions", [...prev, { ...EMPTY_ABORTION }]);
                        }} className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-amber-700 transition-colors">
                            + Add Entry
                        </button>
                    </div>

                    {(!form.obstetricHistory.abortions || form.obstetricHistory.abortions.length === 0) && (
                        <p className="text-xs text-stone-400 italic">No abortion/ectopic/molar entries. Click "+ Add Entry" above if applicable.</p>
                    )}

                    {(form.obstetricHistory.abortions || []).map((ab, idx) => {
                        const setAbField = (field, val) => {
                            const updated = [...(form.obstetricHistory.abortions || [])];
                            updated[idx] = { ...updated[idx], [field]: val };
                            setOb("abortions", updated);
                        };
                        const removeAbEntry = () => {
                            const updated = (form.obstetricHistory.abortions || []).filter((_, i) => i !== idx);
                            setOb("abortions", updated);
                        };
                        return (
                            <div key={idx} className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-3">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm font-bold text-amber-800">Entry #{idx + 1}</p>
                                    <button type="button" onClick={removeAbEntry} className="text-[10px] text-rose-500 font-semibold hover:text-rose-700">✕ Remove</button>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <FormSelect label="Type" value={ab.type} onChange={e => setAbField("type", e.target.value)}>
                                        <option value="">Select</option>
                                        <option>Spontaneous Abortion</option>
                                        <option>Induced — Medical</option>
                                        <option>Induced — Surgical</option>
                                        <option>Ectopic Pregnancy</option>
                                        <option>Molar Pregnancy</option>
                                    </FormSelect>
                                    <FormInput label="Year" value={ab.year} onChange={e => setAbField("year", e.target.value)} placeholder="2020" />
                                    <FormInput label="GA" value={ab.ga} onChange={e => setAbField("ga", e.target.value)} placeholder="8 weeks" />
                                    <FormSelect label="Management" value={ab.management} onChange={e => setAbField("management", e.target.value)}>
                                        <option value="">Select</option>
                                        <option>Expectant</option>
                                        <option>Medical (Misoprostol)</option>
                                        <option>Surgical (MVA/D&C)</option>
                                        <option>Salpingectomy</option>
                                        <option>Salpingotomy</option>
                                        <option>Methotrexate</option>
                                        <option>Suction Evacuation</option>
                                    </FormSelect>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                                    <FormInput label="Method (if induced)" value={ab.method} onChange={e => setAbField("method", e.target.value)} placeholder="e.g. Mifepristone + Misoprostol" />
                                    <FormInput label="Complications" value={ab.complications} onChange={e => setAbField("complications", e.target.value)} placeholder="Haemorrhage, Infection..." />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Section>

            {/* 4. Medical History */}
            <Section title="Medical History" >
                <p className="text-xs text-stone-400 mb-3">Pre-filled from registration data. Add/update as needed.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    {MEDICAL_ITEMS.map(([key, label]) => (
                        <BoolToggle key={key} label={label} value={form.medicalHistory[key]} onChange={v => setMed(key, v)} />
                    ))}
                </div>
                {form.medicalHistory.diabetes && (
                    <div className="mb-3">
                        <FormSelect label="Diabetes Type" value={form.medicalHistory.diabetesType || ""} onChange={e => setMed("diabetesType", e.target.value)}>
                            <option value="">Select Type</option>
                            <option value="Type 1">Type 1</option>
                            <option value="Type 2">Type 2</option>
                            <option value="GDM">Gestational (GDM)</option>
                        </FormSelect>
                    </div>
                )}
                <FormInput label="Any Other Significant Illness" value={form.medicalHistory.other} onChange={e => setMed("other", e.target.value)} placeholder="Other conditions..." />
            </Section>

            {/* 5. Treatment History */}
            <Section title="Treatment History" >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput label="Previous Hospital Admissions" value={form.treatmentHistory.prevAdmission} onChange={e => setTreat("prevAdmission", e.target.value)} placeholder="e.g. LSCS 2022" />
                    <div className="flex flex-col gap-1.5">
                        <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Blood Transfusion</p>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setTreat("bloodTransfusion", true)} className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-colors ${form.treatmentHistory.bloodTransfusion ? "bg-rose-600 text-white border-rose-600" : "bg-white text-stone-500 border-stone-200"}`}>Yes</button>
                            <button type="button" onClick={() => setTreat("bloodTransfusion", false)} className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-colors ${!form.treatmentHistory.bloodTransfusion ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-stone-500 border-stone-200"}`}>No</button>
                        </div>
                    </div>
                    <FormInput label="Drug Allergy (esp. Penicillin)" value={form.treatmentHistory.drugAllergy} onChange={e => setTreat("drugAllergy", e.target.value)} placeholder="Penicillin, NSAIDs..." />
                    <div className="flex flex-col gap-1.5">
                        <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Tetanus Immunised</p>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setTreat("tetanusImmunised", true)} className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-colors ${form.treatmentHistory.tetanusImmunised ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-stone-500 border-stone-200"}`}>Yes</button>
                            <button type="button" onClick={() => setTreat("tetanusImmunised", false)} className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-colors ${!form.treatmentHistory.tetanusImmunised ? "bg-rose-600 text-white border-rose-600" : "bg-white text-stone-500 border-stone-200"}`}>No</button>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Rh Immunoglobulin (prev. preg.)</p>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setTreat("rhImmunoglobulin", true)} className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-colors ${form.treatmentHistory.rhImmunoglobulin ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-stone-500 border-stone-200"}`}>Yes</button>
                            <button type="button" onClick={() => setTreat("rhImmunoglobulin", false)} className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-colors ${!form.treatmentHistory.rhImmunoglobulin ? "bg-rose-600 text-white border-rose-600" : "bg-white text-stone-500 border-stone-200"}`}>No</button>
                        </div>
                    </div>
                    <FormInput label="Current Medications" value={form.treatmentHistory.currentMedications} onChange={e => setTreat("currentMedications", e.target.value)} placeholder="Antihypertensives, antiepileptics..." className="sm:col-span-2" />
                </div>
            </Section>

            {/* 6. Surgical History */}
            <Section title="Surgical History" >
                <FormTextarea label="Surgical History" value={form.surgicalHistory} onChange={e => set("surgicalHistory", e.target.value)}
                    placeholder="Cardiac surgery, CS, myomectomy, LEEP/cone biopsy, operations for stress incontinence, VVF repair, abdominal surgery..."
                    rows={3} />
            </Section>

            {/* 7. Family History */}
            <Section title="Family History" >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    {FAMILY_ITEMS.map(([key, label]) => (
                        <BoolToggle key={key} label={label} value={form.familyHistory[key]} onChange={v => setFamily(key, v)} />
                    ))}
                </div>
                <FormTextarea label="Details" value={form.familyHistory.details} onChange={e => setFamily("details", e.target.value)} placeholder="Mother — T2DM. Father — Hypertension." rows={2} />
            </Section>

            {/* 8. Social History */}
            <Section title="Social History" >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput label="Employment / Occupation" value={form.socialHistory.employment} onChange={e => setSocial("employment", e.target.value)} placeholder="Type of occupation" />
                    <FormInput label="Home Circumstances" value={form.socialHistory.homeCircumstances} onChange={e => setSocial("homeCircumstances", e.target.value)} placeholder="e.g. Stable, Joint family" />
                    <FormInput label="Financial Condition" value={form.socialHistory.financialCondition} onChange={e => setSocial("financialCondition", e.target.value)} placeholder="e.g. Good, Moderate, Poor" />
                    <FormSelect label="Marital Status" value={form.socialHistory.maritalStatus} onChange={e => setSocial("maritalStatus", e.target.value)}>
                        <option value="">Select</option>
                        <option>Single</option>
                        <option>Married</option>
                        <option>Separated</option>
                        <option>Widow</option>
                    </FormSelect>
                </div>
                <div className="mt-3">
                    <BoolToggle label="Domestic Violence Concern" value={form.socialHistory.domesticViolence} onChange={v => setSocial("domesticViolence", v)} />
                </div>
            </Section>

            {/* 9. Personal History */}
            <Section title="Personal History" >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[["smoking", "Smoking / Tobacco"], ["alcohol", "Alcohol Use"], ["drugs", "Drug Abuse"], ["prenatalCare", "Utilises Prenatal Care"]].map(([key, label]) => (
                        <BoolToggle key={key} label={label} value={form.personalHistory[key]} onChange={v => setPersonal(key, v)} />
                    ))}
                </div>
            </Section>

            <Section title="FP / Contraceptive History" >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormSelect
                        label="Contraceptive Method Used"
                        value={CONTRACEPTIVE_METHODS.find(m => m.label === form.contraceptiveHistory)?.label || ""}
                        onChange={e => set("contraceptiveHistory", e.target.value)}
                    >
                        <option value="">Select Method</option>
                        {CONTRACEPTIVE_METHODS.map(m => (
                            <option key={m.label} value={m.label}>{m.label} ({m.risk})</option>
                        ))}
                    </FormSelect>
                    {form.contraceptiveHistory && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Associated Risk Level</label>
                            <div className={`px-3.5 py-2 text-xs rounded-xl font-bold uppercase tracking-wider ring-1 ${CONTRACEPTIVE_METHODS.find(m => m.label === form.contraceptiveHistory)?.risk === 'moderate'
                                ? 'bg-amber-50 text-amber-700 ring-amber-200'
                                : CONTRACEPTIVE_METHODS.find(m => m.label === form.contraceptiveHistory)?.risk === 'low'
                                    ? 'bg-blue-50 text-blue-700 ring-blue-200'
                                    : 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                                }`}>
                                {CONTRACEPTIVE_METHODS.find(m => m.label === form.contraceptiveHistory)?.risk} Risk
                            </div>
                        </div>
                    )}
                </div>
                <div className="mt-3">
                    <FormTextarea
                        label="Additional FP Details"
                        value={form.contraceptiveDetails || ""}
                        onChange={e => set("contraceptiveDetails", e.target.value)}
                        placeholder="Duration, reason for discontinuation, satisfaction, complications..."
                        rows={2}
                    />
                </div>
            </Section>

            {/* 11. Nutritional History */}
            <Section title="Nutritional History" >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormSelect label="Diet Type" value={form.nutritionalHistory.dietType} onChange={e => setNutrition("dietType", e.target.value)}>
                        <option value="">Select</option>
                        <option>Vegetarian</option>
                        <option>Non-vegetarian</option>
                        <option>Vegan</option>
                    </FormSelect>
                    <FormInput label="Food Taboos / Restrictions" value={form.nutritionalHistory.foodTaboos} onChange={e => setNutrition("foodTaboos", e.target.value)} placeholder="e.g. Avoids meat during pregnancy" />
                </div>
            </Section>

            {/* 12. Gynaecological History */}
            <Section title="Gynaecological History" >
                <FormTextarea label="Gynaecological History" value={form.gynaecologicalHistory} onChange={e => set("gynaecologicalHistory", e.target.value)}
                    placeholder="Recurrent vaginal discharge, pelvic pain, PID, fibroids, ovarian cysts, infertility, past treatments..."
                    rows={3} />
            </Section>

            {/* 13. STI / HIV History */}
            <Section title="STI / HIV History" >
                <FormTextarea label="STI / HIV History" value={form.stiHistory} onChange={e => set("stiHistory", e.target.value)}
                    placeholder="HIV status, HBsAg, VDRL, other STIs..."
                    rows={2} />
            </Section>



            {/* 15. Examination */}
            <Section title="Physical Examination" >
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <FormSelect label="General Condition" value={form.examination.generalCondition} onChange={e => setExam("generalCondition", e.target.value)}>
                        <option value="">Select</option>
                        <option>Good</option>
                        <option>Fair</option>
                        <option>Poor</option>
                    </FormSelect>
                    <FormInput label="BP (mmHg)" value={form.examination.bp} onChange={e => setExam("bp", e.target.value)} placeholder="120/80" />
                    <FormInput label="Pulse (bpm)" type="number" value={form.examination.pulse} onChange={e => setExam("pulse", e.target.value)} placeholder="78" />
                    <FormInput label="Weight (kg)" type="number" value={form.examination.weight} onChange={e => setExam("weight", e.target.value)} placeholder="58" />
                    <FormInput label="Height (cm)" type="number" value={form.examination.height} onChange={e => setExam("height", e.target.value)} placeholder="155" />
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">BMI </label>
                        <div className={`px-3.5 py-2.5 text-sm border rounded-xl font-semibold ${examBMI && parseFloat(examBMI) < 18.5 ? "bg-rose-50 border-rose-200 text-rose-700" : examBMI && parseFloat(examBMI) > 24.9 ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-blue-50 border-blue-200 text-blue-800"}`}>
                            {examBMI ? `${examBMI}${parseFloat(examBMI) < 18.5 ? " — Low" : parseFloat(examBMI) > 24.9 ? " — High" : ""}` : "—"}
                        </div>
                    </div>
                    <FormSelect label="Breast Exam" value={form.examination.breastExam} onChange={e => setExam("breastExam", e.target.value)}>
                        <option value="">Select</option>
                        <option>Normal</option>
                        <option>Abnormal</option>
                        <option>Not Done</option>
                    </FormSelect>
                    <FormSelect label="Abdominal Exam" value={form.examination.abdominalExam} onChange={e => setExam("abdominalExam", e.target.value)}>
                        <option value="">Select</option>
                        <option>Normal</option>
                        <option>Abnormal</option>
                        <option>Not Done</option>
                    </FormSelect>
                    <FormInput label="Fundal Height (cm)" type="number" value={form.examination.fundalHeight} onChange={e => setExam("fundalHeight", e.target.value)} placeholder="20" />
                    <FormSelect label="Pelvic Exam" value={form.examination.pelvicExam} onChange={e => setExam("pelvicExam", e.target.value)} className="sm:col-span-2">
                        <option value="">Select</option>
                        <option>Normal</option>
                        <option>Abnormal</option>
                        <option>Not Done</option>
                    </FormSelect>
                </div>
            </Section>

            {/* 16. Summary */}
            <Section title="Summary of History" defaultOpen>
                <FormTextarea label="Summary" value={form.summary} onChange={e => set("summary", e.target.value)}
                    placeholder="Patient name, age, time since marriage, gravida, parity, miscarriages, live children, weeks of gestation, associated conditions. Normal vs high-risk assessment."
                    rows={4} />
                {/* Auto-risk preview */}
                {(() => {
                    const risk = autoRiskFromFirstVisit({ ...form, completed: true });
                    const rc = RISK_CONFIG[risk];
                    return (
                        <div className={`mt-3 rounded-xl p-3 flex items-center gap-2 ${rc.pill}`}>
                            <span className={`w-2.5 h-2.5 rounded-full ${rc.dot}`} />
                            <span className="text-xs font-bold uppercase tracking-wider">Auto-assessed: {rc.label}</span>
                        </div>
                    );
                })()}
            </Section>

            {/* Save */}
            <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                <Button variant="success" onClick={handleSave}>
                    ✓ Complete Maternal Health Evaluation
                </Button>
            </div>
        </div>
    );
}

/* ─── Main exported tab ───────────────────────────────────────────── */
export default function FirstVisitTab({ patient }) {
    const [editing, setEditing] = useState(false);

    if (patient.firstVisit?.completed && !editing) {
        return (
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-stone-900" style={{ fontFamily: "var(--font-display)" }}>First Visit Assessment</h2>
                        <p className="text-xs text-stone-400">Completed on {patient.firstVisit.completedOn}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Edit</Button>
                </div>
                <FirstVisitReadView fv={patient.firstVisit} />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-4">
                <h2 className="text-lg font-bold text-stone-900" style={{ fontFamily: "var(--font-display)" }}>
                    {patient.firstVisit?.completed ? "Edit First Visit" : "Maternal Health Evaluation"}
                </h2>
                <p className="text-xs text-stone-400">Comprehensive clinical evaluation per protocol</p>
            </div>
            <FirstVisitForm patient={patient} onSaved={() => setEditing(false)} />
        </div>
    );
}
