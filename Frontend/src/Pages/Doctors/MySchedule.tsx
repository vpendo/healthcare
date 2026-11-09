import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useAuth } from "../../Context/AuthContext";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

interface AvailabilitySlot {
  id: string;
  startTime: string;
  endTime: string;
  status: "open" | "booked" | "unavailable";
}

interface ScheduleEntry {
  id: string;
  time: string;
  sortTime: number;
  patient: string;
  status: string;
  type: "appointment" | "availability";
  slot?: AvailabilitySlot;
}

interface QueueAppointment {
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
  queueStatus: string;
  status: string;
}

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getLocalDateTime(dateString: string) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`,
  };
}

function getAppointmentStatus(appointment: QueueAppointment) {
  if (
    appointment.status === "completed" ||
    appointment.queueStatus === "done"
  ) {
    return "Completed";
  }

  const statuses: Record<string, string> = {
    waiting: "Waiting",
    not_arrived: "Not Arrived",
    in_consultation: "In Consultation",
    done: "Completed",
  };

  return statuses[appointment.queueStatus] || "Waiting";
}

function getErrorMessage(data: { message?: string }) {
  return data.message || "Something went wrong. Please try again.";
}

export default function MySchedule() {
  const { user, token } = useAuth();

  const [date, setDate] = useState(getTodayDate());
  const [filter, setFilter] = useState("All");
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);

  const [start, setStart] = useState("08:00");
  const [end, setEnd] = useState("17:00");

  const [editingSlot, setEditingSlot] =
    useState<AvailabilitySlot | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSchedule = useCallback(async () => {
    if (!token || !user?.id) {
      setError("Please log in to view your schedule.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [slotsResponse, queueResponse] = await Promise.all([
        fetch(
          `${API_URL}/api/slots?doctorId=${encodeURIComponent(
            user.id
          )}&date=${date}`,
          { headers }
        ),
        fetch(`${API_URL}/api/queue/today?date=${date}`, { headers }),
      ]);

      const slotsData = await slotsResponse.json();
      const queueData = await queueResponse.json();

      if (!slotsResponse.ok) {
        throw new Error(getErrorMessage(slotsData));
      }

      if (!queueResponse.ok) {
        throw new Error(getErrorMessage(queueData));
      }

      const availability: AvailabilitySlot[] = slotsData.slots || [];
      const appointments: QueueAppointment[] = queueData.queue || [];

      const availabilityEntries: ScheduleEntry[] = availability
        .filter((slot) => slot.status !== "booked")
        .map((slot) => ({
          id: slot.id,
          time: `${formatTime(slot.startTime)} - ${formatTime(
            slot.endTime
          )}`,
          sortTime: new Date(slot.startTime).getTime(),
          patient: "Available time",
          status:
            slot.status === "open" ? "Available" : "Unavailable",
          type: "availability",
          slot,
        }));

      const appointmentEntries: ScheduleEntry[] = appointments
        .filter((appointment) => appointment.slot)
        .map((appointment) => ({
          id: appointment.id,
          time: `${formatTime(
            appointment.slot!.startTime
          )} - ${formatTime(appointment.slot!.endTime)}`,
          sortTime: new Date(
            appointment.slot!.startTime
          ).getTime(),
          patient: appointment.patient?.name || "Unknown patient",
          status: getAppointmentStatus(appointment),
          type: "appointment",
        }));

      setEntries([...appointmentEntries, ...availabilityEntries]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your schedule."
      );
    } finally {
      setLoading(false);
    }
  }, [date, token, user?.id]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  const filtered = entries
    .filter((entry) => filter === "All" || entry.status === filter)
    .sort((a, b) => a.sortTime - b.sortTime);

  async function addAvailability() {
    if (!token) {
      setError("Please log in again.");
      return;
    }

    if (!start || !end || start >= end) {
      setError("End time must be later than start time.");
      return;
    }

    const startTime = new Date(`${date}T${start}:00`);
    const endTime = new Date(`${date}T${end}:00`);

    if (
      isNaN(startTime.getTime()) ||
      isNaN(endTime.getTime()) ||
      startTime <= new Date()
    ) {
      setError("Please select a valid future date and time.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/api/slots`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          status: "open",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(data));
      }

      setSuccess("Availability added successfully!");
      await loadSchedule();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to add availability."
      );
    } finally {
      setSaving(false);
    }
  }

  function startEditing(slot: AvailabilitySlot) {
    const startParts = getLocalDateTime(slot.startTime);
    const endParts = getLocalDateTime(slot.endTime);

    setEditingSlot(slot);
    setEditDate(startParts.date);
    setEditStart(startParts.time);
    setEditEnd(endParts.time);
    setError("");
    setSuccess("");
  }

  function cancelEditing() {
    setEditingSlot(null);
    setEditDate("");
    setEditStart("");
    setEditEnd("");
  }

  async function updateAvailability() {
    if (!token || !editingSlot) {
      setError("Unable to update this availability slot.");
      return;
    }

    if (!editDate || !editStart || !editEnd || editStart >= editEnd) {
      setError("Please enter a valid date and time range.");
      return;
    }

    const startTime = new Date(`${editDate}T${editStart}:00`);
    const endTime = new Date(`${editDate}T${editEnd}:00`);

    if (
      isNaN(startTime.getTime()) ||
      isNaN(endTime.getTime()) ||
      startTime <= new Date()
    ) {
      setError("Please select a valid future date and time.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/slots/${editingSlot.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(data));
      }

      cancelEditing();
      setSuccess("Availability updated successfully!");
      await loadSchedule();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update availability."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteAvailability(slot: AvailabilitySlot) {
    if (!token) {
      setError("Please log in again.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this availability slot?"
    );

    if (!confirmed) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/slots/${slot.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(data));
      }

      if (editingSlot?.id === slot.id) {
        cancelEditing();
      }

      setSuccess("Availability deleted successfully!");
      await loadSchedule();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete availability."
      );
    } finally {
      setSaving(false);
    }
  }

  function getStatusStyle(status: string) {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";
      case "In Consultation":
        return "bg-blue-100 text-blue-700";
      case "Available":
        return "bg-purple-100 text-purple-700";
      case "Unavailable":
        return "bg-gray-100 text-gray-700";
      case "Not Arrived":
        return "bg-red-100 text-red-700";
      default:
        return "bg-amber-100 text-amber-700";
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          My Schedule
        </h1>
        <p className="mt-2 text-gray-500">
          Review appointments and manage your availability.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

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
              setSuccess("");
              cancelEditing();
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
            <option>Not Arrived</option>
            <option>In Consultation</option>
            <option>Completed</option>
            <option>Available</option>
            <option>Unavailable</option>
          </select>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-5 text-xl font-bold text-gray-900">
          <CalendarDays className="mr-2 inline text-[#299BCF]" />
          Appointments & Availability
        </h2>

        {loading ? (
          <p className="py-8 text-center text-gray-500">
            Loading your schedule...
          </p>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-gray-500">
            No appointments or availability entries for this date.
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.map((entry) => (
              <div
                key={`${entry.type}-${entry.id}`}
                className="flex flex-col gap-3 rounded-xl border border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {entry.patient}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    <Clock size={15} className="mr-1 inline" />
                    {entry.time}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                      entry.status
                    )}`}
                  >
                    {entry.status}
                  </span>

                  {entry.type === "availability" && entry.slot && (
                    <>
                      <button
                        type="button"
                        onClick={() => startEditing(entry.slot!)}
                        disabled={saving}
                        className="flex items-center gap-1 rounded-lg border border-[#299BCF] px-3 py-2 text-sm font-medium text-[#299BCF] hover:bg-[#EAF3FC] disabled:opacity-50"
                      >
                        <Pencil size={15} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteAvailability(entry.slot!)}
                        disabled={saving}
                        className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {editingSlot && (
        <section className="rounded-2xl border border-[#299BCF]/20 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Edit Availability
            </h2>

            <button
              type="button"
              onClick={cancelEditing}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              aria-label="Close edit form"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                value={editDate}
                min={getTodayDate()}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Start time
              </label>
              <input
                type="time"
                value={editStart}
                onChange={(e) => setEditStart(e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                End time
              </label>
              <input
                type="time"
                value={editEnd}
                onChange={(e) => setEditEnd(e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-3"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={updateAvailability}
              disabled={
                saving ||
                !editDate ||
                !editStart ||
                !editEnd ||
                editStart >= editEnd
              }
              className="rounded-xl bg-[#299BCF] px-5 py-3 font-semibold text-white hover:bg-[#2187B5] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={cancelEditing}
              disabled={saving}
              className="rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </section>
      )}

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
          type="button"
          onClick={addAvailability}
          disabled={
            saving ||
            loading ||
            !start ||
            !end ||
            start >= end
          }
          className="mt-5 flex items-center gap-2 rounded-xl bg-[#299BCF] px-5 py-3 font-semibold text-white hover:bg-[#2187B5] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={18} />
          {saving ? "Saving..." : "Add Availability"}
        </button>
      </section>
    </div>
  );
}
