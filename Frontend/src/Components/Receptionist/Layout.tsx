
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu, Bell } from "lucide-react";
import Sidebar from "./Sidebar";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close the mobile sidebar whenever the route changes
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-[#F1F8FD]">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        close={closeSidebar}
      />

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top navigation */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-blue-100 bg-white px-4 sm:px-8">

          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
            className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 lg:hidden"
          >
            <Menu size={23} />
          </button>

          {/* Page heading */}
          <div>
            <p className="font-semibold text-gray-800">
              Receptionist Portal
            </p>
            <p className="hidden text-xs text-gray-500 sm:block">
              Manage patients and appointments
            </p>
          </div>

          {/* Notifications */}
          <button
            aria-label="Notifications"
            className="relative rounded-full bg-[#EAF3FC] p-3 text-[#299BCF] transition hover:bg-blue-100"
          >
            <Bell size={20} />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#E51E2A]" />
          </button>
        </header>

        {/* Nested receptionist pages */}
        <main
          key={location.pathname}
          className="min-h-[calc(100vh-64px)] p-4 sm:p-6 lg:p-8"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
