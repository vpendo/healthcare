
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  Glasses,
  ShieldCheck,
  CalendarCheck,
  CheckCircle2,
  Activity,
  AlertCircle,
  ScanEye,
} from "lucide-react";

import Navbar from "../Components/Navbar";
import Footer from "../Components/footer";

const concerns = [
  {
    icon: Eye,
    title: "Blurred Vision",
    description:
      "Difficulty seeing clearly at near or far distances can affect everyday activities.",
  },
  {
    icon: Activity,
    title: "Eye Strain",
    description:
      "Eye discomfort or tiredness, especially after reading or spending time on screens.",
  },
  {
    icon: AlertCircle,
    title: "Redness and Irritation",
    description:
      "Red, itchy, watery, or uncomfortable eyes that may need professional attention.",
  },
  {
    icon: ScanEye,
    title: "Vision Changes",
    description:
      "Changes in your eyesight that make reading, driving, or recognising objects difficult.",
  },
  {
    icon: Glasses,
    title: "Glasses and Vision Support",
    description:
      "Support with understanding your vision needs and whether corrective lenses may help.",
  },
  {
    icon: CalendarCheck,
    title: "Routine Eye Checks",
    description:
      "Regular eye examinations to help monitor your vision and overall eye health.",
  },
];

const services = [
  {
    title: "Eye Examinations",
    description:
      "A qualified eye care professional assesses your vision and checks your eye health.",
  },
  {
    title: "Vision Assessment",
    description:
      "Get an assessment of your eyesight and discuss any changes or difficulties you experience.",
  },
  {
    title: "Vision Correction Guidance",
    description:
      "Receive guidance about options such as glasses based on your examination results.",
  },
];

const careTips = [
  "Take regular breaks when using computers and other digital screens.",
  "Avoid rubbing your eyes, especially with unwashed hands.",
  "Wear appropriate eye protection when needed.",
  "Schedule regular eye examinations.",
];

const visitSteps = [
  {
    number: "01",
    title: "Create an account",
    description:
      "Register with FamCare to access your personal patient dashboard.",
  },
  {
    number: "02",
    title: "Describe your concern",
    description:
      "Share your vision concerns and symptoms when booking your appointment.",
  },
  {
    number: "03",
    title: "Choose an appointment",
    description:
      "View available doctors and select a suitable appointment time.",
  },
];

