
import { NavLink } from "react-router-dom";
import {
  HeartPulse,
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  UserRound,
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
  return (
    <aside className="flex h-full w-64 flex-col overflow-y-auto bg-white p-5">
      <div className="mb-8 flex items-center gap-2">
        <HeartPulse className="h-9 w-9 text-[#299BCF]" />
        <h1 className="text-2xl font-bold">
          <span className="text-[#E51E2A]">Fam</span>
          <span className="text-[#299BCF]">Care</span>
        </h1>
      </div>

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

      <div className="mt-auto rounded-xl bg-[#F1F8FD] p-4">
        <p className="font-semibold text-gray-800">Need assistance?</p>
        <p className="mt-1 text-sm text-gray-500">
          Contact your clinic administrator.
        </p>
      </div>
    </aside>
  );
}
