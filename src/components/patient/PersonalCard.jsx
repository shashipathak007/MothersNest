import Card from "../ui/Card.jsx";
import SectionLabel from "../ui/SectionLabel.jsx";
import KVRow from "../ui/KVRow.jsx";
import { fmtDate, calcBMI } from "../../utils/helpers.js";

export default function PersonalCard({ patient }) {
  const p = patient.partner;
  const bmi = calcBMI(patient.weight, patient.height);

  return (
    <Card className="p-4">
      <SectionLabel>Personal Details</SectionLabel>
      <KVRow label="Patient ID" value={patient.id} mono />
      <KVRow label="Age" value={patient.age ? `${patient.age} years` : "—"} />
      <KVRow label="Phone" value={patient.phone} mono />
      <KVRow label="Religion" value={patient.religion} />
      <KVRow label="Ethnicity" value={patient.ethnicity} />
      <KVRow label="Education" value={patient.education} />
      <KVRow label="Occupation" value={patient.occupation} />
      <KVRow label="Address" value={patient.address} />
      {patient.weight && <KVRow label="Weight" value={`${patient.weight} kg`} />}
      {patient.height && <KVRow label="Height" value={`${patient.height} cm`} />}
      {bmi && <KVRow label="BMI" value={bmi} accent={parseFloat(bmi) >= 30 || parseFloat(bmi) < 18.5} />}
      <KVRow label="Registered" value={fmtDate(patient.registeredOn)} />

      {p && p.name && (
        <>
          <div className="mt-4 pt-3 border-t border-stone-100">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Partner Details</p>
          </div>
          <KVRow label="Name" value={p.name} />
          <KVRow label="Age" value={p.age ? `${p.age} years` : "—"} />
          <KVRow label="Phone" value={p.phone} mono />
          <KVRow label="Education" value={p.education} />
          <KVRow label="Occupation" value={p.occupation} />
        </>
      )}
    </Card>
  );
}
