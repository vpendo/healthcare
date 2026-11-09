
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
  RefreshCw,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

interface Appointment {
  id: string;
  status: "booked" | "completed" | "cancelled";
  queueStatus?: string;
  symptoms?: string;
  suggestedSpecialty?: string;
  urgent?: boolean;
  doctor?: {
    id?: string;
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

interface AvailabilitySlot {
  id: string;
  doctorId: string;
  startTime: string;
  endTime: string;
  status: "open" | "booked" | "unavailable";
}

export default function MyAppointments() {
  const { token, loading: authLoading } = useAuth();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSymptoms, setEditSymptoms] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Action feedback
  const [savingSymptoms, setSavingSymptoms] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  const getTodayDate = () => {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Africa/Kigali",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());

    const year = parts.find((part) => part.type === "year")?.value;
    const month = parts.find((part) => part.type === "month")?.value;
    const day = parts.find((part) => part.type === "day")?.value;

    return `${year}-${month}-${day}`;
  };

  const formatDate = (date?: string) => {
    if (!date) return "Date unavailable";

    return new Intl.DateTimeFormat("en-RW", {
      timeZone: "Africa/Kigali",
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  };

  const formatTime = (date?: string) => {
    if (!date) return "Time unavailable";

    return new Intl.DateTimeFormat("en-RW", {
      timeZone: "Africa/Kigali",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(date));
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

  // -------------------------------------------------------------------------
  // Load appointments
  // -------------------------------------------------------------------------

  const fetchAppointments = async (showLoader = true) => {
    if (!token) return;

    try {
      if (showLoader) setLoading(true);
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
      if (showLoader) setLoading(false);
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

  // -------------------------------------------------------------------------
  // Load available slots when a rescheduling date is selected
  // -------------------------------------------------------------------------

  const editingAppointment = appointments.find(
    (appointment) => appointment.id === editingId
  );

  useEffect(() => {
    if (
      !token ||
      !editingAppointment?.doctor?.id ||
      !rescheduleDate
    ) {
      setAvailableSlots([]);
      setSlotsLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchAvailableSlots = async () => {
      try {
        setSlotsLoading(true);
        setActionError("");
        setAvailableSlots([]);
        setSelectedSlotId("");

        const params = new URLSearchParams({
          doctorId: editingAppointment.doctor!.id!,
          date: rescheduleDate,
        });

        const response = await fetch(
          `${API_URL}/api/slots?${params.toString()}`,
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
            data.message || "Unable to load available appointment times."
          );
        }

        setAvailableSlots(
          (data.slots || []).filter(
            (slot: AvailabilitySlot) =>
              slot.status === "open" &&
              new Date(slot.startTime).getTime() > Date.now()
          )
        );
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setActionError(
          err instanceof Error
            ? err.message
            : "Unable to load available times."
        );
      } finally {
        if (!controller.signal.aborted) {
          setSlotsLoading(false);
        }
      }
    };

    fetchAvailableSlots();

    return () => controller.abort();
  }, [token, editingId, rescheduleDate]);

  // -------------------------------------------------------------------------
  // Open and close editor
  // -------------------------------------------------------------------------

  const openEditor = (appointment: Appointment) => {
    setEditingId(appointment.id);
    setEditSymptoms(appointment.symptoms || "");
    setRescheduleDate("");
    setAvailableSlots([]);
    setSelectedSlotId("");
    setActionError("");
    setActionSuccess("");
  };

  const closeEditor = () => {
    setEditingId(null);
    setEditSymptoms("");
    setRescheduleDate("");
    setAvailableSlots([]);
    setSelectedSlotId("");
    setActionError("");
    setActionSuccess("");
  };

  // -------------------------------------------------------------------------
  // Update appointment symptoms
  // -------------------------------------------------------------------------

  const handleUpdateSymptoms = async () => {
    if (!token || !editingId) return;

    const symptoms = editSymptoms.trim();

    if (symptoms.length < 3) {
      setActionError("Please enter at least 3 characters.");
      return;
    }

    if (symptoms.length > 300) {
      setActionError("Symptoms cannot exceed 300 characters.");
      return;
    }

    try {
      setSavingSymptoms(true);
      setActionError("");
      setActionSuccess("");

      const response = await fetch(
        `${API_URL}/api/appointments/${editingId}/symptoms`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({ symptoms }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update your appointment reason."
        );
      }

      setActionSuccess("Your appointment reason was updated successfully.");

      await fetchAppointments(false);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Unable to update your appointment."
      );
    } finally {
      setSavingSymptoms(false);
    }
  };

  // -------------------------------------------------------------------------
  // Reschedule appointment
  // -------------------------------------------------------------------------

  const handleReschedule = async () => {
    if (!token || !editingId) return;

    if (!selectedSlotId) {
      setActionError("Please select an available appointment time.");
      return;
    }

    try {
      setSavingSchedule(true);
      setActionError("");
      setActionSuccess("");

      const response = await fetch(
        `${API_URL}/api/appointments/${editingId}/reschedule`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({
            slotId: selectedSlotId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to reschedule your appointment."
        );
      }

      setActionSuccess("Your appointment was rescheduled successfully.");

      setRescheduleDate("");
      setSelectedSlotId("");
      setAvailableSlots([]);

      await fetchAppointments(false);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Unable to reschedule your appointment."
      );
    } finally {
      setSavingSchedule(false);
    }
  };

  // -------------------------------------------------------------------------
  // Statistics
  // -------------------------------------------------------------------------

  const upcomingCount = appointments.filter(
    (appointment) =>
      appointment.status === "booked" &&
      appointment.slot?.startTime &&
      new Date(appointment.slot.startTime).getTime() > Date.now()
  ).length;

  const completedCount = appointments.filter(
    (appointment) => appointment.status === "completed"
  ).length;

  // -------------------------------------------------------------------------
  // Loading state
  // -------------------------------------------------------------------------

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

  // -------------------------------------------------------------------------
  // UI
  // -------------------------------------------------------------------------

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
            to="/patients/book-appointment"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#299BCF] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#55B9E8]"
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
              onClick={() => fetchAppointments()}
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

                const canEdit =
                  appointment.status === "booked" &&
                  appointment.queueStatus === "not_arrived";

                const isEditing = editingId === appointment.id;

                return (
                  <article
                    key={appointment.id}
                    className="p-5 transition hover:bg-[#F1F8FD] sm:p-6"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center">

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
                          <CalendarDays size={17} className="shrink-0 text-[#299BCF]" />
                          {formatDate(appointment.slot?.startTime)}
                        </span>

                        <span className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock3 size={17} className="shrink-0 text-[#299BCF]" />
                          {formatTime(appointment.slot?.startTime)}
                        </span>
                      </div>

                      {/* Status and Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 lg:w-56">
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

                        <div className="flex items-center gap-1">
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() =>
                                isEditing
                                  ? closeEditor()
                                  : openEditor(appointment)
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-[#299BCF] transition hover:bg-[#EAF3FC]"
                            >
                              {isEditing ? (
                                <>
                                  <X size={16} />
                                  Close
                                </>
                              ) : (
                                <>
                                  <Pencil size={16} />
                                  Edit
                                </>
                              )}
                            </button>
                          )}

                          <Link
                            to={`/patients/appointments/${appointment.id}`}
                            aria-label={`View ${doctorName}'s appointment`}
                            className="rounded-lg p-2 text-[#299BCF] transition hover:bg-[#EAF3FC]"
                          >
                            <ArrowRight size={18} />
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Edit and Reschedule Section */}
                    {isEditing && (
                      <div className="mt-6 space-y-5 rounded-2xl border border-[#EAF3FC] bg-[#F1F8FD] p-4 sm:p-5">

                        <div>
                          <h3 className="font-bold text-slate-900">
                            Manage Appointment
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            Update your reason for visiting or choose another
                            available appointment time with {doctorName}.
                          </p>
                        </div>

                        {/* Symptoms */}
                        <div>
                          <label
                            htmlFor={`symptoms-${appointment.id}`}
                            className="mb-2 block text-sm font-semibold text-slate-700"
                          >
                            Reason for Visit
                          </label>

                          <textarea
                            id={`symptoms-${appointment.id}`}
                            rows={3}
                            maxLength={300}
                            value={editSymptoms}
                            onChange={(event) =>
                              setEditSymptoms(event.target.value)
                            }
                            placeholder="Describe the reason for your visit..."
                            className="w-full rounded-xl border border-[#EAF3FC] bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#299BCF] focus:ring-2 focus:ring-[#55B9E8]/30"
                          />

                          <div className="mt-1 flex justify-between text-xs text-slate-400">
                            <span>At least 3 characters required.</span>
                            <span>{editSymptoms.length}/300</span>
                          </div>

                          <button
                            type="button"
                            onClick={handleUpdateSymptoms}
                            disabled={savingSymptoms || savingSchedule}
                            className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-[#299BCF] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#55B9E8] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {savingSymptoms ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Save size={16} />
                            )}

                            {savingSymptoms ? "Saving..." : "Save Reason"}
                          </button>
                        </div>

                        <div className="border-t border-[#DCECF8]" />

                        {/* Reschedule */}
                        <div>
                          <h4 className="mb-3 font-semibold text-slate-800">
                            Reschedule Appointment
                          </h4>

                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                              <label
                                htmlFor={`date-${appointment.id}`}
                                className="mb-2 block text-sm font-semibold text-slate-700"
                              >
                                New Appointment Date
                              </label>

                              <input
                                id={`date-${appointment.id}`}
                                type="date"
                                min={getTodayDate()}
                                value={rescheduleDate}
                                onChange={(event) => {
                                  setRescheduleDate(event.target.value);
                                  setSelectedSlotId("");
                                  setActionError("");
                                  setActionSuccess("");
                                }}
                                className="w-full rounded-xl border border-[#EAF3FC] bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#299BCF] focus:ring-2 focus:ring-[#55B9E8]/30"
                              />
                            </div>

                            <div>
                              <label
                                htmlFor={`time-${appointment.id}`}
                                className="mb-2 block text-sm font-semibold text-slate-700"
                              >
                                Available Time
                              </label>

                              <select
                                id={`time-${appointment.id}`}
                                value={selectedSlotId}
                                onChange={(event) =>
                                  setSelectedSlotId(event.target.value)
                                }
                                disabled={
                                  !rescheduleDate ||
                                  slotsLoading ||
                                  availableSlots.length === 0
                                }
                                className="w-full rounded-xl border border-[#EAF3FC] bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#299BCF] focus:ring-2 focus:ring-[#55B9E8]/30 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <option value="">
                                  {slotsLoading
                                    ? "Loading available times..."
                                    : !rescheduleDate
                                      ? "Select a date first"
                                      : availableSlots.length
                                        ? "Choose a time"
                                        : "No available times"}
                                </option>

                                {availableSlots.map((slot) => (
                                  <option key={slot.id} value={slot.id}>
                                    {formatTime(slot.startTime)}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {rescheduleDate &&
                            !slotsLoading &&
                            availableSlots.length === 0 && (
                              <p className="mt-2 text-xs text-slate-500">
                                No available appointments on this date.
                                Please choose another date.
                              </p>
                            )}

                          <button
                            type="button"
                            onClick={handleReschedule}
                            disabled={
                              savingSchedule ||
                              savingSymptoms ||
                              !selectedSlotId
                            }
                            className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl border border-[#299BCF] px-4 py-2.5 text-sm font-semibold text-[#299BCF] transition hover:bg-[#EAF3FC] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {savingSchedule ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <CalendarDays size={16} />
                            )}

                            {savingSchedule
                              ? "Rescheduling..."
                              : "Confirm Reschedule"}
                          </button>
                        </div>

                        {/* Action Feedback */}
                        {actionError && (
                          <div
                            role="alert"
                            className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600"
                          >
                            {actionError}
                          </div>
                        )}

                        {actionSuccess && (
                          <div
                            role="status"
                            className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700"
                          >
                            {actionSuccess}
                          </div>
                        )}
                      </div>
                    )}
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
                to="/patients/book-appointment"
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
            to="/patients/book-appointment"
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
