
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Clock3,
  Sparkles,
  Loader2,
  AlertCircle,
  Stethoscope,
} from "lucide-react";
import { Link } from "react-router-dom";

interface Appointment {
  _id: string;
  status: "Booked" | "Completed" | "Cancelled";
  date: string;
  time: string;
  doctor: {
    name: string;
    specialty: string;
  };
}

function FamCareLogo() {
  const heart =
    "M16 28.5C6.5 21 2 15 2 9.8 2 5.8 5 3 8.7 3c3 0 5.9 1.6 7.3 4.2C17.4 4.6 20.3 3 23.3 3 27 3 30 5.8 30 9.8 30 15 25.5 21 16 28.5Z";

  return (
    <Link
      to="/patients"
      aria-label="FamCare patient dashboard"
      className="flex shrink-0 items-center gap-2"
    >
      <svg viewBox="0 0 32 32" className="h-9 w-9" role="img">
        <defs>
          <clipPath id="fc-left">
            <rect x="0" y="0" width="16" height="32" />
          </clipPath>
          <clipPath id="fc-right">
            <rect x="16" y="0" width="16" height="32" />
          </clipPath>
        </defs>

        <path d={heart} fill="#E51E2A" clipPath="url(#fc-left)" />
        <path d={heart} fill="#55B9E8" clipPath="url(#fc-right)" />
        <rect x="12" y="7" width="5" height="13" rx="1.4" fill="#FFFFFF" />
        <rect x="8" y="11" width="13" height="5" rx="1.4" fill="#FFFFFF" />
      </svg>

      <span className="text-2xl font-extrabold tracking-tight">
        <span className="text-[#E51E2A]">Fam</span>
        <span className="text-[#299BCF]">Care</span>
      </span>
    </Link>
  );
}

