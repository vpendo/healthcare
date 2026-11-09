
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  UserRound,
  Stethoscope,
  MapPin,
  Mail,
  FileText,
  CheckCircle2,
  XCircle,
  Clock3,
  AlertCircle,
  Loader2,
  CalendarCheck,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../Context/AuthContext";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Person {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
}

interface Appointment {
  id?: string;
  _id?: string;

  status: "booked" | "completed" | "cancelled";
  queueStatus?: string;

  patientId?: string | Person;
  patient?: Person;
  patientName?: string;
  patientEmail?: string;

  doctorId?: string | Person;
  doctor?: Person & {
    specialty?: string;
  };
  doctorName?: string;
  doctorEmail?: string;

  slot?: {
    id?: string;
    startTime: string;
    endTime: string;
  };

  symptoms?: string;
  suggestedSpecialty?: string;
  urgent?: boolean;
  aiSummary?: string;
  doctorNote?: string;
  createdAt?: string;
}

interface Doctor {
  doctorId: string;
  name: string;
  email: string;
  specialty: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Kigali",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

const formatTime = (date: string) => {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Kigali",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
};

const getId = (value?: string | Person) => {
  if (!value) return "";

  if (typeof value === "string") return value;

  return value.id || value._id || "";
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AppointmentDetails() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { token, loading: authLoading, user } = useAuth();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);

  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  // -------------------------------------------------------------------------
  // Fetch appointment details
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (authLoading) return;

