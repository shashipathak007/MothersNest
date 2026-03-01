import Card from "../ui/Card.jsx";
import EmptyState from "../ui/EmptyState.jsx";
import Button from "../ui/Button.jsx";
import LabsSummary from "./LabsSummary.jsx";
import LabsTable from "./LabsTable.jsx";
import LabCardMobile from "./LabCardMobile.jsx";
import { getCurrentANCContact, ANC_VISIT_TESTS, ANC_SCHEDULE } from "../../utils/helpers.js";

export default function LabsTab({ patient, onAdd }) {
  const labs = patient.labs;
  const currentContact = getCurrentANCContact(patient.lmp);
  const suggestedTests = currentContact ? (ANC_VISIT_TESTS[currentContact] || []) : [];
  const contactInfo = currentContact ? ANC_SCHEDULE[currentContact - 1] : null;

  // Check which suggested tests are already done
  const doneTestNames = labs.map(l => l.test);

  return (
    <div className="space-y-4">
      {/* Suggested tests for current ANC visit */}
      {suggestedTests.length > 0 && (
        <Card className="p-4 bg-brand-50 border border-brand-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">🧪</span>
              <p className="text-xs font-bold text-brand-800 uppercase tracking-wider">
                Suggested Tests — {contactInfo?.label} ({contactInfo?.timing})
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-200 text-brand-800">
              ANC {currentContact}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {suggestedTests.map(test => {
              const done = doneTestNames.includes(test);
              return (
                <div key={test} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${done
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : "bg-white text-stone-700 border border-stone-200"
                  }`}>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${done ? "bg-emerald-500 text-white" : "bg-stone-200 text-stone-400"
                    }`}>
                    {done ? "✓" : "○"}
                  </span>
                  <span className="truncate">{test}</span>
                </div>
              );
            })}
          </div>
          {suggestedTests.some(t => !doneTestNames.includes(t)) && (
            <p className="text-[10px] text-brand-600 mt-2">
              {suggestedTests.filter(t => !doneTestNames.includes(t)).length} test{suggestedTests.filter(t => !doneTestNames.includes(t)).length > 1 ? "s" : ""} remaining for this visit
            </p>
          )}
        </Card>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <LabsSummary labs={labs} />
        <Button size="sm" onClick={onAdd}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Result
        </Button>
      </div>

      {labs.length === 0 ? (
        <Card>
          <EmptyState icon="🧪" message="No lab results yet. Click 'Add Result' to enter the first one." />
        </Card>
      ) : (
        <>
          <div className="sm:hidden space-y-2">
            {labs.map(l => <LabCardMobile key={l.id} lab={l} />)}
          </div>
          <LabsTable labs={labs} />
        </>
      )}
    </div>
  );
}
