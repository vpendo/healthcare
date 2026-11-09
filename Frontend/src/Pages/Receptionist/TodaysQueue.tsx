import { useState } from "react";
import { Search, AlertTriangle } from "lucide-react";

type Status = "Waiting" | "In Consultation" | "Done";

const TodaysQueue = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [patients, setPatients] = useState([
    {
      id: 1,
      name: "David Ishimwe",
      doctor: "Dr. Alice Uwimana",
      time: "09:00 AM",
      status: "Waiting" as Status,
      urgent: false,
      summary: "Patient reports a headache and mild fever.",
    },
    {
      id: 2,
      name: "Sarah Mutesi",
      doctor: "Dr. Jean Niyonkuru",
      time: "10:00 AM",
      status: "In Consultation" as Status,
      urgent: true,
      summary: "Patient reports chest pain. Requires immediate clinical assessment.",
    },
    {
      id: 3,
      name: "Emmanuel Nkurunziza",
      doctor: "Dr. Grace Mukamana",
      time: "11:00 AM",
      status: "Waiting" as Status,
      urgent: false,
      summary: "Patient reports a cough and sore throat.",
    },
    {
      id: 4,
      name: "Grace Mukamana",
      doctor: "Dr. Patrick Habimana",
      time: "12:00 PM",
      status: "Done" as Status,
      urgent: false,
      summary: "Patient requested a routine dental check-up.",
    },
  ]);

  const updateStatus = (id: number, status: Status) => {
    setPatients((previous) =>
      previous.map((patient) =>
        patient.id === id ? { ...patient, status } : patient
      )
    );
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(search.toLowerCase()) ||
      patient.doctor.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || patient.status === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Today's Queue</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor patients and manage their queue status.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {(["Waiting", "In Consultation", "Done"] as Status[]).map((status) => (
          <div key={status} className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{status}</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-800">
              {patients.filter((p) => p.status === status).length}
            </h2>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-3 text-gray-400"
              size={19}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patient or doctor..."
              className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none focus:border-[#299BCF]"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#299BCF]"
          >
            <option>All</option>
            <option>Waiting</option>
            <option>In Consultation</option>
            <option>Done</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b bg-[#F1F8FD] text-gray-600">
              <tr>
                <th className="p-4">Patient</th>
                <th>Doctor</th>
                <th>Time</th>
                <th>Status</th>
                <th>Update Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="border-b last:border-0">
                  <td className="p-4 font-semibold text-gray-800">
                    <div className="flex items-center gap-2">
                      {patient.name}
                      {patient.urgent && (
                        <span title="Urgent">
                          <AlertTriangle
                            size={17}
                            className="text-red-500"
                          />
                        </span>
                      )}
                    </div>
                    {patient.urgent && (
                      <p className="mt-1 text-xs text-red-500">
                        Urgent attention flagged
                      </p>
                    )}
                  </td>

                  <td className="text-gray-500">{patient.doctor}</td>
                  <td className="text-gray-500">{patient.time}</td>

                  <td>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-[#299BCF]">
                      {patient.status}
                    </span>
                  </td>

                  <td>
                    <select
                      value={patient.status}
                      onChange={(e) =>
                        updateStatus(patient.id, e.target.value as Status)
                      }
                      className="rounded-lg border border-gray-200 p-2 text-xs outline-none"
                    >
                      <option>Waiting</option>
                      <option>In Consultation</option>
                      <option>Done</option>
                    </select>
                  </td>
                </tr>
              ))}

              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No patients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
        Urgent cases require immediate escalation according to clinic
        emergency procedures. Do not leave them in the routine queue.
      </p>
    </div>
  );
};

export default TodaysQueue;