    if (!token || !appointmentId) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchAppointment = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/appointments/my`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load your appointments."
          );
        }

        const appointments: Appointment[] = Array.isArray(data)
          ? data
          : data.appointments || [];

        const selected = appointments.find(
          (item) => (item.id || item._id) === appointmentId
        );

        if (!selected) {
          throw new Error("Appointment not found.");
        }

        setAppointment(selected);

        // Load doctor specialty using the doctor profile.
        const doctorId = getId(selected.doctorId);

        if (doctorId) {
          const doctorResponse = await fetch(
            `${API_URL}/api/doctors/${doctorId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              credentials: "include",
              signal: controller.signal,
            }
          );

          if (doctorResponse.ok) {
            const doctorData = await doctorResponse.json();
            setDoctor(doctorData.doctor || null);
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchAppointment();

    return () => controller.abort();
  }, [appointmentId, token, authLoading]);

  // -------------------------------------------------------------------------
  // Cancel appointment
  // -------------------------------------------------------------------------

  const cancelAppointment = async () => {
    if (!appointment || !appointmentId || !token) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) return;

    try {
      setCancelling(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/appointments/${appointmentId}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to cancel appointment."
        );
      }

      setAppointment((previous) =>
        previous
          ? {
              ...previous,
              status: "cancelled",
            }
          : previous
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to cancel appointment."
      );
    } finally {
      setCancelling(false);
    }
  };

  // -------------------------------------------------------------------------
  // Authentication and loading states
  // -------------------------------------------------------------------------

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#F1F8FD]">
        <Loader2
          className="animate-spin text-[#299BCF]"
          size={35}
        />
      </div>
    );
  }

  if (!token || !user) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[#F1F8FD] px-5 text-center">
        <ShieldCheck size={42} className="mb-3 text-[#299BCF]" />

        <h2 className="text-xl font-bold text-slate-900">
          Login required
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Please log in to view your appointment details.
        </p>
      </div>
    );
  }

  if (error && !appointment) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[#F1F8FD] px-5 text-center">
        <AlertCircle size={42} className="mb-3 text-red-500" />

        <h2 className="text-xl font-bold text-slate-900">
          Appointment unavailable
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          {error}
        </p>

        <button
          onClick={() => navigate("/patients/appointments")}
          className="mt-5 rounded-xl bg-[#299BCF] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#55B9E8]"
        >
          Back to My Appointments
        </button>
      </div>
    );
  }

  if (!appointment) return null;

  // -------------------------------------------------------------------------
  // Appointment data
  // -------------------------------------------------------------------------

  const appointmentStatus = appointment.status;
  const statusLabel = getStatusLabel(appointmentStatus);

  const doctorName =
    appointment.doctor?.name ||
    appointment.doctorName ||
    doctor?.name ||
    "Doctor not available";

  const doctorSpecialty =
    appointment.doctor?.specialty ||
    doctor?.specialty ||
    appointment.suggestedSpecialty ||
    "Medical Consultation";

  const doctorEmail =
    appointment.doctor?.email ||
    appointment.doctorEmail ||
    doctor?.email;

  const patientName =
    appointment.patient?.name ||
    appointment.patientName ||
    "Patient";

  const patientEmail =
    appointment.patient?.email ||
    appointment.patientEmail;

  const appointmentStart = appointment.slot?.startTime;
  const appointmentEnd = appointment.slot?.endTime;

  const appointmentReference =
    appointment.id || appointment._id || appointmentId;

  const statusStyle = {
    booked: "bg-blue-50 text-blue-700 border-blue-200",
    completed: "bg-green-50 text-green-700 border-green-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  };

  const StatusIcon = {
    booked: Clock3,
    completed: CheckCircle2,
    cancelled: XCircle,
  };

  const StatusIconComponent = StatusIcon[appointmentStatus];

  // -------------------------------------------------------------------------
  // UI
  // -------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#F1F8FD] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Back navigation */}
        <Link
          to="/patients/appointments"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#299BCF] hover:text-[#207FAE]"
        >
          <ArrowLeft size={18} />
          Back to My Appointments
        </Link>

        {/* Header */}
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-[#299BCF]">
              APPOINTMENT INFORMATION
            </p>

            <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              Appointment Details
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              View your booking information and appointment status.
            </p>
          </div>

          <div
            className={`flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${statusStyle[appointmentStatus]}`}
          >
            <StatusIconComponent size={17} />
            {statusLabel}
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Appointment summary */}
        <div className="mb-6 overflow-hidden rounded-2xl bg-[#299BCF] p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm text-blue-50">
                <CalendarCheck size={19} />
                Your appointment
              </div>

              <h2 className="text-2xl font-bold">
                {doctorSpecialty}
              </h2>

              <p className="mt-2 text-sm text-blue-50">
                With {doctorName}
              </p>
            </div>

            <div className="rounded-xl bg-white/15 p-4">
              <p className="text-xs text-blue-50">
                Appointment reference
              </p>

              <p className="mt-1 break-all text-lg font-bold">
                {appointmentReference}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* Main details */}
          <div className="space-y-6 lg:col-span-2">

            {/* Date and time */}
            <section className="rounded-2xl border border-[#EAF3FC] bg-white p-6 shadow-sm">
              <h2 className="mb-5 font-bold text-slate-900">
                Schedule Information
              </h2>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex gap-3">
                  <div className="h-fit rounded-xl bg-[#EAF3FC] p-3 text-[#299BCF]">
                    <CalendarDays size={22} />
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Appointment date
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {appointmentStart
                        ? formatDate(appointmentStart)
                        : "Date not available"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="h-fit rounded-xl bg-[#EAF3FC] p-3 text-[#299BCF]">
                    <Clock size={22} />
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Appointment time
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {appointmentStart
                        ? formatTime(appointmentStart)
                        : "Time not available"}
                    </p>

                    {appointmentEnd && (
                      <p className="mt-1 text-xs text-slate-500">
                        Ends at {formatTime(appointmentEnd)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Doctor information */}
            <section className="rounded-2xl border border-[#EAF3FC] bg-white p-6 shadow-sm">
              <h2 className="mb-5 font-bold text-slate-900">
                Doctor Information
              </h2>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF3FC] text-[#299BCF]">
                  <Stethoscope size={30} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    {doctorName}
                  </h3>

                  <p className="mt-1 text-sm text-[#299BCF]">
                    {doctorSpecialty}
                  </p>
                </div>
              </div>

              {doctorEmail && (
                <div className="mt-5 border-t border-gray-100 pt-5">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Mail size={17} className="text-[#299BCF]" />
                    {doctorEmail}
                  </div>
                </div>
              )}
            </section>

            {/* Appointment reason */}
            <section className="rounded-2xl border border-[#EAF3FC] bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-bold text-slate-900">
                Reason for Appointment
              </h2>

              <div className="flex gap-3">
                <FileText
                  size={20}
                  className="shrink-0 text-[#299BCF]"
                />

                <p className="text-sm leading-7 text-slate-600">
                  {appointment.symptoms || "No reason provided."}
                </p>
              </div>

              {appointment.aiSummary && (
                <div className="mt-5 border-t border-gray-100 pt-5">
                  <h3 className="mb-2 text-sm font-semibold text-slate-900">
                    AI Intake Summary
                  </h3>

                  <p className="text-sm leading-6 text-slate-600">
                    {appointment.aiSummary}
                  </p>
                </div>
              )}

              {appointment.doctorNote && (
                <div className="mt-5 border-t border-gray-100 pt-5">
                  <h3 className="mb-2 text-sm font-semibold text-slate-900">
                    Doctor's Note
                  </h3>

                  <p className="text-sm leading-6 text-slate-600">
                    {appointment.doctorNote}
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Side information */}
          <div className="space-y-6">

            {/* Patient information */}
            <section className="rounded-2xl border border-[#EAF3FC] bg-white p-6 shadow-sm">
              <h2 className="mb-5 font-bold text-slate-900">
                Patient Information
              </h2>

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF3FC] text-[#299BCF]">
                <UserRound size={24} />
              </div>

              <h3 className="font-bold text-slate-900">
                {patientName}
              </h3>

              {patientEmail && (
                <p className="mt-2 break-all text-sm text-slate-500">
                  {patientEmail}
                </p>
              )}
            </section>

            {/* Location */}
            <section className="rounded-2xl border border-[#EAF3FC] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <MapPin size={21} className="text-[#299BCF]" />

                <h2 className="font-bold text-slate-900">
                  Clinic Location
                </h2>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Please contact the clinic if you need directions or
                additional information about your visit.
              </p>
            </section>

            {/* Cancellation */}
            {appointmentStatus === "booked" && (
              <section className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
                <h2 className="font-bold text-slate-900">
                  Cancel Appointment
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  If you cannot attend, you can cancel this booking.
                </p>

                <button
                  onClick={cancelAppointment}
                  disabled={cancelling}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                >
                  {cancelling ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <XCircle size={17} />
                  )}

                  {cancelling
                    ? "Cancelling..."
                    : "Cancel Appointment"}
                </button>
              </section>
            )}
          </div>
        </div>

        <p className="mt-7 text-center text-xs text-slate-400">
          FamCare · Clinic Appointment & Queue System
        </p>
      </div>
    </div>
  );
}
