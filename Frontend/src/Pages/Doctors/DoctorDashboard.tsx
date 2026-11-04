
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  Stethoscope,
  AlertTriangle,
  ArrowRight,
  UserRound,
} from "lucide-react";

type Status = "Waiting" | "In Consultation" | "Completed";

type Appointment = {
  id: number;
  patient: string;
  time: string;
  specialty: string;
  status: Status;
  urgent: boolean;
};

const appointments: Appointment[] = [
  
  
];

const statusStyles: Record<Status, string> = {
  Waiting: "bg-amber-100 text-amber-700",
  "In Consultation": "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
};

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [records, setRecords] = useState(appointments);

  const stats = useMemo(
    () => [
      {
        label: "Today's Appointments",
        value: records.length,
        icon: CalendarDays,
        color: "text-[#299BCF]",
        bg: "bg-blue-50",
      },
      {
        label: "Waiting",
        value: records.filter((a) => a.status === "Waiting").length,
        icon: Clock,
        color: "text-amber-600",
        bg: "bg-amber-50",
      },
      {
        label: "In Consultation",
        value: records.filter((a) => a.status === "In Consultation").length,
        icon: Stethoscope,
        color: "text-blue-600",
        bg: "bg-blue-50",
      },
      {
        label: "Completed",
        value: records.filter((a) => a.status === "Completed").length,
        icon: CheckCircle2,
        color: "text-green-600",
        bg: "bg-green-50",
      },
    ],
    [records]
  );

  const filteredAppointments = records.filter(
    (appointment) => filter === "All" || appointment.status === filter
  );

  const urgentCases = records.filter(
    (appointment) =>
      appointment.urgent && appointment.status !== "Completed"
  );

  function startConsultation(id: number) {
    setRecords((current) =>
      current.map((appointment) =>
        appointment.id === id && appointment.status === "Waiting"
          ? { ...appointment, status: "In Consultation" }
          : appointment
      )
    );
  }

  function completeConsultation(id: number) {
    setRecords((current) =>
      current.map((appointment) =>
        appointment.id === id &&
        appointment.status === "In Consultation"
          ? { ...appointment, status: "Completed" }
          : appointment
      )
    );
  }

  const today = new Date();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-[#299BCF]">
            {today.toLocaleDateString("en-US", { weekday: "long" })}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
            Good morning, Dr. Aline!
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Here is your clinic overview for{" "}
            {today.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
            .
          </p>
        </div>

        <button
          onClick={() => navigate("/doctors/schedule")}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#299BCF] px-5 py-3 font-semibold text-white hover:bg-[#2187B5]"
        >
          <CalendarDays size={19} />
          My Schedule
          <ArrowRight size={17} />
        </button>
      </section>

      {urgentCases.length > 0 && (
        <section className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="mt-0.5 shrink-0 text-[#E51E2A]" />
          <div>
            <h2 className="font-semibold text-[#C91824]">
              Urgent case requires attention
            </h2>
            <p className="mt-1 text-sm text-red-800">
              {urgentCases.map((a) => a.patient).join(", ")}{" "}
              {urgentCases.length === 1 ? "is" : "are"} marked urgent.
              Please review the patient details and assess their condition.
            </p>
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div className={`rounded-xl p-3 ${stat.bg}`}>
                  <Icon className={stat.color} size={23} />
                </div>
                <span className="text-3xl font-bold text-gray-900">
                  {stat.value}
                </span>
              </div>
              <p className="mt-4 text-sm font-medium text-gray-500">
                {stat.label}
              </p>
            </div>
          );
        })}
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Today's Schedule
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your patient queue.
            </p>
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#299BCF]"
            aria-label="Filter appointments by status"
          >
            <option value="All">All statuses</option>
            <option value="Waiting">Waiting</option>
            <option value="In Consultation">In Consultation</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredAppointments.length === 0 ? (
            <p className="p-8 text-center text-sm text-gray-500">
              No appointments match this filter.
            </p>
          ) : (
            filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex flex-col gap-4 p-5 transition hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EAF3FC] text-[#299BCF]">
                    <UserRound size={21} />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {appointment.patient}
                      </h3>
                      {appointment.urgent &&
                        appointment.status !== "Completed" && (
                          <span className="rounded-md bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                            Urgent
                          </span>
                        )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {appointment.specialty}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={13} />
                      {appointment.time}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyles[appointment.status]}`}
                  >
                    {appointment.status}
                  </span>

                  {appointment.status === "Waiting" && (
                    <button
                      onClick={() => startConsultation(appointment.id)}
                      className="rounded-lg bg-[#299BCF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2187B5]"
                    >
                      Start
                    </button>
                  )}

                  {appointment.status === "In Consultation" && (
                    <button
                      onClick={() => completeConsultation(appointment.id)}
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                    >
                      Complete
                    </button>
                  )}

                  {appointment.status === "Completed" && (
                    <button
                      onClick={() => navigate("/doctors/consultations")}
                      className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                    >
                      View Details
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
