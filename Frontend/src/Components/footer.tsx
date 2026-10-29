import { Link } from "react-router-dom";
import { HeartPulse, MapPin, Mail, Clock } from "lucide-react";

const services = [
  "General Consultation",
  "Fever, Cough & Flu",
  "Dental Care",
  "Children's Healthcare",
];

export default function Footer() {
  return (
    <footer className="border-t border-[#D7E8F5] bg-[#F1F8FD] text-[#262626]">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E51E2A] text-white">
                <HeartPulse size={23} />
              </span>
              <span className="text-2xl font-bold">
                Fam<span className="text-[#299BCF]">Care</span>
              </span>
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
                <Link to="/login" className="hover:text-[#E51E2A]">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-[#E51E2A]">
                  Register
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
                <MapPin
                  size={18}
                  className="shrink-0 text-[#299BCF]"
                />
                <span>Kigali, Rwanda</span>
              </li>

              <li className="flex items-start gap-3">
                <Mail
                  size={18}
                  className="shrink-0 text-[#299BCF]"
                />
                <a
                  href="mailto:info@famcare.rw"
                  className="break-all hover:text-[#E51E2A]"
                >
                  info@famcare.rw
                </a>
              </li>

              <li className="flex items-start gap-3">
                <Clock
                  size={18}
                  className="shrink-0 text-[#299BCF]"
                />
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
