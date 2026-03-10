import Modal from "../ui/Modal.jsx";
import RegPregnancy from "../registration/RegPregnancy.jsx";
import Button from "../ui/Button.jsx";
import Card from "../ui/Card.jsx";
import SectionLabel from "../ui/SectionLabel.jsx";
import { useState } from "react";
import { useApp } from "../../hooks/useApp.js";

/* ── Previous Pregnancy Summary ──────────────────────────────────── */
function PrevPregnancySummary({ patient }) {
    const prevPregs = patient.firstVisit?.obstetricHistory?.previousPregnancies || [];
    if (prevPregs.length === 0) return null;

    return (
        <Card className="p-4 border border-stone-200 bg-stone-50/50">
            <SectionLabel>Previous Pregnancy History</SectionLabel>
            <p className="text-xs text-stone-500 mb-3">
                From Maternal Health Evaluation — {prevPregs.length} previous pregnanc{prevPregs.length === 1 ? "y" : "ies"} recorded.
            </p>
            <div className="space-y-3">
                {prevPregs.map((preg, idx) => {
                    const OB_FLAG_LABELS = {
                        prevCS: "Caesarean Section", prevPPH: "PPH", prevPreterm: "Preterm",
                        prevStillbirth: "Stillbirth", prevEclampsia: "Eclampsia/PIH",
                        prevGDM: "GDM", prevNeonatalDeath: "Neonatal Death",
                        prevCongenitalAnomaly: "Congenital Anomaly", prevForceps: "Forceps/Vacuum",
                        prevAbortion2Plus: "Abortion (≥2)", prevSevereAnaemia: "Severe Anaemia",
                    };
                    const activeFlags = Object.entries(OB_FLAG_LABELS).filter(([key]) => preg[key]);

                    return (
                        <div key={idx} className="bg-white rounded-xl p-3.5 border border-stone-200 text-xs">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-bold text-stone-800">
                                    Pregnancy #{idx + 1} ({preg.year || "—"})
                                </p>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${preg.outcome === "Stillbirth" ? "bg-rose-100 text-rose-700" :
                                    preg.outcome === "Neonatal Death" ? "bg-red-100 text-red-700" :
                                        preg.outcome === "Live Birth" ? "bg-emerald-100 text-emerald-700" :
                                            "bg-stone-200 text-stone-600"
                                    }`}>
                                    {preg.outcome || "Live Birth"}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-stone-600">
                                {preg.modeOfDelivery && <p><strong>Mode:</strong> {preg.modeOfDelivery}</p>}
                                {preg.placeOfDelivery && <p><strong>Place:</strong> {preg.placeOfDelivery}</p>}
                                {preg.ga && <p><strong>GA:</strong> {preg.ga}</p>}
                                {preg.babySex && <p><strong>Baby:</strong> {preg.babySex}</p>}
                                {preg.babyWeight && <p><strong>Weight:</strong> {preg.babyWeight}</p>}
                                {preg.complications && <p className="text-rose-600"><strong>Complications:</strong> {preg.complications}</p>}
                            </div>

                            {activeFlags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-stone-100">
                                    {activeFlags.map(([key, label]) => (
                                        <span key={key} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-100 text-rose-700">⚠ {label}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}

/* ── Delivery Summary (last delivery) ──────────────────────────── */
function LastDeliverySummary({ patient }) {
    if (!patient.deliveryDate) return null;

    return (
        <Card className="p-4 border-2 border-brand-200 bg-brand-50/30">
            <SectionLabel>Last Delivery Summary</SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-stone-600">
                <div>
                    <p className="text-[10px] text-stone-500 uppercase tracking-wider">Date</p>
                    <p className="font-semibold text-stone-800">{patient.deliveryDate} {patient.deliveryTime && `at ${patient.deliveryTime}`}</p>
                </div>
                <div>
                    <p className="text-[10px] text-stone-500 uppercase tracking-wider">Mode</p>
                    <p className="font-semibold text-brand-700">{patient.deliveryMode || "—"}</p>
                </div>
                <div>
                    <p className="text-[10px] text-stone-500 uppercase tracking-wider">Baby</p>
                    <p className="font-semibold text-stone-800">{patient.babySex || "—"} · {patient.birthWeight ? `${patient.birthWeight} kg` : "—"}</p>
                </div>
                <div>
                    <p className="text-[10px] text-stone-500 uppercase tracking-wider">Complications</p>
                    <p className={`font-semibold ${patient.maternalComplications && patient.maternalComplications !== "None" ? "text-rose-700" : "text-stone-800"}`}>
                        {patient.maternalComplications || "None"}
                    </p>
                </div>
            </div>
        </Card>
    );
}

export default function RecordPregnancyModal({ patient, onClose }) {
    const { dispatch } = useApp();
    const [form, setFormState] = useState({
        gravida: String((parseInt(patient.gravida) || 0) + 1),
        para: String(parseInt(patient.para) || 0),
        lmp: "",
        edd: "",
        ga: "",
    });

    const set = (key, value) =>
        setFormState((prev) => ({ ...prev, [key]: value }));

    function handleSubmit() {
        if (!form.lmp) return;

        dispatch({
            type: "RECORD_NEW_PREGNANCY",
            patientId: patient.id,
            payload: {
                gravida: parseInt(form.gravida),
                para: parseInt(form.para),
                lmp: form.lmp,
                edd: form.edd,
                ga: form.ga,
            }
        });
        onClose();
    }

    return (
        <Modal
            title="Record New Pregnancy"
            subtitle={`${patient.name} · ${patient.id}`}
            onClose={onClose}
            size="lg"
        >
            <div className="space-y-6">
                {/* Show previous pregnancies and last delivery */}
                <LastDeliverySummary patient={patient} />
                <PrevPregnancySummary patient={patient} />

                <RegPregnancy form={form} set={set} patientMode="returning" />

                <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!form.lmp}
                    >
                        Start New Pregnancy
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
