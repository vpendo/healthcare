
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Stethoscope,
  Heart,
  Eye,
  CalendarCheck,
  ShieldCheck,
  CheckCircle2,
  Languages,
} from "lucide-react";

import Navbar from "../Components/Navbar";
import Footer from "../Components/footer";

const services = [
  {
    title: "General Consultation",
    path: "/services/general-consultation",
    description:
      "Whether you have a health concern or need a routine checkup, a general consultation is a good place to start. Get support with your everyday health needs.",
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=900&q=85",
    icon: Stethoscope,
    features: [
      "Routine health checkups",
      "General health assessments",
      "Consultations with a general practitioner",
    ],
  },
  {
    title: "Dental Care",
    path: "/services/dental-care",
    description:
      "Healthy teeth and gums are an important part of your overall wellbeing. Find support for your oral health through dental consultations and checkups.",
    image:
      "https://trinityfd.com/wp-content/uploads/2019/04/whitbydentalclinic_oralcare.jpg",
    icon: Heart,
    features: [
      "Oral health checkups",
      "Dental examinations",
      "Preventive oral care",
    ],
  },
  {
    title: "Optical Care",
    path: "/services/optical-care",
    description:
      "Your eyesight deserves attention. Explore eye care consultations and assessments to help you understand and look after your vision.",
    image:
      "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=900&q=85",
    icon: Eye,
    features: [
      "Eye examinations",
      "Vision assessments",
      "Eye health consultations",
    ],
  },
];

const steps = [
  {
    number: "01",
    icon: ShieldCheck,
    title: "Create an account",
    description:
      "Register with FamCare to access your personal patient dashboard and manage your appointments.",
  },
  {
    number: "02",
    icon: Languages,
    title: "Describe your symptoms",
    description:
      "Tell us how you feel in English or Kinyarwanda. Our AI assistant can suggest a suitable medical specialty.",
  },
  {
    number: "03",
    icon: CalendarCheck,
    title: "Book your appointment",
    description:
      "Choose an available doctor and select an appointment time that works for you.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <Navbar />

      <main className="bg-[#F1F8FD]">
        {/* Hero Section */}
        <section
          className="relative flex min-h-[550px] items-center overflow-hidden bg-cover bg-center md:min-h-[600px]"
          style={{
            backgroundImage:
              "url('https://www.call4health.com/wp-content/uploads/2023/05/Physician-Answering-Service.webp')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/35" />

          <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-20 lg:px-8">
            <div className="max-w-2xl">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#299BCF] shadow-sm">
                <Heart size={16} className="text-[#E51E2A]" />
                Here for your wellbeing
              </span>

              <h1 className="text-3xl font-bold leading-tight text-[#299BCF] md:text-4xl lg:text-5xl">
                Care that puts
                <span className="text-[#E51E2A]"> you </span>
                first.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-gray-600">
                Finding the right care should not feel complicated.
                FamCare makes it easier to explore healthcare services,
                find available appointments and stay organised throughout
                your clinic visit.
              </p>

              <Link
                to="/register"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#E51E2A] px-7 py-3.5 font-semibold text-white shadow-md transition hover:bg-[#C91824]"
              >
                Create your account
                <ArrowRight size={18} />
              </Link>

              <div className="mt-9 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
                  <ShieldCheck size={24} className="text-[#299BCF]" />
                </div>
                <p className="max-w-xs text-sm leading-6 text-gray-600">
                  A simpler way to organise your clinic appointments.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-[#E51E2A]">
              Our Services
            </span>

            <h2 className="mt-3 text-2xl font-bold text-[#299BCF] md:text-3xl">
              Care for your everyday health needs
            </h2>

            <p className="mt-4 leading-7 text-gray-600">
              From general consultations to dental and optical care,
              explore the healthcare services available through FamCare.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <article
                  key={service.title}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-[#D7E8F5] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative h-56 shrink-0 overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <div className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#299BCF] shadow-md">
                      <Icon size={25} />
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-lg font-bold text-[#299BCF]">
                      {service.title}
                    </h3>

                    <p className="mt-3 min-h-[84px] text-sm leading-7 text-gray-600">
                      {service.description}
                    </p>

                    <ul className="mt-5 space-y-3">
                      {service.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2 text-sm text-gray-600"
                        >
                          <CheckCircle2
                            size={17}
                            className="shrink-0 text-[#55B9E8]"
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto pt-6">
                      <Link
                        to={service.path}
                        className="inline-flex items-center gap-2 font-semibold text-[#299BCF] transition-colors hover:text-[#E51E2A]"
                      >
                        Learn More
                        <ArrowRight
                          size={17}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="text-sm font-semibold uppercase tracking-widest text-[#E51E2A]">
                Getting Started
              </span>

              <h2 className="mt-3 text-2xl font-bold text-[#299BCF] md:text-3xl">
                Getting started is simple
              </h2>

              <p className="mt-4 leading-7 text-gray-600">
                A few simple steps help you find the right specialty
                and arrange your clinic appointment.
              </p>
            </div>

            <div className="grid gap-10 md:grid-cols-3">
              {steps.map((step) => {
                const Icon = step.icon;

                return (
                  <div key={step.number} className="text-center">
                    <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#EAF3FC]">
                      <Icon size={34} className="text-[#299BCF]" />

                      <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#E51E2A] text-sm font-bold text-white">
                        {step.number}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#299BCF]">
                      {step.title}
                    </h3>

                    <p className="mx-auto mt-3 max-w-xs text-sm leading-7 text-gray-600">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* AI Intake Section */}
        <section className="bg-[#EAF3FC] py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 md:grid-cols-2 lg:px-8">
            <div>
              <span className="text-sm font-semibold uppercase tracking-widest text-[#E51E2A]">
                AI Intake Assistant
              </span>

              <h2 className="mt-3 text-2xl font-bold leading-tight text-[#299BCF] md:text-3xl">
                A little guidance before you book
              </h2>

              <p className="mt-5 leading-7 text-gray-600">
                Not sure which specialty to choose? Describe your
                symptoms in your own words. FamCare's AI intake
                assistant can suggest a suitable specialty and prepare
                a short summary of your concerns for the doctor.
              </p>

              <div className="mt-6 flex items-start gap-3">
                <Languages
                  size={24}
                  className="mt-1 shrink-0 text-[#299BCF]"
                />
                <p className="leading-7 text-gray-600">
                  You can describe your symptoms in English or
                  Kinyarwanda, making the process easier and more
                  comfortable.
                </p>
              </div>

              <p className="mt-5 border-l-4 border-[#E51E2A] pl-4 text-sm leading-7 text-gray-600">
                If potentially urgent symptoms are detected, FamCare
                displays an emergency message instead of booking slots.
                The assistant does not diagnose conditions or recommend
                treatment. This is not medical advice. In an emergency,
                seek immediate medical assistance or call 912.
              </p>
            </div>

            <div>
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScQ6-4uqvZfaFRiOSRd0N8nUD-gapKX7_92RYi9D_RlfusCgDA2CArj1wm&s=10"
                alt="Healthcare professional using digital technology"
                className="h-[350px] w-full rounded-3xl object-cover shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* Closing Section */}
        <section className="bg-[#299BCF] px-5 py-16 text-center">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-2xl font-bold text-white md:text-3xl">
              Your health deserves attention.
            </h2>

            <p className="mt-4 leading-7 text-white/90">
              Explore our services and use FamCare to make managing
              your clinic appointments easier.
            </p>

            <p className="mt-5 text-sm font-medium text-white/90">
              Here to make every visit a little simpler.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
