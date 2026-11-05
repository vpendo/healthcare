import { useState, type FormEvent } from "react";
import { Plus, Trash2, Clock } from "lucide-react";

interface Slot {
  id: number;
  doctor: string;
  date: string;
  time: string;
  status: "Available" | "Booked";
}

const ManageSlots = () => {
  const [slots, setSlots] = useState<Slot[]>([
    {
      id: 1,
      doctor: "Dr. Alice Uwimana",
      date: "2026-11-04",
      time: "09:00",
      status: "Available",
    },
    {
      id: 2,
      doctor: "Dr. Jean Niyonkuru",
      date: "2026-11-04",
      time: "10:00",
      status: "Booked",
    },
    {
      id: 3,
      doctor: "Dr. Grace Mukamana",
      date: "2026-11-05",
      time: "11:00",
      status: "Available",
    },
  ]);

  const [doctor, setDoctor] = useState("Dr. Alice Uwimana");
  const [date, setDate] = useState("2026-11-04");
  const [time, setTime] = useState("09:00");
  const [message, setMessage] = useState("");

  const addSlot = (e: FormEvent) => {
    e.preventDefault();
    setMessage("");

    const duplicate = slots.some(
      (slot) =>
        slot.doctor === doctor &&
        slot.date === date &&
        slot.time === time
    );

    if (duplicate) {
      setMessage("This doctor already has a slot at that date and time.");
      return;
    }

    setSlots((previous) => [
      ...previous,
      {
        id: Date.now(),
        doctor,
        date,
        time,
        status: "Available",
      },
    ]);

    setMessage("Appointment slot added successfully.");
  };

  const deleteSlot = (id: number) => {
    setSlots((previous) => previous.filter((slot) => slot.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Manage Slots</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create and manage doctors' available appointment times.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <form
          onSubmit={addSlot}
          className="h-fit rounded-2xl bg-white p-6 shadow-sm"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-[#EAF3FC] p-3 text-[#299BCF]">
              <Plus size={22} />
            </div>
            <h2 className="font-bold text-gray-800">Add New Slot</h2>
          </div>

          <label className="mb-2 block text-sm font-medium text-gray-700">
            Select Doctor
          </label>

          <select
            value={doctor}
            onChange={(e) => setDoctor(e.target.value)}
            className="mb-4 w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-[#299BCF]"
          >
            <option>Dr. Alice Uwimana</option>
            <option>Dr. Jean Niyonkuru</option>
            <option>Dr. Grace Mukamana</option>
            <option>Dr. Patrick Habimana</option>
          </select>

          <label className="mb-2 block text-sm font-medium text-gray-700">
            Appointment Date
          </label>

          <input
            type="date"
            required
            min="2026-11-04"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mb-4 w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-[#299BCF]"
          />

          <label className="mb-2 block text-sm font-medium text-gray-700">
            Appointment Time
          </label>

          <input
            type="time"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="mb-4 w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-[#299BCF]"
          />

          {message && (
            <p className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-[#299BCF]">
              {message}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-[#299BCF] py-3 font-semibold text-white hover:bg-[#2388b7]"
          >
            Add Appointment Slot
          </button>
        </form>

        <div className="rounded-2xl bg-white p-6 shadow-sm xl:col-span-2">
          <h2 className="mb-5 font-bold text-gray-800">
            Available Appointment Slots
          </h2>

          <div className="space-y-3">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className="flex flex-col justify-between gap-4 rounded-xl border border-gray-100 p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {slot.doctor}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>{slot.date}</span>
                    <span className="flex items-center gap-1">
                      <Clock size={15} />
                      {slot.time}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      slot.status === "Available"
                        ? "bg-green-50 text-green-600"
                        : "bg-orange-50 text-orange-600"
                    }`}
                  >
                    {slot.status}
                  </span>

                  {slot.status === "Available" && (
                    <button
                      onClick={() => deleteSlot(slot.id)}
                      title="Delete slot"
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {slots.length === 0 && (
              <p className="py-8 text-center text-gray-500">
                No appointment slots available.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageSlots;