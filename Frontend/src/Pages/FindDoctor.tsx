
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Stethoscope,
  Eye,
  Smile,
  MapPin,
  CalendarDays,
  ArrowRight,
  UserRound,
} from "lucide-react";

import Navbar from "../Components/Navbar";
import Footer from "../Components/footer";

type Specialty =
  | "All Specialists"
  | "General Consultation"
  | "Dental Care"
  | "Optical Care";

type Doctor = {
  id: string;
  doctorId: string;
  name: string;
  email: string;
  specialty: string;
  experience?: string;
  description?: string;
  availability?: string;
};

const specialties = [
  {
    name: "General Consultation" as Specialty,
    description: "General health checks and common health concerns.",
    icon: Stethoscope,
  },
  {
    name: "Dental Care" as Specialty,
    description: "Dental examinations and oral health support.",
    icon: Smile,
  },
  {
    name: "Optical Care" as Specialty,
    description: "Eye examinations and vision care.",
    icon: Eye,
  },
];

export default function FindDoctor() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [selectedSpecialty, setSelectedSpecialty] =
    useState<Specialty>("All Specialists");

  // Fetch doctors from MongoDB through the backend API
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError("");

      const API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:5000";

      const response = await fetch(`${API_URL}/api/doctors`);

      if (!response.ok) {
        throw new Error(
          response.status === 401 || response.status === 403
            ? "You are not authorized to view doctors."
            : "Failed to load doctors. Please try again."
        );
      }

      const data = await response.json();

      // Your backend returns { count, doctors }
      const doctorsData: Doctor[] = Array.isArray(data)
        ? data
        : data.doctors || [];

      setDoctors(doctorsData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading doctors."
      );
    } finally {
      setLoading(false);
    }
  };

  // Load doctors when the page opens
  useEffect(() => {
    fetchDoctors();
  }, []);

  // Format specialty names for display
  const formatSpecialty = (specialty: string) => {
    return specialty
      .split(" ")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join(" ");
  };

  // Search and filter doctors
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const doctorSpecialty = doctor.specialty.toLowerCase().trim();

      const matchesSpecialty =
        selectedSpecialty === "All Specialists" ||
        doctorSpecialty === selectedSpecialty.toLowerCase();

      const matchesSearch =
        doctor.name.toLowerCase().includes(search.toLowerCase()) ||
        doctorSpecialty.includes(search.toLowerCase());

      return matchesSpecialty && matchesSearch;
    });
  }, [doctors, search, selectedSpecialty]);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#F1F8FD]">
        {/* Hero Section */}
        <section className="bg-white px-5 py-16 md:py-20">
          <div className="mx-auto max-w-7xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#EAF3FC] px-4 py-2 text-sm font-semibold text-[#299BCF]">
              <Stethoscope size={17} />
              Your Health, Our Priority
            </span>

            <h1 className="mt-6 text-3xl font-bold leading-tight text-[#299BCF] md:text-4xl lg:text-5xl">
              Find the Right Doctor
              <span className="block text-[#E51E2A]">
                for Your Health
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-600 md:text-base">
              Connect with the right healthcare professional. Explore
              our specialists and book an appointment that works for you.
            </p>

            {/* Search */}
            <div className="mx-auto mt-9 flex max-w-2xl items-center gap-3 rounded-2xl border border-[#D7E8F5] bg-white p-2 shadow-sm focus-within:border-[#55B9E8] focus-within:ring-2 focus-within:ring-[#55B9E8]/20">
              <Search
                className="ml-3 shrink-0 text-[#299BCF]"
                size={22}
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by doctor name or specialty..."
                className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-gray-700 outline-none placeholder:text-gray-400"
              />

              <button
                type="button"
                className="rounded-xl bg-[#E51E2A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#C91824]"
                onClick={() => {
                  document
                    .getElementById("doctor-results")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Search
              </button>
            </div>
          </div>
        </section>

        {/* Specialty Section */}
        <section className="px-5 py-14">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-[#E51E2A]">
                Our Specialties
              </p>

              <h2 className="mt-2 text-2xl font-bold text-[#299BCF] md:text-3xl">
                Browse by Specialty
              </h2>

              <p className="mt-3 text-sm leading-7 text-gray-600 md:text-base">
                Choose the type of healthcare service you need.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {specialties.map((specialty) => {
                const Icon = specialty.icon;
                const active = selectedSpecialty === specialty.name;

                return (
                  <button
                    key={specialty.name}
                    type="button"
                    onClick={() =>
                      setSelectedSpecialty(specialty.name)
                    }
                    className={`rounded-2xl border p-6 text-left transition duration-300 hover:-translate-y-1 hover:shadow-md ${
                      active
                        ? "border-[#299BCF] bg-[#EAF3FC] shadow-sm"
                        : "border-[#D7E8F5] bg-white hover:border-[#55B9E8]"
                    }`}
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#EAF3FC] text-[#299BCF]">
                      <Icon size={28} />
                    </div>

                    <h3 className="mt-5 text-base font-bold text-[#299BCF] md:text-lg">
                      {specialty.name}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      {specialty.description}
                    </p>

                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#299BCF]">
                      View doctors <ArrowRight size={16} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Doctors Section */}
        <section id="doctor-results" className="px-5 pb-20">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-[#E51E2A]">
                  Meet Our Professionals
                </p>

                <h2 className="mt-2 text-2xl font-bold text-[#299BCF] md:text-3xl">
                  {selectedSpecialty === "All Specialists"
                    ? "Our Doctors"
                    : selectedSpecialty + " Doctors"}
                </h2>

                <p className="mt-2 text-sm leading-7 text-gray-600 md:text-base">
                  Find a healthcare professional for your needs.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedSpecialty("All Specialists");
                  setSearch("");
                }}
                className="text-sm font-semibold text-[#299BCF] hover:text-[#E51E2A]"
              >
                View all doctors
              </button>
            </div>

            {/* Filter Buttons */}
            <div className="mt-7 flex flex-wrap gap-3">
              {(
                [
                  "All Specialists",
                  ...specialties.map((s) => s.name),
                ] as Specialty[]
              ).map((specialty) => (
                <button
                  key={specialty}
                  type="button"
                  onClick={() => setSelectedSpecialty(specialty)}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                    selectedSpecialty === specialty
                      ? "bg-[#299BCF] text-white"
                      : "border border-[#D7E8F5] bg-white text-gray-600 hover:border-[#55B9E8] hover:text-[#299BCF]"
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>

            <p className="mt-6 text-sm text-gray-500">
              Showing {filteredDoctors.length} doctor
              {filteredDoctors.length !== 1 ? "s" : ""}
            </p>

            {/* Loading State */}
            {loading ? (
              <div className="py-16 text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#D7E8F5] border-t-[#299BCF]" />

                <p className="mt-4 text-sm text-gray-500">
                  Loading doctors...
                </p>
              </div>
            ) : error ? (
              /* Error State */
              <div className="mt-8 rounded-2xl border border-red-200 bg-white px-5 py-12 text-center">
                <p className="font-semibold text-red-500">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={fetchDoctors}
                  className="mt-5 rounded-xl bg-[#299BCF] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2388B8]"
                >
                  Try Again
                </button>
              </div>
            ) : filteredDoctors.length > 0 ? (
              /* Doctor Cards */
              <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredDoctors.map((doctor) => {
                  const initials = doctor.name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <article
                      key={doctor.doctorId}
                      className="overflow-hidden rounded-2xl border border-[#D7E8F5] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="h-2 bg-[#55B9E8]" />

                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#EAF3FC] text-xl font-bold text-[#299BCF]">
                            {initials || (
                              <UserRound size={28} />
                            )}
                          </div>

                          <div className="min-w-0">
                            <h3 className="text-base font-bold text-[#299BCF]">
                              {doctor.name}
                            </h3>

                            <p className="mt-1 text-sm font-medium text-[#299BCF]">
                              {formatSpecialty(doctor.specialty)}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {doctor.experience ||
                                "Healthcare Professional"}
                            </p>
                          </div>
                        </div>

                        <p className="mt-5 min-h-[60px] text-sm leading-6 text-gray-600">
                          {doctor.description ||
                            "Providing quality healthcare services and professional medical care."}
                        </p>

                        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                          <MapPin
                            size={16}
                            className="text-[#299BCF]"
                          />
                          FamCare Clinic
                        </div>

                        <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
                          <CalendarDays size={16} />
                          {doctor.availability ||
                            "Contact clinic for availability"}
                        </div>

                        <div className="mt-6 border-t border-[#EAF3FC] pt-5">
                          <Link
                            to="/register"
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E51E2A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#C91824]"
                          >
                            Book Appointment
                            <ArrowRight size={17} />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              /* No Doctors Found */
              <div className="mt-8 rounded-2xl border border-[#D7E8F5] bg-white px-5 py-14 text-center">
                <UserRound
                  size={42}
                  className="mx-auto text-[#55B9E8]"
                />

                <h3 className="mt-4 text-lg font-bold text-[#299BCF]">
                  No doctors found
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Try another name or select a different specialty.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setSelectedSpecialty("All Specialists");
                  }}
                  className="mt-5 text-sm font-semibold text-[#299BCF] hover:text-[#E51E2A]"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-[#299BCF] px-5 py-14">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-bold text-white md:text-3xl">
              Ready to Take Care of Your Health?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/90 md:text-base">
              Create your FamCare account and book an appointment with
              the right healthcare professional.
            </p>

            <Link
              to="/register"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#E51E2A] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#C91824]"
            >
              Get Started <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

