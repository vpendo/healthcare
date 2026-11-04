import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Menu, X, ChevronDown } from "lucide-react";

type NavLinkItem = {
  name: string;
  path: string;
};

const navLinks: NavLinkItem[] = [
  { name: "Home", path: "/" },
  { name: "About Us", path: "/about" },
  { name: "Contact Us", path: "/contact" },
];

const serviceLinks: NavLinkItem[] = [
  { name: "General Consultation", path: "/services/general-consultation" },
  { name: "Dental Care", path: "/services/dental-care" },
  { name: "Optical Care", path: "/services/optical-care" },
  { name: "View All Services", path: "/services" },
];
function FamCareLogo({ className = "h-9 w-9" }: { className?: string }) {
  const heart =
    "M16 28.5C6.5 21 2 15 2 9.8 2 5.8 5 3 8.7 3c3 0 5.9 1.6 7.3 4.2C17.4 4.6 20.3 3 23.3 3 27 3 30 5.8 30 9.8 30 15 25.5 21 16 28.5Z";

  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label="FamCare logo"
    >
      <defs>
        <clipPath id="fc-left">
          <rect x="0" y="0" width="16" height="32" />
        </clipPath>
        <clipPath id="fc-right">
          <rect x="16" y="0" width="16" height="32" />
        </clipPath>
      </defs>

      <path d={heart} fill="#E51E2A" clipPath="url(#fc-left)" />
      <path d={heart} fill="#55B9E8" clipPath="url(#fc-right)" />

      <rect x="12" y="7" width="5" height="13" rx="1.4" fill="#FFFFFF" />
      <rect x="8" y="11" width="13" height="5" rx="1.4" fill="#FFFFFF" />
    </svg>
  );
}

function Wordmark() {
  return (
    <span className="text-2xl font-extrabold tracking-tight">
      <span className="text-[#E51E2A]">Fam</span>
      <span className="text-[#299BCF]">Care</span>
    </span>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    setServicesOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setServicesOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const linkClass = (active: boolean) =>
    `rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55B9E8] ${
      active
        ? "bg-[#E51E2A] text-white shadow-sm"
        : "text-[#299BCF] hover:bg-[#EAF3FC] hover:text-[#E51E2A]"
    }`;

  const isActive = (path: string) => pathname === path;
  const isServiceActive = pathname.startsWith("/services");

  return (
    <header className="sticky top-0 z-50 border-b border-[#D7E8F5] bg-white/95 backdrop-blur">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8"
      >
        {/* Logo */}
        <Link
          to="/"
          aria-label="FamCare home"
          className="flex shrink-0 items-center gap-2"
        >
          <FamCareLogo />
          <Wordmark />
        </Link>

        {/* Desktop navigation */}
        <ul className="hidden items-center gap-1.5 md:flex">
          {navLinks.slice(0, 2).map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                aria-current={isActive(link.path) ? "page" : undefined}
                className={linkClass(isActive(link.path))}
              >
                {link.name}
              </Link>
            </li>
          ))}

          {/* Our Services dropdown */}
          <li className="relative">
            <button
              type="button"
              onClick={() => setServicesOpen((open) => !open)}
              aria-expanded={servicesOpen}
              aria-haspopup="true"
              className={`flex items-center gap-1.5 ${linkClass(isServiceActive)}`}
            >
              Our Services
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  servicesOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {servicesOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-xl border border-[#D7E8F5] bg-white p-2 shadow-lg">
                {serviceLinks.map((service) => (
                  <Link
                    key={service.path}
                    to={service.path}
                    className={`block rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                      isActive(service.path)
                        ? "bg-[#EAF3FC] text-[#E51E2A]"
                        : "text-[#299BCF] hover:bg-[#EAF3FC] hover:text-[#E51E2A]"
                    }`}
                  >
                    {service.name}
                  </Link>
                ))}
              </div>
            )}
          </li>

          {navLinks.slice(2).map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                aria-current={isActive(link.path) ? "page" : undefined}
                className={linkClass(isActive(link.path))}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/find-doctor"
            className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[#299BCF] transition-colors hover:bg-[#EAF3FC] hover:text-[#E51E2A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55B9E8]"
          >
            Find a Doctor
          </Link>

          <Link
            to="/register"
            className="flex items-center gap-2 rounded-lg bg-[#E51E2A] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#C91824] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55B9E8] focus-visible:ring-offset-2"
          >
            Get Started
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-lg p-2 text-[#299BCF] transition-colors hover:bg-[#EAF3FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55B9E8] md:hidden"
        >
          {menuOpen ? (
            <X size={25} aria-hidden="true" />
          ) : (
            <Menu size={25} aria-hidden="true" />
          )}
        </button>
      </nav>

      {/* Mobile navigation */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="border-t border-[#D7E8F5] bg-[#F1F8FD] px-5 py-5 md:hidden"
        >
          <ul className="flex flex-col gap-1.5">
            {navLinks.slice(0, 2).map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  aria-current={isActive(link.path) ? "page" : undefined}
                  className={`block ${linkClass(isActive(link.path))}`}
                >
                  {link.name}
                </Link>
              </li>
            ))}

            {/* Mobile Our Services dropdown */}
            <li>
              <button
                type="button"
                onClick={() => setServicesOpen((open) => !open)}
                aria-expanded={servicesOpen}
                className={`flex w-full items-center justify-between ${linkClass(isServiceActive)}`}
              >
                Our Services
                <ChevronDown
                  size={17}
                  className={`transition-transform ${
                    servicesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {servicesOpen && (
                <div className="ml-4 mt-2 flex flex-col gap-1 border-l-2 border-[#55B9E8] pl-3">
                  {serviceLinks.map((service) => (
                    <Link
                      key={service.path}
                      to={service.path}
                      className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                        isActive(service.path)
                          ? "bg-[#EAF3FC] text-[#E51E2A]"
                          : "text-[#299BCF] hover:bg-[#EAF3FC] hover:text-[#E51E2A]"
                      }`}
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
              )}
            </li>

            {navLinks.slice(2).map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  aria-current={isActive(link.path) ? "page" : undefined}
                  className={`block ${linkClass(isActive(link.path))}`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex gap-3 border-t border-[#D7E8F5] pt-4">
            <Link
              to="/doctors"
              className="flex-1 rounded-lg border border-[#55B9E8] bg-white px-4 py-3 text-center text-sm font-semibold text-[#299BCF] transition-colors hover:bg-[#EAF3FC] hover:text-[#E51E2A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55B9E8]"
            >
              Find a Doctor
            </Link>

            <Link
              to="/register"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#E51E2A] px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#C91824] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55B9E8]"
            >
              Get Started
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
