import { RISK_CONFIG, TAG_PILL, STATUS_PILL } from "../../utils/helpers.js";

export function RiskBadge({ level }) {
  const c = RISK_CONFIG[level] ?? RISK_CONFIG.low;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.75 rounded-full text-[11px] font-semibold ${c.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  );
}

export function TagChip({ label }) {
  const cls = TAG_PILL[label] ?? "bg-stone-100 text-stone-600 ring-1 ring-stone-200";
  return (
    <span className={`inline-block px-2 py-0.75 rounded-md text-[11px] font-medium ${cls}`}>
      {label}
    </span>
  );
}

export function StatusPill({ status }) {
  const cls = STATUS_PILL[status] ?? STATUS_PILL.normal;
  return (
    <span className={`inline-block px-2.5 py-0.75 rounded-full text-[10px] font-bold uppercase tracking-wide ${cls}`}>
      {status}
    </span>
  );
}
