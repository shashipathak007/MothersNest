// AlertsCard is now used only in LabsTab context — InfoTab handles its own full alerts panel
import Card from "../ui/Card.jsx";
import SectionLabel from "../ui/SectionLabel.jsx";
import { StatusPill } from "../ui/Badge.jsx";

export default function AlertsCard({ labs }) {
  const abnormal = (labs || []).filter(l => l.status === "abnormal");
  const pending  = (labs || []).filter(l => l.status === "pending");

  if (abnormal.length === 0 && pending.length === 0) return null;

  return (
    <Card className="p-4">
      <SectionLabel>Lab Attention Required</SectionLabel>
      <div className="space-y-2">
        {abnormal.map(l => (
          <div key={l.id}
            className="flex items-center justify-between bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5"
          >
            <span className="text-sm font-semibold text-rose-800">{l.test}</span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-rose-700 font-mono">{l.value} {l.unit}</span>
              <StatusPill status="abnormal" />
            </div>
          </div>
        ))}
        {pending.map(l => (
          <div key={l.id}
            className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5"
          >
            <span className="text-sm font-medium text-amber-800">{l.test}</span>
            <StatusPill status="pending" />
          </div>
        ))}
      </div>
    </Card>
  );
}


