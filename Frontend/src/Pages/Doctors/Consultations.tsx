
import { useMemo, useState } from "react";
import { Search, ClipboardList, UserRound } from "lucide-react";

const patients = [
  {
    id: 1,
    name: "Patrick Niyonzima",
    date: "2026-11-03",
    specialty: "General Medicine",
    status: "Completed",
    notes: "Routine follow-up example",
  },
  {
    id: 2,
    name: "Jean Claude",
    date: "2026-11-03",
    specialty: "Cardiology",
    status: "In Consultation",
    notes: "Consultation in progress",
  },
  {
    id: 3,
    name: "Alice Mukamana",
    date: "2026-11-03",
    specialty: "General Medicine",
    status: "Waiting",
    notes: "Awaiting consultation",
  },
  {
    id: 4,
    name: "Grace Uwase",
    date: "2026-10-29",
    specialty: "General Medicine",
    status: "Completed",
    notes: "Previous appointment example",
  },
];

export default function Consultations() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [selected, setSelected] = useState<(typeof patients)[number] | null>(
    null
  );

  const filtered = useMemo(
    () =>
      patients.filter(
        (patient) =>
          patient.name.toLowerCase().includes(search.toLowerCase()) &&
          (status === "All" || patient.status === status)
      ),
    [search, status]
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Consultations & Patients
        </h1>
        <p className="mt-2 text-gray-500">
          Review patient appointments and consultation history.
        </p>
      </div>

      <section className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-3 text-gray-400"
            size={19}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patients by name..."
            className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none focus:border-[#299BCF]"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-gray-200 px-4 py-3"
          aria-label="Filter patient status"
        >
          <option>All</option>
          <option>Waiting</option>
          <option>In Consultation</option>
          <option>Completed</option>
        </select>
      </section>

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <h2 className="font-bold text-gray-900">
            Patient Records ({filtered.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <p className="p-8 text-center text-gray-500">
              No patients found.
            </p>
          ) : (
            filtered.map((patient) => (
              <div
                key={patient.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-[#EAF3FC] p-3 text-[#299BCF]">
                    <UserRound size={21} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {patient.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {patient.specialty} · {patient.date}
                    </p>
                    <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      patient.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : patient.status === "In Consultation"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {patient.status}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelected(patient)}
                  className="flex items-center justify-center gap-2 rounded-lg border border-[#299BCF] px-4 py-2 text-sm font-semibold text-[#299BCF] hover:bg-[#EAF3FC]"
                >
                  <ClipboardList size={17} />
                  View Details
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900">
              Patient Details
            </h2>
            <p className="mt-4 text-sm text-gray-500">Patient name</p>
            <p className="font-semibold">{selected.name}</p>
            <p className="mt-3 text-sm text-gray-500">Appointment date</p>
            <p className="font-medium">{selected.date}</p>
            <p className="mt-3 text-sm text-gray-500">Status</p>
            <p className="font-medium">{selected.status}</p>
            <p className="mt-3 text-sm text-gray-500">
              Example consultation note
            </p>
            <p className="mt-1 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
              {selected.notes}
            </p>
            <button
              onClick={() => setSelected(null)}
              className="mt-6 w-full rounded-xl bg-[#299BCF] px-4 py-3 font-semibold text-white hover:bg-[#2187B5]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
