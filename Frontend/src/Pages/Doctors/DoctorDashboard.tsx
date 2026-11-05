
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  Stethoscope,
  AlertTriangle,
  ArrowRight,
  UserRound,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

type Status = "Not Arrived" | "Waiting" | "In Consultation" | "Completed";

type Appointment = {
  id: string;
  patient: string;
  time: string;
  specialty: string;
  status: Status;
  urgent: boolean;
};

type QueueApiAppointment = {
  id: string;
  patient: {
    id: string;
    name: string;
    email: string;
  } | null;
  slot: {
    id: string;
    startTime: string;
    endTime: string;
  } | null;
  symptoms: string;
  suggestedSpecialty?: string;
  urgent: boolean;
  queueStatus: "not_arrived" | "waiting" | "in_consultation" | "done";
};

const statusStyles: Record<Status, string> = {
  "Not Arrived": "bg-gray-100 text-gray-700",
  Waiting: "bg-amber-100 text-amber-700",
  "In Consultation": "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
};

function formatStatus(status: QueueApiAppointment["queueStatus"]): Status {
  const statusMap: Record<QueueApiAppointment["queueStatus"], Status> = {
    not_arrived: "Not Arrived",
    waiting: "Waiting",
    in_consultation: "In Consultation",
    done: "Completed",
  };

  return statusMap[status];
}

function formatTime(startTime?: string) {
  if (!startTime) return "Time unavailable";

  const date = new Date(startTime);

  if (Number.isNaN(date.getTime())) return "Time unavailable";

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { user, token, loading: authLoading } = useAuth();

  const [filter, setFilter] = useState("All");
  const [records, setRecords] = useState<Appointment[]>([]);
  const [doctorSpecialty, setDoctorSpecialty] = useState("");
  const [queueLoading, setQueueLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const today = new Date();
  const firstName = user?.name?.trim().split(/\s+/)[0] || "Doctor";

  // Fetch today's appointments and the doctor's profile.
  const fetchQueue = useCallback(
    async (showLoader = true) => {
      if (!token || !user?.id) {
        setQueueLoading(false);
        return;
      }

      if (showLoader) setQueueLoading(true);
      setError("");

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [queueResponse, profileResponse] = await Promise.all([
          fetch(
            `${API_URL}/api/queue/today?date=${getTodayDate()}`,
            { headers }
          ),
          fetch(`${API_URL}/api/doctors/${user.id}`, { headers }),
        ]);

        if (!queueResponse.ok) {
          const data = await queueResponse.json();
          throw new Error(data.message || "Failed to load appointments.");
        }

        const queueData = await queueResponse.json();

        // The profile is optional; the queue should still load if it fails.
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setDoctorSpecialty(profileData.doctor?.specialty || "");
        }

        const formattedAppointments: Appointment[] = (
          queueData.queue as QueueApiAppointment[]
        ).map((appointment) => ({
          id: appointment.id,
          patient: appointment.patient?.name || "Unknown patient",
          time: formatTime(appointment.slot?.startTime),
          specialty:
            doctorSpecialty ||
            appointment.suggestedSpecialty ||
            "Consultation",
          status: formatStatus(appointment.queueStatus),
          urgent: appointment.urgent,
        }));

        setRecords(formattedAppointments);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading appointments."
        );
      } finally {
        setQueueLoading(false);
      }
    },
    [token, user?.id, doctorSpecialty]
  );

  useEffect(() => {
    void fetchQueue();

    const interval = window.setInterval(() => {
      void fetchQueue(false);
    }, 30000);

    return () => window.clearInterval(interval);
  }, [fetchQueue]);

  // Update an appointment's queue status through the backend.
  async function updateAppointment(
    id: string,
    queueStatus: "in_consultation" | "done"
  ) {
    if (!token) return;

    setUpdatingId(id);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/queue/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ queueStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update appointment.");
      }

      await fetchQueue(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update appointment."
      );
    } finally {
      setUpdatingId(null);
    }
  }

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
    (appointment) =>
      filter === "All" || appointment.status === filter
  );

  const urgentCases = records.filter(
    (appointment) =>
      appointment.urgent && appointment.status !== "Completed"
  );

  if (authLoading || queueLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-[#299BCF]">
            {today.toLocaleDateString("en-US", {
              weekday: "long",
            })}
          </p>

          <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
            Welcome, Dr. {firstName}!
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

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
          <button
            onClick={() => void fetchQueue()}
            className="ml-2 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

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
            <option value="Not Arrived">Not Arrived</option>
            <option value="Waiting">Waiting</option>
            <option value="In Consultation">In Consultation</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredAppointments.length === 0 ? (
            <p className="p-8 text-center text-sm text-gray-500">
              {records.length === 0
                ? "You have no appointments scheduled for today."
                : "No appointments match this filter."}
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
                      disabled={updatingId === appointment.id}
                      onClick={() =>
                        void updateAppointment(
                          appointment.id,
                          "in_consultation"
                        )
                      }
                      className="rounded-lg bg-[#299BCF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2187B5] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updatingId === appointment.id ? "Updating..." : "Start"}
                    </button>
                  )}

                  {appointment.status === "In Consultation" && (
                    <button
                      disabled={updatingId === appointment.id}
                      onClick={() =>
                        void updateAppointment(appointment.id, "done")
                      }
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updatingId === appointment.id
                        ? "Updating..."
                        : "Complete"}
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
