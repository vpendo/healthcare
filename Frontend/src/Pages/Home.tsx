import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Stethoscope,
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
    description: "Describe your symptoms to help identify the right specialty.",
  },
];

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="overflow-x-hidden bg-white text-[#262626]">
        {/* Hero */}
        <section className="home-hero relative flex items-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={doctorImage}
              alt=""
              aria-hidden="true"
              className="home-hero__image h-full w-full object-cover object-[60%_center] sm:object-center"
            />

            <div className="home-hero__overlay absolute inset-0" />
          </div>

          <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:px-12">
            <div className="home-hero__content max-w-2xl">
              <div className="home-hero__badge mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold text-[#1479A8] sm:mb-6 sm:px-4 sm:text-sm">
                <HeartPulse size={18} />
                Healthcare made easier
              </div>

              <h1 className="home-hero__title text-4xl font-extrabold leading-[1.08] sm:text-5xl md:text-6xl lg:text-7xl">
                Better care starts with{" "}
                <span className="text-[#299BCF]">FamCare.</span>
              </h1>

              <p className="home-hero__description mt-5 max-w-xl text-base leading-7 sm:mt-6 sm:text-lg sm:leading-8">
                Book appointments, find the right doctor, and follow your clinic
                queue in one place. FamCare helps make every clinic visit
                simpler.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:gap-4">
                <Link
                  to="/register"
                  className="home-hero__primary inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#E51E2A] px-5 py-3 text-sm font-bold text-white transition duration-200 hover:bg-[#C91824] sm:w-auto sm:px-6 sm:text-base"
                >
                  Book an Appointment
                  <ArrowRight size={19} />
                </Link>

                <Link
                  to="/services"
                  className="home-hero__secondary inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border bg-white/80 px-5 py-3 text-sm font-bold text-[#1479A8] transition duration-200 hover:-translate-y-0.5 hover:bg-white sm:w-auto sm:px-6 sm:text-base"
                >
                  Explore Services
                </Link>
              </div>

              <div className="home-hero__trust mt-7 flex flex-col gap-3 text-sm font-semibold sm:mt-9 sm:flex-row sm:flex-wrap sm:gap-x-6">
                <span className="flex items-center gap-2">
                  <ShieldCheck size={18} className="shrink-0 text-[#299BCF]" />
                  Simple and convenient
                </span>

                <span className="flex items-center gap-2">
                  <HeartPulse size={18} className="shrink-0 text-[#299BCF]" />
                  Patient-focused care
                </span>
              </div>
            </div>

            <div className="home-hero__card hidden w-full max-w-sm justify-self-end rounded-3xl p-6 sm:p-7 lg:block">
              <div className="flex items-center gap-4">
                <div className="home-hero__card-icon flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl">
                  <HeartPulse size={29} className="text-[#1479A8]" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#299BCF]">
                    Your care, connected
                  </p>
                  <h2 className="mt-1 text-xl font-extrabold text-[#18394c]">
                    One simpler visit
                  </h2>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 rounded-2xl bg-[#F5FAFD] p-3.5">
                  <CalendarDays size={20} className="text-[#299BCF]" />
                  <span className="text-sm font-semibold text-slate-700">
                    Appointments in one place
                  </span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-[#F5FAFD] p-3.5">
                  <Stethoscope size={20} className="text-[#299BCF]" />
                  <span className="text-sm font-semibold text-slate-700">
                    Find the right care
                  </span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-[#F5FAFD] p-3.5">
                  <Clock size={20} className="text-[#299BCF]" />
                  <span className="text-sm font-semibold text-slate-700">
                    Keep up with your queue
                  </span>
                </div>
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
              Spend less time figuring out your visit and more time focusing on
              your health.
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
            Get started with FamCare and manage your clinic appointments in one
            place.
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
