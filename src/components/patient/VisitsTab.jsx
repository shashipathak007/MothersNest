import Card from "../ui/Card.jsx";
import EmptyState from "../ui/EmptyState.jsx";
import Button from "../ui/Button.jsx";
import VisitCard from "./VisitCard.jsx";
import { ANC_SCHEDULE, VISIT_TYPES } from "../../utils/helpers.js";

export default function VisitsTab({ visits, onAdd, missedContacts = [] }) {
  const completedContacts = ANC_SCHEDULE.filter(c =>
    visits.some(v => v.type === c.visitType || v.ancContact === c.contact)
  );

  return (
    <div className="space-y-6">
      {/* ANC tracker */}
      <Card className="p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">8-ANC Visits Tracker</p>
          <span className="text-xs font-bold text-brand-700">{completedContacts.length}/8 done</span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {ANC_SCHEDULE.map(c => {
            const done   = visits.some(v => v.type === c.visitType || v.ancContact === c.contact);
            const missed = missedContacts.some(m => m.contact === c.contact);
            return (
              <div key={c.contact}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl text-center ${
                  done   ? "bg-emerald-50 border border-emerald-200" :
                  missed ? "bg-amber-50 border border-amber-300" :
                           "bg-stone-50 border border-stone-200"
                }`}
              >
                <span className={`text-base ${done ? "text-emerald-600" : missed ? "text-amber-500" : "text-stone-300"}`}>
                  {done ? "✓" : missed ? "⏰" : "○"}
                </span>
                <span className={`text-[9px] font-bold ${done ? "text-emerald-700" : missed ? "text-amber-700" : "text-stone-400"}`}>
                  {c.label}
                </span>
                <span className={`text-[9px] leading-tight ${done ? "text-emerald-500" : missed ? "text-amber-500" : "text-stone-300"}`}>
                  {c.timing}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-500 font-medium">
          {visits.length} visit{visits.length !== 1 ? "s" : ""} recorded
        </p>
        <Button size="sm" onClick={onAdd}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Record Visit
        </Button>
      </div>

      {/* Timeline */}
      {visits.length === 0 ? (
        <Card><EmptyState icon="📋" message="No visits recorded yet. Click 'Record Visit' to add the first one." /></Card>
      ) : (
        <div className="relative">
          <div className="absolute left-5.25 top-6 bottom-6 w-px bg-stone-200" />
          <div className="space-y-3">
            {visits.map((v, i) => <VisitCard key={v.id} visit={v} isLatest={i === 0} />)}
          </div>
        </div>
      )}
    </div>
  );
}
