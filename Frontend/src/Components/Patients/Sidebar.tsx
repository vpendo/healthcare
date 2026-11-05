
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CalendarRange,
  ClipboardList,
  House,
  LogOut,
  Menu,
  UserRound,
  X,
  HeartPulse,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../Context/AuthContext";

interface NavigationItem {
  to: string;
  label: string;
  icon: typeof House;
  end?: boolean;
}

const navigation: NavigationItem[] = [
  { to: "/patients", label: "Dashboard", icon: House, end: true },
  {
    to: "/patients/intake",
    label: "AI Symptom Intake",
    icon: Sparkles,
  },
  {
    to: "/patients/book-appointment",
    label: "Book Appointment",
    icon: CalendarDays,
  },
  {
    to: "/patients/appointments",
    label: "My Appointments",
    icon: CalendarRange,
  },
  {
    to: "/patients/visit-history",
    label: "Visit History",
    icon: ClipboardList,
  },
  {
    to: "/patients/profile",
    label: "Profile",
    icon: UserRound,
  },
];

function FamCareLogo() {
  const heart =
    "M16 28.5C6.5 21 2 15 2 9.8 2 5.8 5 3 8.7 3c3 0 5.9 1.6 7.3 4.2C17.4 4.6 20.3 3 23.3 3 27 3 30 5.8 30 9.8 30 15 25.5 21 16 28.5Z";

  return (
    <span className="flex items-center gap-2">
      <svg
        viewBox="0 0 32 32"
        className="h-9 w-9 shrink-0"
        role="img"
        aria-label="FamCare logo"
      >
        <defs>
          <clipPath id="fc-sidebar-left">
            <rect x="0" y="0" width="16" height="32" />
          </clipPath>
          <clipPath id="fc-sidebar-right">
            <rect x="16" y="0" width="16" height="32" />
          </clipPath>
        </defs>

        <path d={heart} fill="#E51E2A" clipPath="url(#fc-sidebar-left)" />
        <path d={heart} fill="#55B9E8" clipPath="url(#fc-sidebar-right)" />

        <rect x="12" y="7" width="5" height="13" rx="1.4" fill="#FFFFFF" />
        <rect x="8" y="11" width="13" height="5" rx="1.4" fill="#FFFFFF" />
      </svg>

      <span className="text-2xl font-extrabold tracking-tight">
        <span className="text-[#E51E2A]">Fam</span>
        <span className="text-[#299BCF]">Care</span>
      </span>
    </span>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  function closeMenu() {
    setOpen(false);
  }

  async function handleLogout() {
    closeMenu();

    try {
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-[#D7E8F5] bg-white text-[#299BCF] shadow-sm transition hover:bg-[#EAF3FC] lg:hidden"
      >
        {open ? <X size={21} /> : <Menu size={21} />}
      </button>

      {/* Mobile backdrop */}
      {open && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={closeMenu}
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-[#D7E8F5] bg-white transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* FamCare brand */}
        <NavLink
          to="/patients"
          onClick={closeMenu}
          className="flex h-20 shrink-0 items-center border-b border-[#D7E8F5] px-6"
          aria-label="FamCare patient dashboard"
        >
          <FamCareLogo />
        </NavLink>

        {/* Navigation */}
        <nav
          aria-label="Patient dashboard"
          className="flex-1 space-y-2 overflow-y-auto px-4 py-7"
        >
          <p className="mb-4 px-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
            Patient Menu
          </p>

          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={label}
              to={to}
              end={end}
              onClick={closeMenu}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-[#EAF3FC] text-[#299BCF] shadow-sm"
                    : "text-slate-600 hover:bg-[#F1F8FD] hover:text-[#E51E2A]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.4 : 1.9}
                    className={
                      isActive
                        ? "text-[#299BCF]"
                        : "text-slate-400 transition group-hover:text-[#E51E2A]"
                    }
                  />

                  <span className="flex-1">{label}</span>

                  {isActive && (
                    <ChevronRight
                      size={17}
                      className="text-[#55B9E8]"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Health reminder */}
        <div className="mx-4 mb-5 rounded-2xl border border-[#D7E8F5] bg-[#F1F8FD] p-4">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#299BCF]">
            <HeartPulse size={22} />
          </div>

          <h3 className="text-sm font-bold text-slate-800">
            Your health matters
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Keep track of your appointments and manage your care.
          </p>
        </div>

        {/* Logout */}
        <div className="border-t border-[#D7E8F5] p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-semibold text-[#E51E2A] transition hover:bg-red-50 hover:text-[#C91824]"
          >
            <LogOut size={19} />
            <span className="flex-1">Logout</span>
          </button>

          <p className="mt-3 text-center text-xs text-slate-400">
            FamCare Patient Portal
          </p>
        </div>
      </aside>
    </>
  );
}