export default function OpticalCare() {
  return (
    <>
      <Navbar />

      <main className="bg-[#F1F8FD]">
        {/* Hero Section */}
        <section
          className="relative flex min-h-[500px] items-center overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://media.istockphoto.com/id/2016648561/photo/trial-frame-glasses-for-eye-test.jpg?s=612x612&w=0&k=20&c=iUkBrVv_SlIjzbxEbowvbWI8H7I_ZnHF7ziQccYEUxo=')",
          }}
        >
          {/* Light gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/30" />

          <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-20 lg:px-8">
            <div className="max-w-2xl">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold uppercase tracking-wider text-[#E51E2A] shadow-sm">
                <Eye size={18} />
                Optical Care
              </span>

              <h1 className="text-3xl font-bold leading-tight text-[#299BCF] md:text-4xl lg:text-5xl">
                Clearer vision,
                <span className="text-[#E51E2A]">
                  {" "}healthier eyes.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-gray-600">
                Your eyesight is important in everything you do.
                Get support with vision concerns, eye examinations
                and practical guidance to help you care for your eyes.
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
                  Make your eye health part of your wellbeing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Introduction */}
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:grid-cols-2 lg:px-8">
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-[#E51E2A]">
              About Optical Care
            </span>

            <h2 className="mt-3 text-2xl font-bold leading-tight text-[#299BCF] md:text-3xl">
              Give your vision the attention it deserves
            </h2>

            <p className="mt-5 leading-7 text-gray-600">
              Good eye health plays an important role in your daily
              life. Regular eye examinations help monitor your vision
              and identify possible eye health concerns.
            </p>

            <p className="mt-4 leading-7 text-gray-600">
              Whether you experience blurred vision, eye discomfort
              or simply need a routine check, an eye care professional
              can assess your needs and guide you on the next steps.
            </p>

            <div className="mt-7 flex items-center gap-3 rounded-xl border border-[#D7E8F5] bg-white p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EAF3FC]">
                <Eye size={23} className="text-[#299BCF]" />
              </div>

              <p className="text-sm font-medium leading-6 text-gray-600">
                Healthy vision supports your everyday activities
                and overall quality of life.
              </p>
            </div>
          </div>

          <div className="relative">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShmFcvFq87BrS1icPL6zKAuMeKjPA8FjQA1Ft8RqC5kKIHWlTS2_3zi0CA&s=10"
              alt="Professional eye examination"
              className="h-[420px] w-full rounded-3xl object-cover shadow-lg"
            />

            <div className="absolute -bottom-5 left-5 right-5 rounded-2xl border border-[#D7E8F5] bg-white p-5 shadow-lg md:left-8 md:right-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF3FC]">
                  <Glasses size={26} className="text-[#299BCF]" />
                </div>

                <div>
                  <p className="font-bold text-[#299BCF]">
                    Better vision care
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Regular checks and professional guidance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Common Eye Concerns */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="text-sm font-semibold uppercase tracking-widest text-[#E51E2A]">
                Eye Health Concerns
              </span>

              <h2 className="mt-3 text-2xl font-bold text-[#299BCF] md:text-3xl">
                What can you visit for?
              </h2>

              <p className="mt-4 leading-7 text-gray-600">
                An eye care consultation can help you understand
                and address different vision and eye health concerns.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {concerns.map((concern) => {
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

        {/* Optical Services */}
        <section className="bg-[#F1F8FD] py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="text-sm font-semibold uppercase tracking-widest text-[#E51E2A]">
                Our Optical Services
              </span>

              <h2 className="mt-3 text-2xl font-bold text-[#299BCF] md:text-3xl">
                Supporting your vision and eye health
              </h2>

              <p className="mt-4 leading-7 text-gray-600">
                Explore different ways an eye care professional
                can help you understand and care for your eyesight.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {services.map((service, index) => {
                const icons = [Eye, ScanEye, Glasses];
                const Icon = icons[index];

                return (
                  <article
                    key={service.title}
                    className="rounded-2xl border border-[#D7E8F5] bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#EAF3FC] text-[#299BCF]">
                      <Icon size={27} />
                    </div>

                    <h3 className="text-lg font-bold text-[#299BCF]">
                      {service.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-gray-600">
                      {service.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Importance of Eye Care */}
        <section className="bg-white py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 md:grid-cols-2 lg:px-8">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=85"
                alt="Woman wearing glasses"
                className="h-[380px] w-full rounded-3xl object-cover shadow-lg"
              />
            </div>

            <div>
              <span className="text-sm font-semibold uppercase tracking-widest text-[#E51E2A]">
                Why Eye Care Matters
              </span>

              <h2 className="mt-3 text-2xl font-bold leading-tight text-[#299BCF] md:text-3xl">
                Small habits can make a difference
              </h2>

              <p className="mt-5 leading-7 text-gray-600">
                Taking care of your eyes is part of taking care of
                your overall health. Everyday habits can help reduce
                eye strain and support healthy vision.
              </p>

              <div className="mt-6 space-y-4">
                {careTips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2
                      size={21}
                      className="mt-1 shrink-0 text-[#299BCF]"
                    />

                    <p className="text-sm leading-7 text-gray-600">
                      {tip}
                    </p>
                  </div>
                ))}
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

        {/* Emergency Notice */}
        <section className="bg-white px-5 py-12 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-start gap-4 rounded-2xl border border-[#E51E2A]/20 bg-[#EAF3FC] p-6">
            <AlertCircle
              className="mt-1 shrink-0 text-[#E51E2A]"
              size={25}
            />

            <div>
              <h3 className="text-lg font-bold text-[#299BCF]">
                When to seek urgent eye care
              </h3>

              <p className="mt-2 text-sm leading-7 text-gray-600">
                Sudden vision loss, sudden changes in eyesight,
                severe eye pain or an eye injury need urgent medical
                assessment. Do not wait for a routine appointment
                if you experience these symptoms.
              </p>
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
              Make your eye health a priority.
            </h2>

            <p className="mt-4 leading-7 text-white/90">
              Create your FamCare account and arrange an eye
              examination to take better care of your vision.
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
