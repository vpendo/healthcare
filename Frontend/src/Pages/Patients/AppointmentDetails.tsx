
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  UserRound,
  Stethoscope,
  MapPin,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  XCircle,
  Clock3,
  AlertCircle,
  Loader2,
  CalendarCheck,
} from "lucide-react";

type Appointment = {
  _id: string;
  reference?: string;
  status: "Booked" | "Completed" | "Cancelled";
  date: string;
  time: string;
  reason?: string;
  doctor: {
    name: string;
    specialty: string;
    email?: string;
    phone?: string;
  };
  patient?: {
    name: string;
    email?: string;
    phone?: string;
  };
};

export default function AppointmentDetails() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch the patient's appointments and find the selected one.
        const response = await fetch(`${API_URL}/api/appointments/my`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Unable to load your appointments.");
        }

        const data = await response.json();

        const appointments = Array.isArray(data)
          ? data
          : data.appointments || [];

        const selected = appointments.find(
          (item: Appointment) => item._id === appointmentId
        );

        if (!selected) {
          throw new Error("Appointment not found.");
        }

        setAppointment(selected);
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

    if (appointmentId) fetchAppointment();
  }, [appointmentId, API_URL]);

  const cancelAppointment = async () => {
    if (!appointment || !appointmentId) return;

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
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to cancel appointment.");
      }

      setAppointment((previous) =>
        previous ? { ...previous, status: "Cancelled" } : previous
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to cancel appointment."
      );
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const statusStyle = {
    Booked: "bg-blue-50 text-blue-700 border-blue-200",
    Completed: "bg-green-50 text-green-700 border-green-200",
    Cancelled: "bg-red-50 text-red-700 border-red-200",
  };

  const StatusIcon = {
    Booked: Clock3,
    Completed: CheckCircle2,
    Cancelled: XCircle,
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="animate-spin text-[#299BCF]" size={35} />
      </div>
    );
  }

  if (error && !appointment) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 text-center">
        <AlertCircle size={42} className="mb-3 text-red-500" />
        <h2 className="text-xl font-bold text-[#172B4D]">
          Appointment unavailable
        </h2>
        <p className="mt-2 text-sm text-gray-500">{error}</p>
        <button
          onClick={() => navigate("/patients/appointments")}
          className="mt-5 rounded-xl bg-[#299BCF] px-5 py-3 text-sm font-semibold text-white"
        >
          Back to My Appointments
        </button>
      </div>
    );
  }

  if (!appointment) return null;

  const StatusIconComponent = StatusIcon[appointment.status];

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
            <h1 className="mt-2 text-2xl font-bold text-[#172B4D] sm:text-3xl">
              Appointment Details
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              View your booking information and appointment status.
            </p>
          </div>

          <div
            className={`flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${statusStyle[appointment.status]}`}
          >
            <StatusIconComponent size={17} />
            {appointment.status}
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
                {appointment.doctor?.specialty || "Medical Consultation"}
              </h2>

              <p className="mt-2 text-sm text-blue-50">
                With {appointment.doctor?.name || "Assigned Doctor"}
              </p>
            </div>

            <div className="rounded-xl bg-white/15 p-4">
              <p className="text-xs text-blue-50">Appointment reference</p>
              <p className="mt-1 break-all text-lg font-bold">
                {appointment.reference || appointment._id}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* Main details */}
          <div className="space-y-6 lg:col-span-2">

            {/* Date and time */}
            <section className="rounded-2xl border border-[#DCEAF3] bg-white p-6 shadow-sm">
              <h2 className="mb-5 font-bold text-[#172B4D]">
                Schedule Information
              </h2>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex gap-3">
                  <div className="h-fit rounded-xl bg-[#E8F6FC] p-3 text-[#299BCF]">
                    <CalendarDays size={22} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Appointment date</p>
                    <p className="mt-1 text-sm font-semibold text-[#172B4D]">
                      {formatDate(appointment.date)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="h-fit rounded-xl bg-[#E8F6FC] p-3 text-[#299BCF]">
                    <Clock size={22} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Appointment time</p>
                    <p className="mt-1 text-sm font-semibold text-[#172B4D]">
                      {appointment.time}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Doctor information */}
            <section className="rounded-2xl border border-[#DCEAF3] bg-white p-6 shadow-sm">
              <h2 className="mb-5 font-bold text-[#172B4D]">
                Doctor Information
              </h2>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8F6FC] text-[#299BCF]">
                  <Stethoscope size={30} />
                </div>

                <div>
                  <h3 className="font-bold text-[#172B4D]">
                    {appointment.doctor?.name || "Doctor not available"}
                  </h3>
                  <p className="mt-1 text-sm text-[#299BCF]">
                    {appointment.doctor?.specialty || "Specialty not available"}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3 border-t border-gray-100 pt-5">
                {appointment.doctor?.email && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Mail size={17} className="text-[#299BCF]" />
                    {appointment.doctor.email}
                  </div>
                )}

                {appointment.doctor?.phone && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Phone size={17} className="text-[#299BCF]" />
                    {appointment.doctor.phone}
                  </div>
                )}
              </div>
            </section>

            {/* Appointment reason */}
            <section className="rounded-2xl border border-[#DCEAF3] bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-bold text-[#172B4D]">
                Reason for Appointment
              </h2>

              <div className="flex gap-3">
                <FileText size={20} className="shrink-0 text-[#299BCF]" />
                <p className="text-sm leading-7 text-gray-600">
                  {appointment.reason || "No reason provided."}
                </p>
              </div>
            </section>
          </div>

          {/* Side information */}
          <div className="space-y-6">

            {/* Patient information */}
            <section className="rounded-2xl border border-[#DCEAF3] bg-white p-6 shadow-sm">
              <h2 className="mb-5 font-bold text-[#172B4D]">
                Patient Information
              </h2>

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F6FC] text-[#299BCF]">
                <UserRound size={24} />
              </div>

              <h3 className="font-bold text-[#172B4D]">
                {appointment.patient?.name || "Patient"}
              </h3>

              {appointment.patient?.email && (
                <p className="mt-2 break-all text-sm text-gray-500">
                  {appointment.patient.email}
                </p>
              )}

              {appointment.patient?.phone && (
                <p className="mt-2 text-sm text-gray-500">
                  {appointment.patient.phone}
                </p>
              )}
            </section>

            {/* Location */}
            <section className="rounded-2xl border border-[#DCEAF3] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <MapPin size={21} className="text-[#299BCF]" />
                <h2 className="font-bold text-[#172B4D]">
                  Clinic Location
                </h2>
              </div>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                Please contact the clinic if you need directions or
                additional information about your visit.
              </p>
            </section>

            {/* Cancellation */}
            {appointment.status === "Booked" && (
              <section className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
                <h2 className="font-bold text-[#172B4D]">
                  Cancel Appointment
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  If you cannot attend, you can cancel this booking.
                </p>

                <button
                  onClick={cancelAppointment}
                  disabled={cancelling}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                >
                  {cancelling ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <XCircle size={17} />
                  )}
                  {cancelling ? "Cancelling..." : "Cancel Appointment"}
                </button>
              </section>
            )}
          </div>
        </div>

        <p className="mt-7 text-center text-xs text-gray-400">
          FamCare · Clinic Appointment & Queue System
        </p>
      </div>
    </div>
  );
}
