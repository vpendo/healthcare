import { useState } from "react";
import { Search, UserRound, Phone, Mail, X } from "lucide-react";

const PatientDetails = () => {
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);

  const patients = [
    {
      id: 1,
      name: "David Ishimwe",
      email: "david@example.com",
      phone: "0788000001",
      doctor: "Dr. Alice Uwimana",
      specialty: "General Practice",
      reason: "Headache and mild fever",
    },
    {
      id: 2,
      name: "Sarah Mutesi",
      email: "sarah@example.com",
      phone: "0788000002",
      doctor: "Dr. Jean Niyonkuru",
      specialty: "Cardiology",
      reason: "Chest pain",
    },
    {
      id: 3,
      name: "Emmanuel Nkurunziza",
      email: "emmanuel@example.com",
      phone: "0788000003",
      doctor: "Dr. Grace Mukamana",
      specialty: "Pediatrics",
      reason: "Cough and sore throat",
    },
    {
      id: 4,
      name: "Grace Mukamana",
      email: "grace@example.com",
      phone: "0788000004",
      doctor: "Dr. Patrick Habimana",
      specialty: "Dental",
      reason: "Routine dental check-up",
    },
  ];

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(search.toLowerCase()) ||
      patient.email.toLowerCase().includes(search.toLowerCase())
  );

  const selected = patients.find(
    (patient) => patient.id === selectedPatient
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Patients</h1>
        <p className="mt-1 text-sm text-gray-500">
          View patient contact information and appointment details.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="relative mb-5">
          <Search
            size={19}
            className="absolute left-3 top-3 text-gray-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patients by name or email..."
            className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none focus:border-[#299BCF]"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className="rounded-xl border border-gray-100 p-5"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-[#EAF3FC] p-3 text-[#299BCF]">
                  <UserRound size={22} />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800">
                    {patient.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {patient.specialty}
                  </p>
                </div>
              </div>

              <p className="mb-2 flex items-center gap-2 text-sm text-gray-500">
                <Mail size={15} />
                {patient.email}
              </p>

              <p className="flex items-center gap-2 text-sm text-gray-500">
                <Phone size={15} />
                {patient.phone}
              </p>

              <button
                onClick={() => setSelectedPatient(patient.id)}
                className="mt-5 w-full rounded-xl bg-[#EAF3FC] py-2.5 text-sm font-semibold text-[#299BCF] hover:bg-blue-100"
              >
                View Patient Details
              </button>
            </div>
          ))}
        </div>

        {filteredPatients.length === 0 && (
          <p className="py-8 text-center text-gray-500">
            No patients found.
          </p>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                Patient Details
              </h2>

              <button
                onClick={() => setSelectedPatient(null)}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X size={21} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-semibold text-gray-800">{selected.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="font-semibold text-gray-800">{selected.email}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="font-semibold text-gray-800">{selected.phone}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Assigned Doctor</p>
                <p className="font-semibold text-gray-800">{selected.doctor}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Reason for Appointment</p>
                <p className="font-semibold text-gray-800">{selected.reason}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedPatient(null)}
              className="mt-6 w-full rounded-xl bg-[#299BCF] py-3 font-semibold text-white hover:bg-[#2388b7]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetails;