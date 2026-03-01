import Card from "../ui/Card.jsx";
import SectionLabel from "../ui/SectionLabel.jsx";
import KVRow from "../ui/KVRow.jsx";

export default function PregnancyCard({ patient }) {
  return (
    <Card className="p-4">
      <SectionLabel>Pregnancy Details</SectionLabel>
      <KVRow label="G · P"       value={`G${patient.gravida} · P${patient.para}`} />
      <KVRow label="LMP"         value={patient.lmp} />
      <KVRow label="EDD"         value={patient.edd} />
      <KVRow label="Gest. Age"   value={patient.ga ? `${patient.ga} weeks` : "—"} />
      <KVRow label="Blood Group" value={patient.bloodGroup} accent={patient.bloodGroup?.includes("−")} />
    </Card>
  );
}
