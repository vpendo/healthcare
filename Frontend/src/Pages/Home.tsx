import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  HeartPulse,
  ShieldCheck,
} from "lucide-react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/footer";
import doctorImage from "../assets/docts.avif";

const features = [
  {
    icon: CalendarDays,
    title: "Easy Appointments",
    description: "Book a clinic visit without unnecessary steps.",
  },
  {
    icon: Clock,
    title: "Queue Updates",
    description: "Know your queue status and spend less time waiting.",
  },
  {
    icon: HeartPulse,
    title: "AI Health Intake",
    description:
      "Describe your symptoms to help identify the right specialty.",
  },
];

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="overflow-x-hidden bg-white text-[#262626]">
        {/* Hero */}
        <section className="relative isolate flex min-h-[540px] items-center overflow-hidden bg-[#EAF3FC] sm:min-h-[600px] lg:min-h-[680px]">
          <div className="absolute inset-0">
            <img
              src={doctorImage}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover object-[60%_center] sm:object-center"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-[#F1F8FD]/90 via-[#F1F8FD]/75 to-[#F1F8FD]/35 sm:from-[#F1F8FD]/85 sm:via-[#F1F8FD]/60 sm:to-[#F1F8FD]/20 lg:from-[#F1F8FD]/80 lg:via-[#F1F8FD]/45 lg:to-transparent" />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-14 sm:px-8 sm:py-20 lg:px-12">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#55B9E8]/40 bg-white/90 px-3 py-2 text-xs font-semibold text-[#299BCF] sm:mb-6 sm:px-4 sm:text-sm">
                <HeartPulse size={18} />
                Healthcare made easier
              </div>

              <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                Better care starts with{" "}
                <span className="text-[#299BCF]">FamCare.</span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-gray-700 sm:mt-6 sm:text-base sm:leading-8 lg:text-lg">
                Book appointments, find the right doctor, and follow your
                clinic queue in one place. FamCare helps make every clinic
                visit simpler.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-4">
                <Link
                  to="/register"
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#E51E2A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#C91824] sm:w-auto sm:px-6 sm:text-base"
                >
                  Book an Appointment
                  <ArrowRight size={19} />
                </Link>

                <Link
                  to="/services"
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-[#55B9E8] bg-white/90 px-5 py-3 text-sm font-semibold text-[#299BCF] transition hover:bg-[#EAF3FC] sm:w-auto sm:px-6 sm:text-base"
                >
                  Explore Services
                </Link>
              </div>

              <div className="mt-6 flex flex-col gap-3 text-sm font-medium text-gray-700 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-x-6">
                <span className="flex items-center gap-2">
                  <ShieldCheck
                    size={18}
                    className="shrink-0 text-[#299BCF]"
                  />
                  Simple and convenient
                </span>

                <span className="flex items-center gap-2">
                  <HeartPulse
                    size={18}
                    className="shrink-0 text-[#299BCF]"
                  />
                  Patient-focused care
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
          <div className="mx-auto mb-9 max-w-2xl text-center sm:mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#299BCF] sm:text-sm">
              How FamCare helps
            </p>

            <h2 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">
              A simpler way to manage clinic visits
            </h2>

            <p className="mt-4 text-sm leading-7 text-gray-600 sm:text-base">
              Spend less time figuring out your visit and more time focusing
              on your health.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-[#D7E8F5] bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg sm:p-7"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF3FC] sm:h-14 sm:w-14">
                    <Icon size={26} className="text-[#299BCF]" />
                  </div>

                  <h3 className="text-lg font-semibold sm:text-xl">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-gray-600 sm:text-base">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Call to action */}
        <section className="bg-[#F1F8FD] px-4 py-12 text-center sm:px-8 sm:py-16">
          <h2 className="mx-auto max-w-3xl text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">
            Ready to make your next visit easier?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-600 sm:text-base">
            Get started with FamCare and manage your clinic appointments
            in one place.
          </p>

          <Link
            to="/register"
            className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#E51E2A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#C91824] sm:mt-7 sm:text-base"
          >
            Get Started
            <ArrowRight size={19} />
          </Link>
        </section>
      </main>

      {/* Shared responsive footer */}
      <Footer />
    </>
  );
}
