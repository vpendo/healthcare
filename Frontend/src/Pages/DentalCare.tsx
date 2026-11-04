
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Heart,
  Smile,
  ShieldCheck,
  CalendarCheck,
  CheckCircle2,
  Stethoscope,
  Activity,
  AlertCircle,
  Sparkles,
} from "lucide-react";

import Navbar from "../Components/Navbar";
import Footer from "../Components/footer";

const dentalConcerns = [
  {
    icon: Activity,
    title: "Toothache",
    description:
      "Get help with tooth pain, sensitivity or discomfort when eating and drinking.",
  },
  {
    icon: Heart,
    title: "Gum problems",
    description:
      "Discuss bleeding gums, swelling, tenderness or other changes in your gums.",
  },
  {
    icon: Smile,
    title: "Tooth decay",
    description:
      "Have your teeth checked for cavities, damage or signs of decay.",
  },
  {
    icon: AlertCircle,
    title: "Bad breath",
    description:
      "Discuss persistent bad breath and possible oral health concerns.",
  },
  {
    icon: ShieldCheck,
    title: "Preventive care",
    description:
      "Get advice on keeping your teeth and gums healthy through regular care.",
  },
  {
    icon: Stethoscope,
    title: "Routine dental checks",
    description:
      "Arrange regular examinations to monitor your overall oral health.",
  },
];

const dentalServices = [
  {
    title: "Dental examinations",
    description:
      "A dental professional checks your teeth and gums to identify possible concerns.",
  },
  {
    title: "Oral hygiene guidance",
    description:
      "Learn practical ways to care for your teeth and maintain healthy gums.",
  },
  {
    title: "Preventive dental care",
    description:
      "Discuss ways to reduce the risk of tooth decay and other oral health problems.",
  },
];

const visitSteps = [
  {
    number: "01",
    title: "Create an account",
    description:
      "Register with FamCare to access your patient dashboard.",
  },
  {
    number: "02",
    title: "Describe your concern",
    description:
      "Tell us about your dental concern when booking your appointment.",
  },
  {
    number: "03",
    title: "Choose an appointment",
    description:
      "View available doctors and select a suitable appointment time.",
  },
];

