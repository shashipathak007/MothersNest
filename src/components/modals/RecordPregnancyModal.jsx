import Modal from "../ui/Modal.jsx";
import RegPregnancy from "../registration/RegPregnancy.jsx";
import Button from "../ui/Button.jsx";
import { useState } from "react";
import { useApp } from "../../hooks/useApp.js";

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

        // We'll use a new action or update existing one to reset clinical evaluations
        // but for now, we follow the pattern of adding a new pregnancy/updating patient
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
