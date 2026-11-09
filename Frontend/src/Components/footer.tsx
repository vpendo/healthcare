import { Link } from "react-router-dom";
import { MapPin, Mail, Clock } from "lucide-react";

const services = [
  "General Consultation",
  "Fever, Cough & Flu",
  "Dental Care",
  "Children's Healthcare",
];

function FamCareLogo({ className = "h-10 w-10" }: { className?: string }) {
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

export default function Footer() {
  return (
    <footer className="border-t border-[#D7E8F5] bg-[#F1F8FD] text-[#262626]">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link
              to="/"
              aria-label="FamCare home"
              className="inline-flex items-center gap-2"
            >
              <FamCareLogo />
              <Wordmark />
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-6 text-gray-600">
              Simple and convenient healthcare, from booking appointments
              to managing your clinic visits.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold">Quick Links</h3>
            <ul className="mt-4 space-y-3 text-sm text-gray-600">
              <li>
                <Link to="/" className="hover:text-[#E51E2A]">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-[#E51E2A]">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/doctors" className="hover:text-[#E51E2A]">
                  Find a Doctor
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-[#E51E2A]">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold">Our Services</h3>
            <ul className="mt-4 space-y-3 text-sm text-gray-600">
              {services.map((service) => (
                <li key={service}>{service}</li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold">Contact</h3>
            <ul className="mt-4 space-y-4 text-sm text-gray-600">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="shrink-0 text-[#299BCF]" />
                <span>Kigali, Rwanda</span>
              </li>

              <li className="flex items-start gap-3">
                <Mail size={18} className="shrink-0 text-[#299BCF]" />
                <a
                  href="mailto:info@famcare.rw"
                  className="break-all hover:text-[#E51E2A]"
                >
                  info@famcare.rw
                </a>
              </li>

              <li className="flex items-start gap-3">
                <Clock size={18} className="shrink-0 text-[#299BCF]" />
                <span>Mon–Fri, 8 AM–5 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Centered Copyright */}
        <div className="mt-8 border-t border-[#D7E8F5] pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} FamCare. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
