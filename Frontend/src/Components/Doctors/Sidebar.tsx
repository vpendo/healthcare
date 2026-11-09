
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  UserRound,
  LogOut,
} from "lucide-react";

const links = [
  { name: "Dashboard", path: "/doctors", icon: LayoutDashboard, end: true },
  { name: "My Schedule", path: "/doctors/schedule", icon: CalendarDays },
  { name: "Consultations", path: "/doctors/consultations", icon: ClipboardList },
  { name: "My Profile", path: "/doctors/profile", icon: UserRound },
];

type SidebarProps = {
  onNavigate?: () => void;
};

export default function Sidebar({ onNavigate }: SidebarProps) {
  const navigate = useNavigate();

  const heart =
    "M16 28.5C6.5 21 2 15 2 9.8 2 5.8 5 3 8.7 3c3 0 5.9 1.6 7.3 4.2C17.4 4.6 20.3 3 23.3 3 27 3 30 5.8 30 9.8 30 15 25.5 21 16 28.5Z";

  return (
    <aside className="flex h-full w-64 flex-col overflow-y-auto bg-white p-5">

      {/* FamCare Logo */}
      <div className="mb-8 flex items-center gap-3">
        <svg
          viewBox="0 0 32 32"
          className="h-9 w-9 shrink-0"
          role="img"
          aria-label="FamCare logo"
        >
          <defs>
            <clipPath id="fc-doctor-left">
              <rect x="0" y="0" width="16" height="32" />
            </clipPath>

            <clipPath id="fc-doctor-right">
              <rect x="16" y="0" width="16" height="32" />
            </clipPath>
          </defs>

          <path
            d={heart}
            fill="#E51E2A"
            clipPath="url(#fc-doctor-left)"
          />

          <path
            d={heart}
            fill="#55B9E8"
            clipPath="url(#fc-doctor-right)"
          />

          <rect
            x="12"
            y="7"
            width="5"
            height="13"
            rx="1.4"
            fill="#FFFFFF"
          />

          <rect
            x="8"
            y="11"
            width="13"
            height="5"
            rx="1.4"
            fill="#FFFFFF"
          />
        </svg>

        <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-[#E51E2A]">Fam</span>
          <span className="text-[#299BCF]">Care</span>
        </h1>
      </div>

      {/* Doctor Navigation */}
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Doctor Portal
      </p>

      <nav className="space-y-2">
        {links.map(({ name, path, icon: Icon, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-[#EAF3FC] text-[#299BCF]"
                  : "text-gray-600 hover:bg-gray-50"
              }`
            }
          >
            <Icon size={20} />
            {name}
          </NavLink>
        ))}
      </nav>

      {/* Assistance Section */}
      <div className="mt-auto rounded-xl bg-[#F1F8FD] p-4">
        <p className="font-semibold text-gray-800">Need assistance?</p>
        <p className="mt-1 text-sm text-gray-500">
          Contact your clinic administrator.
        </p>
      </div>

      {/* Logout Button */}
      <div className="mt-4 border-t border-blue-100 pt-4">
        <button
          onClick={() => {
            onNavigate?.();
            navigate("/login");
          }}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50 hover:text-red-700"
        >
          <LogOut size={19} />
          Logout
        </button>
      </div>

    </aside>
  );
}
