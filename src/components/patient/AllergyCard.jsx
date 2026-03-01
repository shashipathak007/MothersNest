import Card from "../ui/Card.jsx";
import SectionLabel from "../ui/SectionLabel.jsx";

export default function AllergyCard({ allergies }) {
  if (!allergies) return null;

  return (
    <Card className="p-4 border-rose-200 bg-rose-50/60">
      <SectionLabel>⚠ Allergies</SectionLabel>
      <p className="text-sm text-rose-700 font-medium">{allergies}</p>
    </Card>
  );
}
