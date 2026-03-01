import Card from "../ui/Card.jsx";
import { StatusPill } from "../ui/Badge.jsx";
import { fmtDate } from "../../utils/helpers.js";

export default function LabsTable({ labs }) {
  return (
    <Card className="hidden sm:block overflow-hidden">
      <table className="w-full">
        <thead className="border-b border-stone-100 bg-stone-50/60">
          <tr>
            {["Test", "Date", "Value", "Unit", "Status"].map((h) => (
              <th
                key={h}
                className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-stone-400"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-50">
          {labs.map((l) => (
            <tr key={l.id} className={l.status === "abnormal" ? "bg-rose-50/40" : ""}>
              <td className={`px-5 py-3.5 text-sm font-semibold ${l.status === "abnormal" ? "text-rose-800" : "text-stone-800"}`}>
                {l.test}
              </td>
              <td className="px-5 py-3.5 text-xs text-stone-400 font-mono">{fmtDate(l.date)}</td>
              <td className={`px-5 py-3.5 text-sm font-mono font-semibold ${l.status === "abnormal" ? "text-rose-700" : "text-stone-700"}`}>
                {l.value}
              </td>
              <td className="px-5 py-3.5 text-xs text-stone-400">{l.unit || "—"}</td>
              <td className="px-5 py-3.5"><StatusPill status={l.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
