
import { useEffect, useState } from "react";
import { z } from "zod";
import {
  CalendarDays,
  Clock3,
  ShieldCheck,
  Stethoscope,
  UserRound,
  CheckCircle2,
  HeartPulse,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../Context/AuthContext";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Doctor {
  id: string;
  doctorId: string;
  name: string;
  email: string;
  specialty: string;
}

interface AvailabilitySlot {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorEmail: string;
  startTime: string;
  endTime: string;
  status: "open" | "booked" | "unavailable";
}

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  doctorId: string;
  doctorName: string;
  doctorEmail: string;
  slot: {
    id: string;
    startTime: string;
    endTime: string;
  };
  symptoms: string;
  suggestedSpecialty?: string;
  urgent: boolean;
  aiSummary?: string;
  status: string;
  queueStatus: string;
  createdAt: string;
}

interface BookingForm {
  specialty: string;
  doctor: string;
  date: string;
  time: string;
  reason: string;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const bookingSchema = z.object({
  specialty: z.string().min(1, "Please select a specialty."),
  doctor: z.string().min(1, "Please select a doctor."),
  date: z.string().min(1, "Please select a date."),
  time: z.string().min(1, "Please select an appointment time."),
  reason: z
    .string()
    .trim()
    .min(3, "Please describe your reason in at least 3 characters.")
    .max(300, "Maximum 300 characters allowed."),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatDateTime = (date: string) => {
  return new Intl.DateTimeFormat("en-RW", {
    timeZone: "Africa/Kigali",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
};

const getTodayDate = () => {
  const today = new Date();

  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BookAppointment() {
  const { token, loading: authLoading, user } = useAuth();

  const [form, setForm] = useState<BookingForm>({
    specialty: "",
    doctor: "",
    date: "",
    time: "",
    reason: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof BookingForm, string>>
  >({});

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);

  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);
  const [bookedAppointment, setBookedAppointment] =
    useState<Appointment | null>(null);

  const [slotsRefresh, setSlotsRefresh] = useState(0);

  const today = getTodayDate();

  // -------------------------------------------------------------------------
  // Load doctors
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (authLoading) return;

    if (!token) {
      setDoctorsLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchDoctors = async () => {
      try {
        setDoctorsLoading(true);
        setApiError("");

        const response = await fetch(`${API_URL}/api/doctors`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load doctors.");
        }

        setDoctors(data.doctors || []);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;

        setApiError(
          error instanceof Error
            ? error.message
            : "Unable to load doctors."
        );
      } finally {
        if (!controller.signal.aborted) {
          setDoctorsLoading(false);
        }
      }
    };

    fetchDoctors();

    return () => controller.abort();
  }, [token, authLoading]);

  // -------------------------------------------------------------------------
  // Load available slots
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!token || !form.doctor || !form.date) {
      setSlots([]);
      setSlotsLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchSlots = async () => {
      try {
        setSlotsLoading(true);
        setApiError("");

        const params = new URLSearchParams({
          doctorId: form.doctor,
          date: form.date,
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
          throw new Error(data.message || "Failed to load available times.");
        }

        setSlots(
          (data.slots || []).filter(
            (slot: AvailabilitySlot) => slot.status === "open"
          )
        );
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;

        setSlots([]);

        setApiError(
          error instanceof Error
            ? error.message
            : "Unable to load available times."
        );
      } finally {
        if (!controller.signal.aborted) {
          setSlotsLoading(false);
        }
      }
    };

    fetchSlots();

    return () => controller.abort();
  }, [token, form.doctor, form.date, slotsRefresh]);

  // -------------------------------------------------------------------------
  // Form helpers
  // -------------------------------------------------------------------------

  const updateField = <K extends keyof BookingForm>(
    field: K,
    value: BookingForm[K]
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,

      ...(field === "specialty"
        ? { doctor: "", date: "", time: "" }
        : {}),

      ...(field === "doctor"
        ? { date: "", time: "" }
        : {}),

      ...(field === "date"
        ? { time: "" }
        : {}),
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: undefined,

      ...(field === "specialty"
        ? { doctor: undefined, date: undefined, time: undefined }
        : {}),

      ...(field === "doctor"
        ? { date: undefined, time: undefined }
        : {}),

      ...(field === "date"
        ? { time: undefined }
        : {}),
    }));

    setSuccess(false);
    setBookedAppointment(null);
    setApiError("");
  };

  const selectedDoctor = doctors.find(
    (doctor) => doctor.doctorId === form.doctor
  );

  const selectedSlot = slots.find(
    (slot) => slot.id === form.time
  );

  const specialties = Array.from(
    new Set(doctors.map((doctor) => doctor.specialty))
  ).sort();

  const filteredDoctors = doctors.filter(
    (doctor) => doctor.specialty === form.specialty
  );

  // -------------------------------------------------------------------------
  // Submit appointment
  // -------------------------------------------------------------------------

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const result = bookingSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof BookingForm, string>> = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof BookingForm;

        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });

      setErrors(fieldErrors);
      setSuccess(false);
      return;
    }

    if (!token) {
      setApiError("Please log in to book an appointment.");
      return;
    }

    if (!selectedSlot || !selectedDoctor) {
      setApiError(
        "Please select a valid doctor and available appointment time."
      );
      return;
    }

    try {
      setSubmitting(true);
      setApiError("");
      setSuccess(false);

      const response = await fetch(`${API_URL}/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          slotId: selectedSlot.id,
          symptoms: result.data.reason,
          suggestedSpecialty: result.data.specialty,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setSlotsRefresh((previous) => previous + 1);

          throw new Error(
            "This appointment slot is no longer available. Please choose another time."
          );
        }

        throw new Error(
          data.message || "Unable to book your appointment."
        );
      }

      setBookedAppointment(data.appointment);
      setSuccess(true);
      setErrors({});

      // Refresh slots so the booked time disappears.
      setSlotsRefresh((previous) => previous + 1);
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Something went wrong while booking."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------------------
  // Authentication checks
  // -------------------------------------------------------------------------

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F1F8FD]">
        <p className="text-sm font-medium text-[#299BCF]">
          Loading your account...
        </p>
      </div>
    );
  }

  if (!token || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F1F8FD] p-4">
        <div className="max-w-md rounded-2xl border border-[#EAF3FC] bg-white p-8 text-center shadow-sm">
          <ShieldCheck
            size={38}
            className="mx-auto mb-4 text-[#299BCF]"
          />

          <h2 className="text-xl font-bold text-slate-900">
            Login required
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Please log in to your patient account before booking an appointment.
          </p>
        </div>
      </div>
    );
  }

  if (user.role !== "patient") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F1F8FD] p-4">
        <div className="max-w-md rounded-2xl border border-[#EAF3FC] bg-white p-8 text-center shadow-sm">
          <ShieldCheck
            size={38}
            className="mx-auto mb-4 text-[#299BCF]"
          />

          <h2 className="text-xl font-bold text-slate-900">
            Patient access only
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            This booking page is available to patient accounts.
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
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Page Heading */}
        <section>
          <p className="mb-2 text-xs font-bold tracking-[0.18em] text-[#299BCF]">
            PATIENT PORTAL
          </p>

          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Book an Appointment
          </h1>

          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Choose a doctor and a time that works for you.
          </p>
        </section>

        {/* Intro Banner */}
        <section className="flex flex-col gap-4 rounded-2xl border border-[#EAF3FC] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3FC] text-[#299BCF]">
            <HeartPulse size={30} />
          </div>

          <div className="flex-1">
            <h2 className="font-bold text-slate-900">
              Your health comes first
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Select your preferred specialty, doctor, date, and available time
              to book your appointment.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm font-medium text-[#299BCF]">
            <ShieldCheck size={19} />
            Patient care
          </div>
        </section>

        {/* Booking Form */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-[#EAF3FC] bg-white shadow-sm lg:col-span-2">

            <div className="border-b border-[#EAF3FC] p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF3FC] text-[#299BCF]">
                  <CalendarDays size={22} />
                </span>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Appointment Details
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Complete the form below.
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-5 p-5 sm:p-6"
            >

              {/* Specialty */}
              <div>
                <label
                  htmlFor="specialty"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Medical Specialty <span className="text-[#E51E2A]">*</span>
                </label>

                <select
                  id="specialty"
                  value={form.specialty}
                  onChange={(event) =>
                    updateField("specialty", event.target.value)
                  }
                  aria-invalid={Boolean(errors.specialty)}
                  disabled={doctorsLoading || doctors.length === 0}
                  className="w-full rounded-xl border border-[#EAF3FC] bg-[#F1F8FD] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#299BCF] focus:ring-2 focus:ring-[#55B9E8]/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    {doctorsLoading
                      ? "Loading specialties..."
                      : doctors.length
                        ? "Choose a specialty"
                        : "No specialties available"}
                  </option>

                  {specialties.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty.charAt(0).toUpperCase() +
                        specialty.slice(1)}
                    </option>
                  ))}
                </select>

                {errors.specialty && (
                  <p className="mt-1 text-xs text-[#E51E2A]">
                    {errors.specialty}
                  </p>
                )}
              </div>

              {/* Doctor */}
              <div>
                <label
                  htmlFor="doctor"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Select Doctor <span className="text-[#E51E2A]">*</span>
                </label>

                <div className="relative">
                  <Stethoscope
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#299BCF]"
                  />

                  <select
                    id="doctor"
                    value={form.doctor}
                    disabled={!form.specialty || doctorsLoading}
                    onChange={(event) =>
                      updateField("doctor", event.target.value)
                    }
                    aria-invalid={Boolean(errors.doctor)}
                    className="w-full rounded-xl border border-[#EAF3FC] bg-[#F1F8FD] py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#299BCF] focus:ring-2 focus:ring-[#55B9E8]/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      {form.specialty
                        ? "Choose a doctor"
                        : "Select a specialty first"}
                    </option>

                    {filteredDoctors.map((doctor) => (
                      <option
                        key={doctor.doctorId}
                        value={doctor.doctorId}
                      >
                        {doctor.name}
                      </option>
                    ))}
                  </select>
                </div>

                {form.specialty && filteredDoctors.length === 0 && (
                  <p className="mt-1 text-xs text-slate-500">
                    No doctors are registered under this specialty.
                  </p>
                )}

                {errors.doctor && (
                  <p className="mt-1 text-xs text-[#E51E2A]">
                    {errors.doctor}
                  </p>
                )}
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="date"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Appointment Date <span className="text-[#E51E2A]">*</span>
                  </label>

                  <div className="relative">
                    <CalendarDays
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#299BCF]"
                    />

                    <input
                      id="date"
                      type="date"
                      min={today}
                      value={form.date}
                      disabled={!form.doctor}
                      onChange={(event) =>
                        updateField("date", event.target.value)
                      }
                      aria-invalid={Boolean(errors.date)}
                      className="w-full min-w-0 rounded-xl border border-[#EAF3FC] bg-[#F1F8FD] py-3 pl-11 pr-3 text-sm text-slate-700 outline-none focus:border-[#299BCF] focus:ring-2 focus:ring-[#55B9E8]/30 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>

                  {errors.date && (
                    <p className="mt-1 text-xs text-[#E51E2A]">
                      {errors.date}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="time"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Available Time <span className="text-[#E51E2A]">*</span>
                  </label>

                  <div className="relative">
                    <Clock3
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#299BCF]"
                    />

                    <select
                      id="time"
                      value={form.time}
                      disabled={!form.date || slotsLoading || slots.length === 0}
                      onChange={(event) =>
                        updateField("time", event.target.value)
                      }
                      aria-invalid={Boolean(errors.time)}
                      className="w-full rounded-xl border border-[#EAF3FC] bg-[#F1F8FD] py-3 pl-11 pr-3 text-sm text-slate-700 outline-none focus:border-[#299BCF] focus:ring-2 focus:ring-[#55B9E8]/30 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="">
                        {slotsLoading
                          ? "Loading available times..."
                          : !form.date
                            ? "Select a date first"
                            : slots.length
                              ? "Choose a time"
                              : "No available times"}
                      </option>

                      {slots.map((slot) => (
                        <option key={slot.id} value={slot.id}>
                          {formatDateTime(slot.startTime)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {errors.time && (
                    <p className="mt-1 text-xs text-[#E51E2A]">
                      {errors.time}
                    </p>
                  )}

                  {form.date && !slotsLoading && slots.length === 0 && (
                    <p className="mt-1 text-xs text-slate-500">
                      No open appointments for this date. Try another date.
                    </p>
                  )}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label
                  htmlFor="reason"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Reason for Visit <span className="text-[#E51E2A]">*</span>
                </label>

                <textarea
                  id="reason"
                  rows={4}
                  maxLength={300}
                  value={form.reason}
                  onChange={(event) =>
                    updateField("reason", event.target.value)
                  }
                  placeholder="Briefly describe the reason for your visit..."
                  aria-invalid={Boolean(errors.reason)}
                  className="w-full resize-y rounded-xl border border-[#EAF3FC] bg-[#F1F8FD] px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#299BCF] focus:ring-2 focus:ring-[#55B9E8]/30"
                />

                <div className="mt-1 flex justify-between gap-3">
                  {errors.reason ? (
                    <p className="text-xs text-[#E51E2A]">
                      {errors.reason}
                    </p>
                  ) : (
                    <span className="text-xs text-slate-400">
                      At least 3 characters required.
                    </span>
                  )}

                  <span className="text-xs text-slate-400">
                    {form.reason.length}/300
                  </span>
                </div>
              </div>

              {/* API Error */}
              {apiError && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600"
                >
                  {apiError}
                </div>
              )}

              {/* Booking Confirmation */}
              {success && bookedAppointment && (
                <div
                  role="status"
                  className="rounded-xl border border-[#55B9E8] bg-[#EAF3FC] p-4 text-[#299BCF]"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      size={22}
                      className="mt-0.5 shrink-0"
                    />

                    <div className="flex-1">
                      <p className="text-sm font-bold">
                        Appointment booked successfully!
                      </p>

                      <p className="mt-1 text-xs leading-5">
                        Your appointment has been saved. Here are your booking
                        details:
                      </p>

                      <div className="mt-3 space-y-2 text-xs text-slate-700">
                        <p>
                          <strong>Doctor:</strong>{" "}
                          {bookedAppointment.doctorName}
                        </p>

                        <p>
                          <strong>Date and time:</strong>{" "}
                          {formatDateTime(
                            bookedAppointment.slot.startTime
                          )}
                        </p>

                        <p>
                          <strong>Status:</strong>{" "}
                          {bookedAppointment.status}
                        </p>

                        <p>
                          <strong>Appointment ID:</strong>{" "}
                          {bookedAppointment.id}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || doctorsLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#299BCF] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#55B9E8] focus:outline-none focus:ring-2 focus:ring-[#55B9E8] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Booking appointment..."
                  : success
                    ? "Book Another Appointment"
                    : "Book Appointment"}

                {!submitting && <ArrowRight size={18} />}
              </button>

              <p className="text-center text-xs leading-5 text-slate-400">
                Your appointment will be saved to your patient account.
              </p>
            </form>
          </section>

          {/* Side Information */}
          <aside className="space-y-5">
            <section className="rounded-2xl border border-[#EAF3FC] bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF3FC] text-[#299BCF]">
                <ShieldCheck size={25} />
              </div>

              <h2 className="font-bold text-slate-900">
                Your information matters
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Your appointment details are submitted securely using your
                authenticated patient account.
              </p>
            </section>

            <section className="rounded-2xl border border-[#EAF3FC] bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF3FC] text-[#299BCF]">
                <UserRound size={25} />
              </div>

              <h2 className="font-bold text-slate-900">
                Before your visit
              </h2>

              <ul className="mt-4 space-y-3 text-sm text-slate-500">
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    size={17}
                    className="mt-0.5 shrink-0 text-[#299BCF]"
                  />
                  Choose the correct specialty.
                </li>

                <li className="flex items-start gap-2">
                  <CheckCircle2
                    size={17}
                    className="mt-0.5 shrink-0 text-[#299BCF]"
                  />
                  Select an available appointment time.
                </li>

                <li className="flex items-start gap-2">
                  <CheckCircle2
                    size={17}
                    className="mt-0.5 shrink-0 text-[#299BCF]"
                  />
                  Provide a brief reason for your visit.
                </li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
