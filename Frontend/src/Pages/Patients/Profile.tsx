
import {
  HeartPulse,
  Mail,
  ShieldCheck,
  UserRound,
  Settings,
  CalendarDays,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  const fullName = user?.name || "Name unavailable";
  const email = user?.email || "Email unavailable";

  const role = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "Patient";

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <div className="min-h-screen bg-[#F1F8FD] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Page Heading */}
        <div>
          <p className="mb-2 text-xs font-bold tracking-[0.18em] text-[#299BCF]">
            PATIENT PORTAL
          </p>

          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            View your personal information and account details.
          </p>
        </div>

        {/* Profile Layout */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">

          {/* Profile Information */}
          <section className="overflow-hidden rounded-2xl border border-[#EAF3FC] bg-white shadow-sm lg:col-span-2">

            {/* Profile Header */}
            <div className="flex flex-col gap-4 border-b border-[#EAF3FC] p-5 sm:flex-row sm:items-center sm:p-6">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3FC] text-xl font-bold text-[#299BCF]">
                {initials || <UserRound size={32} />}
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900">
                  {fullName}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {email}
                </p>

                <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#EAF3FC] px-3 py-1 text-xs font-semibold text-[#299BCF]">
                  <ShieldCheck size={14} />
                  {role} Account
                </span>
              </div>
            </div>

            {/* Account Details */}
            <div className="space-y-1 p-5 sm:p-6">
              <h3 className="mb-4 text-sm font-bold text-slate-800">
                Personal Information
              </h3>

              {/* Full Name */}
              <div className="flex items-center gap-4 rounded-xl p-4 transition hover:bg-[#F1F8FD]">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF3FC] text-[#299BCF]">
                  <UserRound size={21} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-500">
                    Full Name
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {fullName}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-4 rounded-xl p-4 transition hover:bg-[#F1F8FD]">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF3FC] text-[#299BCF]">
                  <Mail size={21} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-500">
                    Email Address
                  </p>

                  <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                    {email}
                  </p>
                </div>
              </div>

              {/* Account Type */}
              <div className="flex items-center gap-4 rounded-xl p-4 transition hover:bg-[#F1F8FD]">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF3FC] text-[#299BCF]">
                  <HeartPulse size={21} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-500">
                    Account Type
                  </p>

                  <p className="mt-1 text-sm font-semibold capitalize text-slate-800">
                    {user?.role || "patient"}
                  </p>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="border-t border-[#EAF3FC] p-5 sm:p-6">
              <h3 className="mb-3 text-sm font-bold text-slate-800">
                Account Settings
              </h3>

              <div className="flex items-center gap-3 rounded-xl p-4">
                <Settings size={20} className="text-[#299BCF]" />

                <span className="flex-1">
                  <span className="block text-sm font-semibold text-slate-800">
                    Account preferences
                  </span>

                  <span className="mt-1 block text-xs text-slate-500">
                    Manage your account settings.
                  </span>
                </span>

                <span className="rounded-full bg-[#EAF3FC] px-3 py-1 text-xs font-medium text-[#299BCF]">
                  Coming soon
                </span>
              </div>

              <Link
                to="/dashboard/appointments"
                className="flex w-full items-center gap-3 rounded-xl p-4 text-left transition hover:bg-[#F1F8FD]"
              >
                <CalendarDays size={20} className="text-[#299BCF]" />

                <span className="flex-1">
                  <span className="block text-sm font-semibold text-slate-800">
                    Appointment history
                  </span>

                  <span className="mt-1 block text-xs text-slate-500">
                    Review your scheduled and completed visits.
                  </span>
                </span>

                <ChevronRight size={18} className="text-slate-400" />
              </Link>
            </div>
          </section>

          {/* Health Information Card */}
          <aside className="overflow-hidden rounded-2xl border border-[#EAF3FC] bg-white shadow-sm">

            <div className="bg-[#EAF3FC] p-6">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#299BCF] shadow-sm">
                <HeartPulse size={35} />
              </div>

              <h2 className="text-xl font-bold text-slate-900">
                Your health matters
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                FamCare helps you keep your healthcare information organized
                and your appointments easy to manage.
              </p>
            </div>

            <div className="space-y-4 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={22}
                  className="mt-0.5 shrink-0 text-[#299BCF]"
                />

                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Your privacy matters
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Keep your account secure and protect your personal
                    information.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-[#EAF3FC] p-4">
                <p className="text-sm font-semibold text-slate-800">
                  Keep your profile updated
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Accurate contact information helps you manage your
                  healthcare appointments.
                </p>
              </div>

              <p className="text-center text-xs text-slate-400">
                FamCare · Your healthcare companion
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
