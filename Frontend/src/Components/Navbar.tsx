import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";

type NavLink = { name: string; hash: string };

const navLinks: NavLink[] = [
  { name: "Home", hash: "#home" },
  { name: "About Us", hash: "#about" },
  { name: "Our Services", hash: "#services" },
  { name: "Contact Us", hash: "#contact" },
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
  const { pathname, hash } = useLocation();

  const activeHash = pathname === "/" ? hash || "#home" : "";

  useEffect(() => {
    if (pathname !== "/" || !hash) return;

    document.querySelector(hash)?.scrollIntoView({
      behavior: "smooth",
    });
  }, [pathname, hash]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, hash]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const linkClass = (active: boolean) =>
    `rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55B9E8] ${
      active
        ? "bg-[#E51E2A] text-white shadow-sm"
        : "text-[#299BCF] hover:bg-[#EAF3FC] hover:text-[#E51E2A]"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-[#D7E8F5] bg-white/95 backdrop-blur">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8"
      >
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <FamCareLogo />
          <Wordmark />
        </Link>

        {/* Desktop navigation */}
        <ul className="hidden items-center gap-1.5 md:flex">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                to={`/${link.hash}`}
                aria-current={
                  activeHash === link.hash ? "page" : undefined
                }
                className={linkClass(activeHash === link.hash)}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/login"
            className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[#299BCF] transition-colors hover:bg-[#EAF3FC] hover:text-[#E51E2A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55B9E8]"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="flex items-center gap-2 rounded-lg bg-[#E51E2A] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#C91824] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55B9E8] focus-visible:ring-offset-2"
          >
            Get Started
            <ArrowRight size={16} />
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
          {menuOpen ? <X size={25} /> : <Menu size={25} />}
        </button>
      </nav>

      {/* Mobile navigation */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="border-t border-[#D7E8F5] bg-[#F1F8FD] px-5 py-5 md:hidden"
        >
          <ul className="flex flex-col gap-1.5">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  to={`/${link.hash}`}
                  aria-current={
                    activeHash === link.hash ? "page" : undefined
                  }
                  className={`block ${linkClass(activeHash === link.hash)}`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex gap-3 border-t border-[#D7E8F5] pt-4">
            <Link
              to="/login"
              className="flex-1 rounded-lg border border-[#55B9E8] bg-white px-4 py-3 text-center text-sm font-semibold text-[#299BCF] transition-colors hover:bg-[#EAF3FC] hover:text-[#E51E2A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55B9E8]"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="flex-1 rounded-lg bg-[#E51E2A] px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#C91824] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55B9E8]"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