export default function DentalCare() {
  return (
    <>
      <Navbar />

      <main className="bg-[#F1F8FD]">
        {/* Hero Section */}
        <section
          className="relative flex min-h-[500px] items-center overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.stockcake.com/public/6/7/d/67db603f-58a5-451d-aaa7-f9a1ad1579fc_large/modern-dental-care-stockcake.jpg')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/30" />

          <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-20 lg:px-8">
            <div className="max-w-2xl">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold uppercase tracking-wider text-[#E51E2A] shadow-sm">
                <Smile size={18} />
                Dental Care
              </span>

              <h1 className="text-3xl font-bold leading-tight text-[#299BCF] md:text-4xl lg:text-5xl">
                Healthy teeth,
                <span className="text-[#E51E2A]">
                  {" "}confident smiles.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-gray-600">
                Your oral health is an important part of your
                overall wellbeing. Get support with dental concerns
                and learn how to care for your teeth and gums.
              </p>

              <Link
                to="/register"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#E51E2A] px-7 py-3.5 font-semibold text-white shadow-md transition hover:bg-[#C91824]"
              >
                Book an Appointment
                <ArrowRight size={18} />
              </Link>

              <div className="mt-8 flex items-center gap-3">
                <ShieldCheck
                  size={24}
                  className="shrink-0 text-[#299BCF]"
                />
                <p className="text-sm text-gray-600">
                  Take a step towards better oral health.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Introduction */}
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:grid-cols-2 lg:px-8">
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-[#E51E2A]">
              About Dental Care
            </span>

            <h2 className="mt-3 text-2xl font-bold leading-tight text-[#299BCF] md:text-3xl">
              Give your oral health the attention it deserves
            </h2>

            <p className="mt-5 leading-7 text-gray-600">
              Dental care helps you maintain healthy teeth and gums
              through regular checkups, examinations and professional
              guidance.
            </p>

            <p className="mt-4 leading-7 text-gray-600">
              Whether you are experiencing tooth pain, gum problems
              or simply need a routine checkup, a dental professional
              can assess your concerns and discuss suitable care.
            </p>

            <div className="mt-7 flex items-center gap-3 rounded-xl border border-[#D7E8F5] bg-white p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EAF3FC]">
                <Heart size={23} className="text-[#299BCF]" />
              </div>

              <p className="text-sm font-medium leading-6 text-gray-600">
                Looking after your teeth is part of looking after
                your overall health.
              </p>
            </div>
          </div>

          <div className="relative">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0yyA4eS0A1KWVG4CEgQyyAiudgr1CO6X7cruabPDqVxKdFs0XH_cSkubw&s=10"
              alt="Dental professional providing oral care"
              className="h-[420px] w-full rounded-3xl object-cover shadow-lg"
            />

            <div className="absolute -bottom-5 left-5 right-5 rounded-2xl border border-[#D7E8F5] bg-white p-5 shadow-lg md:left-8 md:right-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF3FC]">
                  <Smile size={26} className="text-[#299BCF]" />
                </div>

                <div>
                  <p className="font-bold text-[#299BCF]">
                    Better oral health
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Regular checkups and professional guidance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Common Dental Concerns */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="text-sm font-semibold uppercase tracking-widest text-[#E51E2A]">
                Dental Concerns
              </span>

              <h2 className="mt-3 text-2xl font-bold text-[#299BCF] md:text-3xl">
                What can you visit for?
              </h2>

              <p className="mt-4 leading-7 text-gray-600">
                A dental consultation can help you understand
                and address different oral health concerns.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {dentalConcerns.map((concern) => {
                const Icon = concern.icon;

                return (
                  <article
                    key={concern.title}
                    className="group rounded-2xl border border-[#D7E8F5] bg-[#F1F8FD] p-7 transition duration-300 hover:-translate-y-1 hover:border-[#55B9E8] hover:shadow-lg"
                  >
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-white text-[#299BCF] shadow-sm transition group-hover:bg-[#299BCF] group-hover:text-white">
                      <Icon size={27} />
                    </div>

                    <h3 className="text-lg font-bold text-[#299BCF]">
                      {concern.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-gray-600">
                      {concern.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Dental Services */}
        <section className="bg-[#F1F8FD] py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="text-sm font-semibold uppercase tracking-widest text-[#E51E2A]">
                Our Dental Services
              </span>

              <h2 className="mt-3 text-2xl font-bold text-[#299BCF] md:text-3xl">
                Supporting your dental health
              </h2>

              <p className="mt-4 leading-7 text-gray-600">
                Explore different ways a dental professional
                can help you care for your oral health.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {dentalServices.map((service) => (
                <article
                  key={service.title}
                  className="rounded-2xl border border-[#D7E8F5] bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#EAF3FC] text-[#299BCF]">
                    <CheckCircle2 size={27} />
                  </div>

                  <h3 className="text-lg font-bold text-[#299BCF]">
                    {service.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-gray-600">
                    {service.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Importance of Dental Care */}
        <section className="bg-white py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 md:grid-cols-2 lg:px-8">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=1000&q=85"
                alt="Dental care equipment"
                className="h-[380px] w-full rounded-3xl object-cover shadow-lg"
              />
            </div>

            <div>
              <span className="text-sm font-semibold uppercase tracking-widest text-[#E51E2A]">
                Why Dental Care Matters
              </span>

              <h2 className="mt-3 text-2xl font-bold leading-tight text-[#299BCF] md:text-3xl">
                Small steps can make a difference
              </h2>

              <p className="mt-5 leading-7 text-gray-600">
                Taking care of your teeth and gums can help prevent
                common oral health problems and support your
                general wellbeing.
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={21}
                    className="mt-1 shrink-0 text-[#299BCF]"
                  />
                  <p className="text-sm leading-7 text-gray-600">
                    Brush your teeth twice a day using fluoride
                    toothpaste.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={21}
                    className="mt-1 shrink-0 text-[#299BCF]"
                  />
                  <p className="text-sm leading-7 text-gray-600">
                    Clean between your teeth every day.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={21}
                    className="mt-1 shrink-0 text-[#299BCF]"
                  />
                  <p className="text-sm leading-7 text-gray-600">
                    Limit sugary foods and drinks.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={21}
                    className="mt-1 shrink-0 text-[#299BCF]"
                  />
                  <p className="text-sm leading-7 text-gray-600">
                    Visit a dental professional regularly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Booking Process */}
        <section className="bg-[#EAF3FC] py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="text-sm font-semibold uppercase tracking-widest text-[#E51E2A]">
                Booking Process
              </span>

              <h2 className="mt-3 text-2xl font-bold text-[#299BCF] md:text-3xl">
                Three steps to book your visit
              </h2>

              <p className="mt-4 leading-7 text-gray-600">
                Getting started with FamCare is simple.
              </p>
            </div>

            <div className="grid gap-10 md:grid-cols-3">
              {visitSteps.map((step) => (
                <div key={step.number} className="text-center">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-lg font-bold text-[#299BCF] shadow-sm">
                    {step.number}
                  </div>

                  <h3 className="text-lg font-bold text-[#299BCF]">
                    {step.title}
                  </h3>

                  <p className="mx-auto mt-3 max-w-xs text-sm leading-7 text-gray-600">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-[#299BCF] px-5 py-16 text-center">
          <div className="mx-auto max-w-2xl">
            <CalendarCheck
              size={38}
              className="mx-auto text-white"
            />

            <h2 className="mt-5 text-2xl font-bold text-white md:text-3xl">
              Make your oral health a priority.
            </h2>

            <p className="mt-4 leading-7 text-white/90">
              Create your FamCare account and arrange a dental
              appointment to take care of your smile.
            </p>

            <Link
              to="/register"
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#E51E2A] px-7 py-3.5 font-semibold text-white transition hover:bg-[#C91824]"
            >
              Book an Appointment
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
