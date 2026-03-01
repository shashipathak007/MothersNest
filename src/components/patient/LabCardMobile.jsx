import Card from "../ui/Card.jsx";
import { StatusPill } from "../ui/Badge.jsx";
import { fmtDate } from "../../utils/helpers.js";

export default function LabCardMobile({ lab }) {
  const isAbnormal = lab.status === "abnormal";

  return (
    <Card className={`p-4 ${isAbnormal ? "border-rose-200 bg-rose-50/30" : ""}`}>
      <div className="flex items-center justify-between mb-1">
        <span className={`font-semibold text-sm ${isAbnormal ? "text-rose-800" : "text-stone-800"}`}>
          {lab.test}
        </span>
        <StatusPill status={lab.status} />
      </div>
      <div className="flex items-center gap-2 text-xs text-stone-400">
        <span className={`font-mono font-semibold ${isAbnormal ? "text-rose-700" : "text-stone-600"}`}>
          {lab.value} {lab.unit}
        </span>
        <span>·</span>
        <span>{fmtDate(lab.date)}</span>
      </div>
    </Card>
  );
}



