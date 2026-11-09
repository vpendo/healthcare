import Navbar from "../Components/Navbar";
import Footer from "../Components/footer";
import {
  HeartPulse,
  Eye,
  Target,
  Users,
  Lightbulb,
  HandHeart,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

import clinicHero from "../assets/clinic.webp";
import doctImage from "../assets/team/jul.jpg";
import doctorsImage from "../assets/team/nku.webp";
import doctors from "../assets/team/paz.png";
import doct from "../assets/team/ves.png";

const values = [
  {
    title: "Our Mission",
    description: "Make healthcare access easier through simple technology.",
    icon: HeartPulse,
  },
  {
    title: "Our Vision",
    description: "A future with easier access to care and less waiting.",
    icon: Eye,
  },
  {
    title: "Our Goal",
    description: "Connect patients, doctors, and receptionists in one place.",
    icon: Target,
  },
  {
    title: "Our Values",
    description: "Care, teamwork, trust, and people-first solutions.",
    icon: HandHeart,
  },
];

const team = [
  {
    name: "Adeodatus Nkundimana",
    role: "Team Member",
    description: "Contributing ideas and skills to build FamCare.",
    image: doctorsImage,
  },
  {
    name: "Julius Ishimwe",
    role: "Team Member",
    description: "Helping create a smooth user experience.",
    image: doctImage,
  },
  {
    name: "Patrick Rwibutso",
    role: "Team Member",
    description: "Helping solve healthcare challenges through technology.",
    image: doctors,
  },
  {
    name: "Vestine Pendo",
    role: "Team Member",
    description: "Bringing practical healthcare ideas to life.",
    image: doct,
  },
];

export default function About() {
  return (
    <>
      <Navbar />

      <main className="bg-white text-[#334155]">
        {/* Hero */}
        <section className="overflow-hidden bg-[#F1F8FD] px-5 py-12 sm:py-16 lg:py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-8">
            {/* Hero text */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#D7E8F5] bg-white px-4 py-2 text-sm font-semibold text-[#299BCF]">
                <HeartPulse size={18} className="text-[#E51E2A]" />
                About FamCare
              </span>

              <h1 className="mt-5 max-w-xl text-4xl font-extrabold leading-tight text-[#299BCF] sm:text-5xl lg:text-6xl">
                Better care, made simpler.
              </h1>

              <p className="mt-4 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
                Easy appointments, organized queues, and better-connected care.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#E51E2A] px-5 py-3 font-semibold text-white transition hover:bg-[#C91824]"
                >
                  Explore services
                  <ArrowRight size={18} />
                </Link>

                <Link
                  to="/register"
                  className="inline-flex items-center rounded-lg border border-[#55B9E8] bg-white px-5 py-3 font-semibold text-[#299BCF] transition hover:bg-[#EAF3FC]"
                >
                  Get started
                </Link>
              </div>

              
            </div>

            {/* Clinic image */}
            <div className="relative lg:-mr-10">
              <div className="relative overflow-hidden rounded-2xl sm:rounded-l-3xl sm:rounded-r-none">
                <img
                  src={clinicHero}
                  alt="Doctor consulting with a patient in a modern clinic"
                  className="h-[280px] w-full object-cover sm:h-[380px] lg:h-[480px]"
                />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#F1F8FD]/20 via-transparent to-transparent" />
              </div>

              <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-xl border border-[#D7E8F5] bg-white/95 p-3 sm:bottom-6 sm:left-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#EAF3FC] text-[#299BCF]">
                  <HeartPulse size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-800">
                    Care made simpler
                  </p>
                  <p className="text-xs text-slate-500">
                    Better clinic experiences
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission, vision, goal and values */}
        <section className="px-5 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-10 max-w-xl text-center">
              <p className="font-semibold text-[#E51E2A]">What guides us</p>
              <h2 className="mt-2 text-3xl font-extrabold text-[#299BCF] sm:text-4xl">
                Our purpose
              </h2>
              <p className="mt-3 text-slate-600">
                Better healthcare experiences through technology.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.title}
                    className="rounded-2xl border border-[#D7E8F5] bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF3FC] text-[#299BCF]">
                      <Icon size={25} />
                    </div>

                    <h3 className="text-xl font-bold text-slate-800">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {item.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* What we do */}
        <section className="bg-[#F1F8FD] px-5 py-16 sm:py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2">
            <div className="overflow-hidden rounded-3xl border-4 border-white">
              <img
                src={doctImage}
                alt="Healthcare team member"
                className="h-72 w-full object-cover sm:h-96"
              />
            </div>

            <div>
              <p className="font-semibold text-[#E51E2A]">What we do</p>
              <h2 className="mt-2 text-3xl font-extrabold text-[#299BCF] sm:text-4xl">
                Technology with people at its heart.
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                FamCare helps patients book appointments, helps receptionists
                manage queues, and helps doctors organize their schedules.
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <span className="rounded-lg bg-white p-2 text-[#299BCF]">
                    <Users size={21} />
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-800">
                      Connected care
                    </h3>
                    <p className="text-sm text-slate-600">
                      Bringing patients and clinic teams together.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="rounded-lg bg-white p-2 text-[#299BCF]">
                    <Lightbulb size={21} />
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-800">
                      Smarter support
                    </h3>
                    <p className="text-sm text-slate-600">
                      Making clinic visits easier to organize.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="px-5 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 text-center">
              <p className="font-semibold text-[#E51E2A]">Meet our team</p>
              <h2 className="mt-2 text-3xl font-extrabold text-[#299BCF] sm:text-4xl">
                People behind the idea
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-slate-600">
                A team combining skills and ideas to improve healthcare
                experiences.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((member) => (
                <article
                  key={member.name}
                  className="overflow-hidden rounded-2xl border border-[#D7E8F5] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-64 w-full bg-[#EAF3FC] object-cover object-center"
                  />

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-800">
                      {member.name}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-[#299BCF]">
                      {member.role}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {member.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="px-5 pb-16 sm:pb-20">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-3xl bg-[#299BCF] p-8 sm:flex-row sm:items-center sm:p-12">
            <div>
              <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                Your health journey matters.
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/90 sm:text-base">
                Discover a simpler way to manage clinic appointments.
              </p>
            </div>

            <Link
              to="/register"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#E51E2A] px-5 py-3 font-semibold text-white transition hover:bg-[#C91824]"
            >
              Get started
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
