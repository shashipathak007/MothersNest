import Card from "../ui/Card.jsx";
import SectionLabel from "../ui/SectionLabel.jsx";

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 py-2.5 border-b border-stone-50 last:border-0">
      <span className="text-xs text-stone-400 w-36 shrink-0 pt-px">{label}</span>
      <span className="text-sm text-stone-700 flex-1 leading-relaxed">{value}</span>
    </div>
  );
}

function HabitBadge({ label, value }) {
  if (value === undefined || value === null) return null;
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${
      value ?  "bg-rose-100 text-rose-700"  : "bg-emerald-100 text-emerald-700" 
    }`}>
      <span>{value ? "✓" : "✗" }</span>
      <span>{label}</span>
    </div>
  );
}

export default function HistoryCard({
  obstetricHistory, medicalHistory, surgicalHistory,
  familyHistory, menstrualHistory, contraceptiveHistory,
  stiHistory, personalHabits,
}) {
  const hasAny = obstetricHistory || medicalHistory || surgicalHistory ||
                 familyHistory || menstrualHistory || contraceptiveHistory || stiHistory;
  const hasHabits = personalHabits && Object.keys(personalHabits).length > 0;

  if (!hasAny && !hasHabits) return null;

  return (
    <Card className="p-4">
      <SectionLabel>Clinical History</SectionLabel>

      {obstetricHistory && (
        <div className="mb-4">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Obstetric History</p>
          <p className="text-sm text-stone-700 leading-relaxed bg-stone-50 rounded-xl p-3 whitespace-pre-line">
            {obstetricHistory}
          </p>
        </div>
      )}

      
      <div className="divide-y divide-stone-50">
        <Row label="Menstrual History"       value={menstrualHistory} />
        <Row label="Contraceptive History"   value={contraceptiveHistory} />
        <Row label="Medical History"         value={medicalHistory} />
        <Row label="Surgical History"        value={surgicalHistory} />
        <Row label="Family History"          value={familyHistory} />
        <Row label="STI / HIV"               value={stiHistory} />
      </div>

      {hasHabits && (
        <div className="mt-3 pt-3 border-t border-stone-50">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Personal Habits</p>
          <div className="flex flex-wrap gap-2">
            <HabitBadge label="Smoking"  value={personalHabits.smoking} />
            <HabitBadge label="Alcohol"  value={personalHabits.alcohol} />
            <HabitBadge label="Drugs"    value={personalHabits.drugs} />
          </div>
        </div>
      )}
    </Card>
  );
}
