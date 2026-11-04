
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Bell, Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F1F8FD] md:flex">
      <div className="hidden md:block">
  <aside className="fixed left-0 top-0 h-screen w-64">
    <Sidebar />
  </aside>
</div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="h-full shadow-xl">
            <Sidebar onNavigate={() => setMenuOpen(false)} />
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            className="flex-1 bg-black/40"
            aria-label="Close menu"
          />
        </div>
      )}

      <main className="min-w-0 flex-1 md:ml-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-100 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div>
              <p className="font-semibold text-gray-800">Doctor Portal</p>
              <p className="text-xs text-gray-500">FamCare Healthcare</p>
            </div>
          </div>

          <button
            className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell size={22} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#E51E2A]" />
          </button>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