export default function Dashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/appointments/my`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Unable to load your appointments.");
        }

        const data = await response.json();

        setAppointments(
          Array.isArray(data) ? data : data.appointments || []
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

    fetchAppointments();
  }, [API_URL]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingAppointments = appointments
    .filter((appointment) => {
      const appointmentDate = new Date(appointment.date);
      appointmentDate.setHours(0, 0, 0, 0);

      return (
        appointment.status === "Booked" &&
        appointmentDate >= today
      );
    })
    .sort(
      (a, b) =>
        new Date(`${a.date}T${a.time}`).getTime() -
        new Date(`${b.date}T${b.time}`).getTime()
    );

  const completedCount = appointments.filter(
    (appointment) => appointment.status === "Completed"
  ).length;

  const nextAppointment = upcomingAppointments[0];

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

  return (
    <div className="min-h-full space-y-6 bg-[#F1F8FD] p-4 text-slate-800 sm:p-6 lg:p-8">

      {/* Dashboard heading */}
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div className="space-y-3">
          <FamCareLogo />

          <div>
            <p className="mb-2 text-xs font-bold tracking-[0.18em] text-[#299BCF]">
              PATIENT PORTAL
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Welcome to your dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Here’s an overview of your health journey.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/patients/intake"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#299BCF] bg-white px-5 py-3 text-sm font-semibold text-[#299BCF] transition hover:bg-[#EAF3FC]"
          >
            <Sparkles size={18} />
            AI Symptom Intake
          </Link>

          <Link
            to="/patients/book-appointment"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E51E2A] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#C91824]"
          >
            <CalendarPlus size={18} />
            Book Appointment
          </Link>
        </div>
      </section>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Statistics */}
      <section
        aria-label="Appointment statistics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <article className="flex items-center gap-4 rounded-2xl border border-[#D7E8F5] bg-white p-5 shadow-sm sm:p-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EAF3FC] text-[#299BCF]">
            <CalendarDays size={23} />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-2xl font-bold text-slate-900">
              {loading ? "..." : upcomingAppointments.length}
            </p>
            <p className="text-sm text-slate-500">
              Upcoming appointments
            </p>
          </div>

          <span className="hidden rounded-full bg-[#EAF3FC] px-3 py-1 text-xs font-medium text-[#299BCF] md:inline-block">
            Scheduled
          </span>
        </article>

        <article className="flex items-center gap-4 rounded-2xl border border-[#D7E8F5] bg-white p-5 shadow-sm sm:p-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#E51E2A]">
            <CheckCircle2 size={23} />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-2xl font-bold text-slate-900">
              {loading ? "..." : completedCount}
            </p>
            <p className="text-sm text-slate-500">
              Completed appointments
            </p>
          </div>

          <span className="hidden rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-[#E51E2A] md:inline-block">
            All time
          </span>
        </article>
      </section>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center rounded-2xl border border-[#D7E8F5] bg-white p-12">
          <Loader2 className="animate-spin text-[#299BCF]" size={32} />
        </div>
      ) : (
        <>
          {/* Next appointment */}
          <section className="overflow-hidden rounded-2xl border border-[#D7E8F5] bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-[#EAF3FC] px-5 py-5 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Next appointment
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Your upcoming visit at a glance.
                </p>
              </div>

              <Link
                to="/patients/appointments"
                className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#299BCF] hover:text-[#E51E2A]"
              >
                View all <ArrowRight size={16} />
              </Link>
            </div>

            {nextAppointment ? (
              <article className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3FC] text-[#299BCF]">
                    <Stethoscope size={25} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900">
                      {nextAppointment.doctor?.name || "Doctor"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {nextAppointment.doctor?.specialty || "Specialty"}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={15} className="text-[#299BCF]" />
                        {formatDate(nextAppointment.date)}
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Clock3 size={15} className="text-[#299BCF]" />
                        {nextAppointment.time}
                      </span>
                    </div>
                  </div>
                </div>

                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#EAF3FC] px-3 py-1.5 text-xs font-semibold text-[#299BCF]">
                  <span className="h-2 w-2 rounded-full bg-[#55B9E8]" />
                  Booked
                </span>

                <Link
                  to={`/patients/appointments/${nextAppointment._id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E51E2A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#C91824]"
                >
                  View Details
                  <ArrowRight size={17} />
                </Link>
              </article>
            ) : (
              <div className="p-8 text-center">
                <CalendarDays
                  size={35}
                  className="mx-auto mb-3 text-[#299BCF]"
                />
                <h3 className="font-bold text-slate-900">
                  No upcoming appointments
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  You don't have any scheduled visits yet.
                </p>
                <Link
                  to="/patients/book-appointment"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#E51E2A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#C91824]"
                >
                  <CalendarPlus size={17} />
                  Book an Appointment
                </Link>
              </div>
            )}
          </section>

          {/* Upcoming appointments */}
          <section className="overflow-hidden rounded-2xl border border-[#D7E8F5] bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-[#EAF3FC] px-5 py-5 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Upcoming appointments
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Keep track of your scheduled visits.
                </p>
              </div>

              <Link
                to="/patients/appointments"
                className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#299BCF] hover:text-[#E51E2A]"
              >
                View all <ArrowRight size={16} />
              </Link>
            </div>

            {upcomingAppointments.length > 0 ? (
              <div className="divide-y divide-[#EAF3FC]">
                {upcomingAppointments.slice(0, 5).map((appointment) => (
                  <Link
                    to={`/patients/appointments/${appointment._id}`}
                    key={appointment._id}
                    className="group flex flex-col gap-4 p-5 transition hover:bg-[#F1F8FD] sm:flex-row sm:items-center sm:px-6"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EAF3FC] text-[#299BCF]">
                        <Stethoscope size={22} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-slate-900">
                          {appointment.doctor?.name || "Doctor"}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {appointment.doctor?.specialty || "Specialty"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500 sm:w-56 sm:flex-col sm:gap-2">
                      <span className="flex items-center gap-2">
                        <CalendarDays size={15} className="text-[#299BCF]" />
                        {formatDate(appointment.date)}
                      </span>

                      <span className="flex items-center gap-2">
                        <Clock3 size={15} className="text-[#299BCF]" />
                        {appointment.time}
                      </span>
                    </div>

                    <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#EAF3FC] px-3 py-1.5 text-xs font-semibold text-[#299BCF]">
                      <span className="h-2 w-2 rounded-full bg-[#55B9E8]" />
                      Booked
                    </span>

                    <ArrowRight
                      size={18}
                      className="hidden text-[#299BCF] transition group-hover:translate-x-1 sm:block"
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-slate-500">
                No upcoming appointments to display.
              </div>
            )}
          </section>
        </>
      )}

      {/* Helpful tip */}
      <aside className="flex flex-col gap-4 rounded-2xl border border-[#D7E8F5] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF3FC] text-[#299BCF]">
          <Sparkles size={21} />
        </span>

        <div className="flex-1">
          <h3 className="font-bold text-slate-900">
            Make the most of your visit
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Bring your current medications and any questions for your doctor.
          </p>
        </div>

        <Link
          to="/patients/intake"
          className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[#299BCF] hover:text-[#E51E2A]"
        >
          AI Symptom Intake <ArrowRight size={15} />
        </Link>
      </aside>

      <p className="pb-2 text-center text-xs text-slate-400">
        FamCare Patient Portal
      </p>
    </div>
  );
}
