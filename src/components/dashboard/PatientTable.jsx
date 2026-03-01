import Card from "../ui/Card.jsx";
import PatientTableRow from "./PatientTableRow.jsx";

const HEADERS = ["Patient", "GA / EDD", "G·P", "Blood", "Risk", "Conditions", "Registered", ""];

export default function PatientTable({ patients }) {
  return (
    <Card className="hidden lg:block overflow-hidden">
      <table className="w-full">
        <thead className="border-b border-stone-100">
          <tr className="bg-stone-50/70">
            {HEADERS.map((h) => (
              <th
                key={h}
                className="text-left px-6 py-3.5 text-[10px] font-bold text-stone-400 uppercase tracking-widest whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-50">
          {patients.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-16 text-center text-sm text-stone-400">
                No patients match your search.
              </td>
            </tr>
          ) : (
            patients.map((p) => <PatientTableRow key={p.id} patient={p} />)
          )}
        </tbody>
      </table>
    </Card>
  );
}
