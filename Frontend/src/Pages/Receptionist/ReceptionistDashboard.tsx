import { Link } from "react-router-dom";
import {
  Users,
  CalendarDays,
  Clock,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

const ReceptionistDashboard = () => {
  const stats = [
    {
      title: "Today's Appointments",
      value: "24",
      icon: CalendarDays,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      title: "Waiting Patients",
      value: "08",
      icon: Clock,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      title: "In Consultation",
      value: "04",
      icon: Users,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
    {
      title: "Completed",
      value: "12",
      icon: CheckCircle,
      color: "text-green-500",
      bg: "bg-green-50",
    },
  ];

  const appointments = [
    {
      patient: "David Ishimwe",
      doctor: "Dr. Alice Uwimana",
      time: "09:00 AM",
      status: "Waiting",
    },
    {
      patient: "Sarah Mutesi",
      doctor: "Dr. Jean Niyonkuru",
      time: "10:00 AM",
      status: "In Consultation",
    },
    {
      patient: "Emmanuel Nkurunziza",
      doctor: "Dr. Grace Mukamana",
      time: "11:00 AM",
      status: "Waiting",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Receptionist Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here is today's clinic overview.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-blue-50 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <h2 className="mt-3 text-3xl font-bold text-gray-800">
                    {stat.value}
                  </h2>
                </div>

                <div className={`rounded-xl p-3 ${stat.bg} ${stat.color}`}>
                  <Icon size={25} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-blue-50 bg-white p-6 xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-bold text-gray-800">
              Recent Appointments
            </h2>

            <Link
              to="/receptionist/appointments"
              className="text-sm font-semibold text-[#299BCF]"
            >
              View all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[550px] text-left text-sm">
              <thead className="border-b text-gray-500">
                <tr>
                  <th className="py-3">Patient</th>
                  <th>Doctor</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.patient} className="border-b last:border-0">
                    <td className="py-4 font-semibold text-gray-700">
                      {appointment.patient}
                    </td>
                    <td className="text-gray-500">
                      {appointment.doctor}
                    </td>
                    <td className="text-gray-500">
                      {appointment.time}
                    </td>
                    <td>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-[#299BCF]">
                        {appointment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl bg-[#299BCF] p-6 text-white">
          <h2 className="text-lg font-bold">Manage Today's Queue</h2>

          <p className="mt-2 text-sm leading-6 text-blue-50">
            Monitor waiting patients and update their consultation status.
          </p>

          <Link
            to="/receptionist/queue"
            className="mt-6 flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#299BCF]"
          >
            Open Queue
            <ArrowRight size={19} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;