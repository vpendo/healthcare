
import { useState } from "react";
import { CalendarDays, Clock, Plus } from "lucide-react";

const initialSlots = [
  { id: 1, date: "2026-11-03", time: "08:30 AM", patient: "Alice Mukamana", status: "Waiting" },
  { id: 2, date: "2026-11-03", time: "09:00 AM", patient: "Jean Claude", status: "In Consultation" },
  { id: 3, date: "2026-11-03", time: "10:00 AM", patient: "Patrick Niyonzima", status: "Completed" },
  { id: 4, date: "2026-11-04", time: "09:00 AM", patient: "Diane Umutesi", status: "Waiting" },
  { id: 5, date: "2026-11-05", time: "10:30 AM", patient: "Eric Habimana", status: "Waiting" },
];

export default function MySchedule() {
  const [date, setDate] = useState("2026-11-03");
  const [filter, setFilter] = useState("All");
  const [slots, setSlots] = useState(initialSlots);
  const [start, setStart] = useState("08:00");
  const [end, setEnd] = useState("17:00");
  const [saved, setSaved] = useState(false);

  const filtered = slots.filter(
    (slot) =>
      slot.date === date &&
      (filter === "All" || slot.status === filter)
  );

  function addAvailability() {
    setSlots((current) => [
      ...current,
      {
        id: Date.now(),
        date,
        time: `${start} - ${end}`,
        patient: "Available time",
        status: "Available",
      },
    ]);
    setSaved(true);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
        <p className="mt-2 text-gray-500">
          Review appointments and manage your availability.
        </p>
      </div>

      <section className="grid gap-4 rounded-2xl bg-white p-5 shadow-sm sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Select date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setSaved(false);
            }}
            className="w-full rounded-xl border border-gray-200 p-3"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Filter by status
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full rounded-xl border border-gray-200 p-3"
          >
            <option>All</option>
            <option>Waiting</option>
            <option>In Consultation</option>
            <option>Completed</option>
            <option>Available</option>
          </select>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-5 text-xl font-bold text-gray-900">
          <CalendarDays className="mr-2 inline text-[#299BCF]" />
          Appointments
        </h2>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-gray-500">
              No appointments or availability entries for this date.
            </p>
          ) : (
            filtered.map((slot) => (
              <div
                key={slot.id}
                className="flex flex-col gap-3 rounded-xl border border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-gray-900">{slot.patient}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    <Clock size={15} className="mr-1 inline" />
                    {slot.time}
                  </p>
                </div>
                <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${
                  slot.status === "Completed"
                    ? "bg-green-100 text-green-700"
                    : slot.status === "In Consultation"
                    ? "bg-blue-100 text-blue-700"
                    : slot.status === "Available"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-amber-100 text-amber-700"
                }`}>
                  {slot.status}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">
          Manage Availability
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Add an availability block for the selected date.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Start time
            </label>
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-3"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">
              End time
            </label>
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-3"
            />
          </div>
        </div>

        <button
          onClick={addAvailability}
          disabled={!start || !end || start >= end}
          className="mt-5 flex items-center gap-2 rounded-xl bg-[#299BCF] px-5 py-3 font-semibold text-white hover:bg-[#2187B5] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={18} />
          Add Availability
        </button>

        {saved && (
          <p className="mt-3 text-sm text-green-700">
            Availability added to this page's temporary state.
          </p>
        )}
      </section>
    </div>
  );
}
