import { Bell, ChevronDown } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import Sidebar from "./Sidebar";

function FamCareLogo() {
  const heart =
    "M16 28.5C6.5 21 2 15 2 9.8 2 5.8 5 3 8.7 3c3 0 5.9 1.6 7.3 4.2C17.4 4.6 20.3 3 23.3 3 27 3 30 5.8 30 9.8 30 15 25.5 21 16 28.5Z";

  return (
    <span className="flex shrink-0 items-center gap-2">
      <svg
        viewBox="0 0 32 32"
        className="h-9 w-9"
        role="img"
        aria-label="FamCare logo"
      >
        <defs>
          <clipPath id="fc-layout-left">
            <rect x="0" y="0" width="16" height="32" />
          </clipPath>
          <clipPath id="fc-layout-right">
            <rect x="16" y="0" width="16" height="32" />
          </clipPath>
        </defs>

        <path d={heart} fill="#E51E2A" clipPath="url(#fc-layout-left)" />
        <path d={heart} fill="#55B9E8" clipPath="url(#fc-layout-right)" />

        <rect x="12" y="7" width="5" height="13" rx="1.4" fill="#FFFFFF" />
        <rect x="8" y="11" width="13" height="5" rx="1.4" fill="#FFFFFF" />
      </svg>

      <span className="text-lg font-extrabold tracking-tight">
        <span className="text-[#E51E2A]">Fam</span>
        <span className="text-[#299BCF]">Care</span>
      </span>
    </span>
  );
}

export default function Layout() {
  const { user } = useAuth();

  const fullName = user?.name || "User";

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
    <div className="flex min-h-screen bg-[#F1F8FD] text-slate-800">
      <Sidebar />

      <main className="min-w-0 flex-1">
        {/* Top navigation */}
        <header className="sticky top-0 z-30 flex h-[76px] items-center gap-4 border-b border-[#D7E8F5] bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          {/* Mobile brand */}
          <NavLink
            to="/patients"
            className="flex shrink-0 items-center lg:hidden"
            aria-label="FamCare patient dashboard"
          >
            <FamCareLogo />
          </NavLink>

          <div className="flex-1" />

          {/* Notifications */}
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#299BCF] transition hover:bg-[#EAF3FC] hover:text-[#E51E2A]"
          >
            <Bell size={20} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#E51E2A] ring-2 ring-white" />
          </button>

          {/* User account */}
          <button
            type="button"
            aria-label="User account"
            className="flex items-center gap-2 rounded-xl p-2 transition hover:bg-[#F1F8FD] sm:gap-3"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF3FC] text-sm font-bold text-[#299BCF]">
              {initials || "U"}
            </span>

            <span className="hidden text-left sm:block">
              <strong className="block max-w-[150px] truncate text-sm font-semibold text-slate-800">
                {fullName}
              </strong>
              <span className="text-xs capitalize text-slate-500">
                {role}
              </span>
            </span>

            <ChevronDown
              size={16}
              className="hidden text-[#299BCF] sm:block"
            />
          </button>
        </header>

        {/* Page content */}
        <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}