
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Clock,
  UserRound,
  LogOut,
  X,
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  close: () => void;
}

const Sidebar = ({ open, close }: SidebarProps) => {
  const navigate = useNavigate();

  const links = [
    {
      name: "Dashboard",
      path: "/receptionist",
      icon: LayoutDashboard,
      end: true,
    },
    {
      name: "Today's Queue",
      path: "/receptionist/queue",
      icon: Users,
    },
    {
      name: "Appointments",
      path: "/receptionist/appointments",
      icon: CalendarDays,
    },
    {
      name: "Manage Slots",
      path: "/receptionist/slots",
      icon: Clock,
    },
    {
      name: "Patients",
      path: "/receptionist/patients",
      icon: UserRound,
    },
  ];

  const heart =
    "M16 28.5C6.5 21 2 15 2 9.8 2 5.8 5 3 8.7 3c3 0 5.9 1.6 7.3 4.2C17.4 4.6 20.3 3 23.3 3 27 3 30 5.8 30 9.8 30 15 25.5 21 16 28.5Z";

  return (
    <>
      {open && (
        <div
          onClick={close}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-blue-100 bg-white transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* FamCare Logo */}
        <div className="flex items-center justify-between border-b border-blue-100 px-6 py-5">
          <div className="flex items-center gap-3">

            <svg
              viewBox="0 0 32 32"
              className="h-9 w-9 shrink-0"
              role="img"
              aria-label="FamCare logo"
            >
              <defs>
                <clipPath id="fc-receptionist-left">
                  <rect x="0" y="0" width="16" height="32" />
                </clipPath>

                <clipPath id="fc-receptionist-right">
                  <rect x="16" y="0" width="16" height="32" />
                </clipPath>
              </defs>

              {/* Red heart */}
              <path
                d={heart}
                fill="#E51E2A"
                clipPath="url(#fc-receptionist-left)"
              />

              {/* Blue heart */}
              <path
                d={heart}
                fill="#55B9E8"
                clipPath="url(#fc-receptionist-right)"
              />

              {/* White medical plus */}
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

          <button onClick={close} className="lg:hidden">
            <X size={22} />
          </button>
        </div>

        {/* Receptionist Navigation */}
        <div className="px-5 py-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Receptionist Menu
          </p>

          <nav className="space-y-2">
            {links.map((link) => {
              const Icon = link.icon;

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.end}
                  onClick={close}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-[#EAF3FC] text-[#299BCF]"
                        : "text-gray-600 hover:bg-[#F1F8FD] hover:text-[#299BCF]"
                    }`
                  }
                >
                  <Icon size={20} />
                  {link.name}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Receptionist Information and Logout */}
        <div className="mt-auto border-t border-blue-100 p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF3FC] font-bold text-[#299BCF]">
              R
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-800">
                Receptionist
              </p>
              <p className="text-xs text-gray-500">FamCare Staff</p>
            </div>
          </div>

          <button
            onClick={() => navigate("/login")}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-500 hover:bg-red-50"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
