import { useState } from "react";
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

const bookingSchema = z.object({
  specialty: z.string().min(1, "Please select a specialty."),
  doctor: z.string().min(1, "Please select a doctor."),
  date: z.string().min(1, "Please select a date."),
  time: z.string().min(1, "Please select an appointment time."),
  reason: z.string().max(300, "Maximum 300 characters allowed."),
});

type BookingForm = z.infer<typeof bookingSchema>;

const doctorsBySpecialty: Record<string, string[]> = {
  General: ["Dr. Alice Uwimana", "Dr. Emmanuel Nkurunziza"],
  Cardiology: ["Dr. Jean Niyonkuru"],
  Pediatrics: ["Dr. Grace Mukamana"],
  Dental: ["Dr. Patrick Habimana"],
};

const availableTimes = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "01:00 PM",
  "02:30 PM",
  "03:30 PM",
];

export default function BookAppointment() {
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

  const [success, setSuccess] = useState(false);

  const updateField = <K extends keyof BookingForm>(
    field: K,
    value: BookingForm[K]
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
      ...(field === "specialty" ? { doctor: "" } : {}),
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: undefined,
      ...(field === "specialty" ? { doctor: undefined } : {}),
    }));

    setSuccess(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
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

    setErrors({});
    setSuccess(true);

    // Frontend preview only. No appointment is saved to a server.
    console.log("Appointment preview:", result.data);
  };

  const today = new Date();
  const minimumDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

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
              to preview your appointment request.
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

            <form onSubmit={handleSubmit} noValidate className="space-y-5 p-5 sm:p-6">

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
                  className="w-full rounded-xl border border-[#EAF3FC] bg-[#F1F8FD] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#299BCF] focus:ring-2 focus:ring-[#55B9E8]/30"
                >
                  <option value="">Choose a specialty</option>
                  {Object.keys(doctorsBySpecialty).map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
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
                    disabled={!form.specialty}
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

                    {(doctorsBySpecialty[form.specialty] ?? []).map(
                      (doctor) => (
                        <option key={doctor} value={doctor}>
                          {doctor}
                        </option>
                      )
                    )}
                  </select>
                </div>

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
                      min={minimumDate}
                      value={form.date}
                      onChange={(event) =>
                        updateField("date", event.target.value)
                      }
                      aria-invalid={Boolean(errors.date)}
                      className="w-full min-w-0 rounded-xl border border-[#EAF3FC] bg-[#F1F8FD] py-3 pl-11 pr-3 text-sm text-slate-700 outline-none focus:border-[#299BCF] focus:ring-2 focus:ring-[#55B9E8]/30"
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
                      onChange={(event) =>
                        updateField("time", event.target.value)
                      }
                      aria-invalid={Boolean(errors.time)}
                      className="w-full rounded-xl border border-[#EAF3FC] bg-[#F1F8FD] py-3 pl-11 pr-3 text-sm text-slate-700 outline-none focus:border-[#299BCF] focus:ring-2 focus:ring-[#55B9E8]/30"
                    >
                      <option value="">Choose a time</option>

                      {availableTimes.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>

                  {errors.time && (
                    <p className="mt-1 text-xs text-[#E51E2A]">
                      {errors.time}
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
                  Reason for Visit{" "}
                  <span className="font-normal text-slate-400">
                    (Optional)
                  </span>
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
                    <span />
                  )}

                  <span className="text-xs text-slate-400">
                    {form.reason.length}/300
                  </span>
                </div>
              </div>

              {/* Success Message */}
              {success && (
                <div
                  role="status"
                  className="flex items-start gap-3 rounded-xl border border-[#55B9E8] bg-[#EAF3FC] p-4 text-[#299BCF]"
                >
                  <CheckCircle2 size={21} className="mt-0.5 shrink-0" />

                  <div>
                    <p className="text-sm font-bold">
                      Booking details validated!
                    </p>

                    <p className="mt-1 text-xs leading-5">
                      This is a frontend preview only. Your appointment has
                      not been booked or saved.
                    </p>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#299BCF] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#55B9E8] focus:outline-none focus:ring-2 focus:ring-[#55B9E8] focus:ring-offset-2"
              >
                Preview Appointment
                <ArrowRight size={18} />
              </button>

              <p className="text-center text-xs leading-5 text-slate-400">
                Sample doctors and times are for demonstration only.
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
                This demo does not send your information to a server. Avoid
                entering sensitive medical details into this preview.
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
                  Select your preferred date and time.
                </li>

                <li className="flex items-start gap-2">
                  <CheckCircle2
                    size={17}
                    className="mt-0.5 shrink-0 text-[#299BCF]"
                  />
                  Review your appointment details.
                </li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
