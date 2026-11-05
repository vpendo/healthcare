
import { useEffect, useState } from "react";
import {
  CalendarDays,
  CalendarPlus,
  Clock3,
  ArrowRight,
  HeartPulse,
  CheckCircle2,
  ClipboardList,
  Loader2,
  AlertCircle,
  Stethoscope,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

interface Appointment {
  id: string;
  status: "booked" | "completed" | "cancelled";
  symptoms?: string;
  suggestedSpecialty?: string;
  urgent?: boolean;
  doctor?: {
    name?: string;
    email?: string;
    specialty?: string;
  };
  slot?: {
    id?: string;
    startTime?: string;
    endTime?: string;
  };
  createdAt?: string;
}

interface AppointmentsResponse {
  count: number;
  appointments: Appointment[];
}

export default function MyAppointments() {
  const { token, loading: authLoading } = useAuth();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAppointments = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/appointments/my`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load your appointments."
        );
      }

      const result: AppointmentsResponse = data;

      setAppointments(
        Array.isArray(result.appointments) ? result.appointments : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (!token) {
      setError("Please log in to view your appointments.");
      setLoading(false);
      return;
    }

    fetchAppointments();
  }, [token, authLoading]);

  const upcomingCount = appointments.filter(
    (appointment) => appointment.status === "booked"
  ).length;

  const completedCount = appointments.filter(
    (appointment) => appointment.status === "completed"
  ).length;

  const formatDate = (date?: string) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (date?: string) => {
    if (!date) return "Time unavailable";

    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusLabel = (status: Appointment["status"]) => {
    switch (status) {
      case "booked":
        return "Booked";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "DR";

    return name
      .replace(/^Dr\.?\s*/i, "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#F1F8FD]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={35} className="animate-spin text-[#299BCF]" />
          <p className="text-sm text-slate-500">
            Loading your appointments...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F8FD] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Page Heading */}
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-xs font-bold tracking-[0.18em] text-[#299BCF]">
              PATIENT PORTAL
            </p>

            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              My Appointments
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              View and manage your clinic visits.
            </p>
          </div>

          <Link
            to="/dashboard/book-appointment"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#299BCF] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#55B9E8] focus:outline-none focus:ring-2 focus:ring-[#55B9E8] focus:ring-offset-2"
          >
            <CalendarPlus size={18} />
            Book Appointment
          </Link>
        </section>

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-500" />
              <p className="text-sm text-red-600">{error}</p>
            </div>

            <button
              onClick={fetchAppointments}
              className="inline-flex items-center gap-2 self-start text-sm font-semibold text-red-600 hover:text-red-700"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        )}

        {/* Appointment Statistics */}
        <section
          aria-label="Appointment statistics"
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <article className="flex items-center gap-4 rounded-2xl border border-[#EAF3FC] bg-white p-5 shadow-sm">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF3FC] text-[#299BCF]">
              <CalendarDays size={23} />
            </span>

            <div>
              <p className="text-2xl font-bold text-slate-900">
                {upcomingCount}
              </p>
              <p className="text-sm text-slate-500">Upcoming visits</p>
            </div>
          </article>

          <article className="flex items-center gap-4 rounded-2xl border border-[#EAF3FC] bg-white p-5 shadow-sm">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF3FC] text-[#299BCF]">
              <CheckCircle2 size={23} />
            </span>

            <div>
              <p className="text-2xl font-bold text-slate-900">
                {completedCount}
              </p>
              <p className="text-sm text-slate-500">Completed visits</p>
            </div>
          </article>

          <article className="flex items-center gap-4 rounded-2xl border border-[#EAF3FC] bg-white p-5 shadow-sm">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF3FC] text-[#299BCF]">
              <ClipboardList size={23} />
            </span>

            <div>
              <p className="text-2xl font-bold text-slate-900">
                {appointments.length}
              </p>
              <p className="text-sm text-slate-500">Total records</p>
            </div>
          </article>
        </section>

        {/* Appointments List */}
        <section className="overflow-hidden rounded-2xl border border-[#EAF3FC] bg-white shadow-sm">

          <div className="flex items-center gap-3 border-b border-[#EAF3FC] p-5 sm:p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF3FC] text-[#299BCF]">
              <HeartPulse size={22} />
            </span>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                My Visits
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your scheduled and previous appointments.
              </p>
            </div>
          </div>

          {appointments.length > 0 ? (
            <div className="divide-y divide-[#EAF3FC]">
              {appointments.map((appointment) => {
                const doctorName =
                  appointment.doctor?.name || "Assigned Doctor";

                const specialty =
                  appointment.doctor?.specialty ||
                  appointment.suggestedSpecialty ||
                  "Medical Consultation";

                return (
                  <article
                    key={appointment.id}
                    className="flex flex-col gap-5 p-5 transition hover:bg-[#F1F8FD] sm:p-6 lg:flex-row lg:items-center"
                  >
                    {/* Doctor Information */}
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3FC] text-lg font-bold text-[#299BCF]">
                        {getInitials(doctorName)}
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900">
                          {doctorName}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {specialty}
                        </p>

                        <span className="mt-2 inline-flex rounded-lg bg-[#EAF3FC] px-2.5 py-1 text-xs font-medium text-[#299BCF]">
                          {specialty}
                        </span>
                      </div>
                    </div>

                    {/* Date and Time */}
                    <div className="flex flex-wrap gap-x-5 gap-y-3 lg:w-56 lg:flex-col lg:gap-3">
                      <span className="flex items-center gap-2 text-sm text-slate-600">
                        <CalendarDays
                          size={17}
                          className="shrink-0 text-[#299BCF]"
                        />
                        {formatDate(appointment.slot?.startTime)}
                      </span>

                      <span className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock3
                          size={17}
                          className="shrink-0 text-[#299BCF]"
                        />
                        {formatTime(appointment.slot?.startTime)}
                      </span>
                    </div>

                    {/* Appointment Status */}
                    <div className="flex items-center justify-between gap-3 lg:w-36">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                          appointment.status === "booked"
                            ? "bg-[#EAF3FC] text-[#299BCF]"
                            : appointment.status === "completed"
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-[#E51E2A]"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            appointment.status === "booked"
                              ? "bg-[#55B9E8]"
                              : appointment.status === "completed"
                                ? "bg-green-500"
                                : "bg-[#E51E2A]"
                          }`}
                        />

                        {getStatusLabel(appointment.status)}
                      </span>

                      <Link
                        to={`/dashboard/appointments/${appointment.id}`}
                        aria-label={`View ${doctorName}'s appointment`}
                        className="rounded-lg p-2 text-[#299BCF] transition hover:bg-[#EAF3FC]"
                      >
                        <ArrowRight size={18} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="px-5 py-14 text-center">
              <CalendarDays
                size={42}
                className="mx-auto text-[#55B9E8]"
              />

              <h3 className="mt-4 font-bold text-slate-900">
                No appointments yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Book your first visit to get started.
              </p>

              <Link
                to="/dashboard/book-appointment"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#299BCF] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#55B9E8]"
              >
                <CalendarPlus size={17} />
                Book Appointment
              </Link>
            </div>
          )}

          <div className="border-t border-[#EAF3FC] bg-[#F1F8FD] px-5 py-4 sm:px-6">
            <p className="text-xs leading-5 text-slate-500">
              Your appointment information is retrieved securely from FamCare.
            </p>
          </div>
        </section>

        {/* Helpful Reminder */}
        <aside className="flex flex-col gap-3 rounded-2xl border border-[#EAF3FC] bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h3 className="font-bold text-slate-900">
              Need to schedule a visit?
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Book an appointment with your preferred healthcare provider.
            </p>
          </div>

          <Link
            to="/dashboard/book-appointment"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#299BCF] px-4 py-2.5 text-sm font-semibold text-[#299BCF] transition hover:bg-[#EAF3FC]"
          >
            Book a visit
            <ArrowRight size={16} />
          </Link>
        </aside>
      </div>
    </div>
  );
}
