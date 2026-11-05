import { useState } from "react";
import { Search, CalendarDays } from "lucide-react";

const Appointments = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const appointments = [
    {
      id: 1,
      patient: "David Ishimwe",
      doctor: "Dr. Alice Uwimana",
      specialty: "General Practice",
      date: "Nov 04, 2026",
      time: "09:00 AM",
      status: "Confirmed",
    },
    {
      id: 2,
      patient: "Sarah Mutesi",
      doctor: "Dr. Jean Niyonkuru",
      specialty: "Cardiology",
      date: "Nov 04, 2026",
      time: "10:00 AM",
      status: "In Progress",
    },
    {
      id: 3,
      patient: "Emmanuel Nkurunziza",
      doctor: "Dr. Grace Mukamana",
      specialty: "Pediatrics",
      date: "Nov 04, 2026",
      time: "11:00 AM",
      status: "Confirmed",
    },
    {
      id: 4,
      patient: "Patrick Habimana",
      doctor: "Dr. Alice Uwimana",
      specialty: "General Practice",
      date: "Nov 05, 2026",
      time: "02:00 PM",
      status: "Completed",
    },
  ];

  const filtered = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.patient.toLowerCase().includes(search.toLowerCase()) ||
      appointment.doctor.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      status === "All" || appointment.status === status;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage patient appointments.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Appointments", value: appointments.length },
          {
            label: "Confirmed",
            value: appointments.filter((a) => a.status === "Confirmed").length,
          },
          {
            label: "Completed",
            value: appointments.filter((a) => a.status === "Completed").length,
          },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{item.label}</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-800">
              {item.value}
            </h2>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-3 top-3 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patient or doctor..."
              className="w-full rounded-xl border border-gray-200 py-3 pl-10 outline-none focus:border-[#299BCF]"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none"
          >
            <option>All</option>
            <option>Confirmed</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b bg-[#F1F8FD] text-gray-500">
              <tr>
                <th className="p-4">Patient</th>
                <th>Doctor</th>
                <th>Specialty</th>
                <th>Date & Time</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((appointment) => (
                <tr key={appointment.id} className="border-b last:border-0">
                  <td className="p-4 font-semibold text-gray-800">
                    {appointment.patient}
                  </td>
                  <td className="text-gray-600">{appointment.doctor}</td>
                  <td className="text-gray-600">{appointment.specialty}</td>
                  <td>
                    <div className="flex items-center gap-2 text-gray-600">
                      <CalendarDays size={16} />
                      {appointment.date}, {appointment.time}
                    </div>
                  </td>
                  <td>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-[#299BCF]">
                      {appointment.status}
                    </span>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No appointments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Appointments;