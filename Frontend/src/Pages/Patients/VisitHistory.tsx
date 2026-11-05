
import { useEffect, useState } from "react";
import {
  ClipboardList,
  CalendarDays,
  Clock,
  Stethoscope,
  FileText,
  AlertCircle,
  Loader2,
  History,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

interface Doctor {
  id?: string;
  _id?: string;
  name?: string;
  specialty?: string;
}

interface AppointmentSlot {
  startTime?: string;
  endTime?: string;
}

interface Appointment {
  id?: string;
  _id?: string;
  status?: string;
  queueStatus?: string;
  symptoms?: string;
  doctorNote?: string;
  visitNote?: string;
  notes?: string;
  createdAt?: string;
  doctor?: Doctor;
  slot?: AppointmentSlot;
}

function formatDate(date?: string) {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(date?: string) {
  if (!date) return "Time unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Time unavailable";
  }

  return parsedDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function VisitHistory() {
  const { token } = useAuth();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchVisitHistory() {
      if (!token) {
        setLoading(false);
        setError("Please log in to view your visit history.");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/appointments/my`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load your visit history."
          );
        }

        const allAppointments: Appointment[] =
          data.appointments || [];

        // Show completed appointments only.
        const completedVisits = allAppointments
          .filter(
            (appointment) =>
              appointment.status?.toLowerCase() === "completed" ||
              appointment.queueStatus?.toLowerCase() === "done"
          )
          .sort((a, b) => {
            const dateA = new Date(
              a.slot?.startTime || a.createdAt || 0
            ).getTime();

            const dateB = new Date(
              b.slot?.startTime || b.createdAt || 0
            ).getTime();

            return dateB - dateA;
          });

        setAppointments(completedVisits);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchVisitHistory();
  }, [token]);

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#299BCF]">
            <History size={17} />
            Patient Portal
          </div>

          <h1 className="text-2xl font-extrabold text-slate-800 sm:text-3xl">
            Visit History
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            View your previous consultations and medical visit notes.
          </p>
        </div>

        <Link
          to="/patients/appointments"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D7E8F5] bg-white px-4 py-3 text-sm font-semibold text-[#299BCF] transition hover:bg-[#EAF3FC]"
        >
          My Appointments
          <ArrowRight size={17} />
        </Link>
      </div>

      {/* Summary */}
      <div className="rounded-2xl border border-[#D7E8F5] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF3FC] text-[#299BCF]">
            <ClipboardList size={24} />
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Completed Visits
            </p>

            <p className="text-2xl font-extrabold text-slate-800">
              {loading ? "—" : appointments.length}
            </p>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#D7E8F5] bg-white py-16">
          <Loader2
            size={32}
            className="animate-spin text-[#299BCF]"
          />
          <p className="mt-3 text-sm text-slate-500">
            Loading your visit history...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle size={21} />
            <p className="text-sm font-semibold">{error}</p>
          </div>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-[#E51E2A] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#C91824]"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && appointments.length === 0 && (
        <div className="rounded-2xl border border-[#D7E8F5] bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF3FC] text-[#299BCF]">
            <History size={30} />
          </div>

          <h2 className="mt-5 text-lg font-bold text-slate-800">
            No visit history yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Your completed consultations will appear here after
            your doctor finishes your appointment.
          </p>

          <Link
            to="/patients/book-appointment"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#299BCF] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2186B5]"
          >
            Book an Appointment
            <ArrowRight size={17} />
          </Link>
        </div>
      )}

      {/* Completed appointments */}
      {!loading && !error && appointments.length > 0 && (
        <div className="space-y-4">
          {appointments.map((appointment) => {
            const appointmentId =
              appointment.id || appointment._id || "";

            const doctorName =
              appointment.doctor?.name || "Doctor";

            const specialty =
              appointment.doctor?.specialty || "General Medicine";

            const visitNote =
              appointment.doctorNote ||
              appointment.visitNote ||
              appointment.notes;

            return (
              <div
                key={appointmentId}
                className="overflow-hidden rounded-2xl border border-[#D7E8F5] bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-4 p-5 sm:p-6">
                  {/* Doctor and status */}
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EAF3FC] text-[#299BCF]">
                        <Stethoscope size={23} />
                      </div>

                      <div>
                        <h2 className="font-bold text-slate-800">
                          Dr. {doctorName}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          {specialty}
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex w-fit items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      Completed
                    </span>
                  </div>

                  <div className="grid gap-4 border-y border-[#EAF3FC] py-4 sm:grid-cols-2">
                    <div className="flex items-center gap-3">
                      <CalendarDays
                        size={19}
                        className="text-[#299BCF]"
                      />

                      <div>
                        <p className="text-xs text-slate-400">
                          Visit Date
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {formatDate(appointment.slot?.startTime)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock
                        size={19}
                        className="text-[#299BCF]"
                      />

                      <div>
                        <p className="text-xs text-slate-400">
                          Visit Time
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {formatTime(appointment.slot?.startTime)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Symptoms */}
                  {appointment.symptoms && (
                    <div>
                      <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                        <FileText
                          size={17}
                          className="text-[#299BCF]"
                        />
                        Reported Symptoms
                      </h3>

                      <p className="text-sm leading-6 text-slate-500">
                        {appointment.symptoms}
                      </p>
                    </div>
                  )}

                  {/* Doctor's note */}
                  <div className="rounded-xl bg-[#F1F8FD] p-4">
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                      <ClipboardList
                        size={17}
                        className="text-[#299BCF]"
                      />
                      Doctor's Visit Notes
                    </h3>

                    <p className="text-sm leading-6 text-slate-600">
                      {visitNote ||
                        "No visit notes have been added yet."}
                    </p>
                  </div>

                  {appointmentId && (
                    <div className="flex justify-end">
                      <Link
                        to={`/patients/appointments/${appointmentId}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#299BCF] transition hover:text-[#E51E2A]"
                      >
                        View Details
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
