export default function LabsSummary({ labs }) {
  const total    = labs.length;
  const abnormal = labs.filter((l) => l.status === "abnormal").length;
  const pending  = labs.filter((l) => l.status === "pending").length;

  return (
    <div className="flex gap-3 flex-wrap">
      <div className="bg-white border border-stone-200 rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-sm">
        <span className="text-xl font-bold text-stone-800">{total}</span>
        <span className="text-xs text-stone-400 font-medium">Total</span>
      </div>
      {abnormal > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-sm">
          <span className="text-xl font-bold text-rose-600">{abnormal}</span>
          <span className="text-xs text-rose-400 font-medium">Abnormal</span>
        </div>
      )}
      {pending > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-sm">
          <span className="text-xl font-bold text-amber-600">{pending}</span>
          <span className="text-xs text-amber-400 font-medium">Pending</span>
        </div>
      )}
    </div>
  );
}



