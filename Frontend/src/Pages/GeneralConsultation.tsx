
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Stethoscope,
  Heart,
  ClipboardCheck,
  CalendarCheck,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Brain,
  Thermometer,
  Salad,
  UserRound,
  Droplets,
  Wind,
  Sparkles,
  FileText,
  Languages,
} from "lucide-react";

import Navbar from "../Components/Navbar";
import Footer from "../Components/footer";

const commonConcerns = [
  {
    icon: Brain,
    title: "Headaches",
    description:
      "Frequent headaches, migraines or pressure in your head.",
  },
  {
    icon: Thermometer,
    title: "Fever and malaria-related symptoms",
    description:
      "Fever, chills, sweating, body aches or weakness.",
  },
  {
    icon: Salad,
    title: "Stomach pain",
    description:
      "Stomach cramps, nausea, vomiting or abdominal pain.",
  },
  {
    icon: Droplets,
    title: "Dehydration and weakness",
    description:
      "Dizziness, unusual tiredness, excessive thirst or fluid loss.",
  },
  {
    icon: Wind,
    title: "Cough and respiratory concerns",
    description:
      "Persistent cough, sore throat, nasal congestion or breathing difficulties.",
  },
  {
    icon: Activity,
    title: "General body pain",
    description:
      "Muscle aches, joint pain or unexplained body discomfort.",
  },
];

const reasons = [
  {
    icon: ClipboardCheck,
    title: "Routine health checks",
    description:
      "Check your general health, even when you feel well.",
  },
  {
    icon: Heart,
    title: "Ongoing health concerns",
    description:
      "Get help with symptoms that keep returning or changes in your health.",
  },
  {
    icon: ShieldCheck,
    title: "Professional guidance",
    description:
      "Discuss whether you need further tests, treatment or specialist care.",
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
    title: "Explain how you feel",
    description:
      "Describe your symptoms in English or Kinyarwanda.",
  },
  {
    number: "03",
    title: "Choose an appointment",
    description:
      "View available doctors and select a suitable time.",
  },
];

const consultationSteps = [
  {
    number: "01",
    title: "Tell your story",
    description:
      "Explain how you feel, when it started and any changes you have noticed.",
  },
  {
    number: "02",
    title: "Get checked",
    description:
      "Your doctor asks questions and examines you to understand your condition.",
  },
  {
    number: "03",
    title: "Understand your care",
    description:
      "The doctor explains the findings and discusses suitable tests or treatment.",
  },
];

export default function GeneralConsultation() {
  return (
    <>
      <Navbar />

      <main className="bg-[#F1F8FD]">
        {/* Hero Section */}
        <section
          className="relative flex min-h-[500px] items-center overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1XqhXCVkvEKnT5HYRlfHzHlRO0DLai7pycslzwNUwjL3p4kKIUoSY4zo&s=10')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/35" />

          <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-20 lg:px-8">
            <div className="max-w-2xl">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold uppercase tracking-wider text-[#E51E2A] shadow-sm">
                <Stethoscope size={18} />
                General Consultation
              </span>

              <h1 className="text-3xl font-bold leading-tight text-[#299BCF] md:text-4xl lg:text-5xl">
                Understanding your health,
                <span className="text-[#E51E2A]">
                  {" "}one visit at a time.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-gray-600">
                From headaches and fever to stomach pain and other
                everyday health concerns, discuss your symptoms
                with a healthcare professional.
              </p>

              <Link
                to="/register"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#E51E2A] px-7 py-3.5 font-semibold text-white shadow-md transition hover:bg-[#C91824]"
              >
                Book an Appointment
                <ArrowRight size={18} />
              </Link>

              <div className="mt-8 flex items-center gap-3">
                <ShieldCheck size={24} className="shrink-0 text-[#299BCF]" />
                <p className="text-sm text-gray-600">
                  A starting point for discussing your health.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Introduction */}
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:grid-cols-2 lg:px-8">
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-[#E51E2A]">
              About General Consultation
            </span>

            <h2 className="mt-3 text-2xl font-bold leading-tight text-[#299BCF] md:text-3xl">
              Start with a conversation about how you feel
            </h2>

            <p className="mt-5 leading-7 text-gray-600">
              A general consultation gives you time to explain your
              symptoms, ask questions and discuss your health with
              a general practitioner.
            </p>

            <p className="mt-4 leading-7 text-gray-600">
              Whether you have a fever, headache, stomach pain
              or another concern, the doctor will help you understand
              what may be happening and what care you need.
            </p>

            <div className="mt-7 flex items-center gap-3 rounded-xl border border-[#D7E8F5] bg-white p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EAF3FC]">
                <UserRound size={23} className="text-[#299BCF]" />
              </div>
              <p className="text-sm font-medium leading-6 text-gray-600">
                Your symptoms and questions help guide the consultation.
              </p>
            </div>
          </div>

          <div className="relative">
            <img
              src="https://www.medavis.com/wp-content/uploads/iStock-1225782571_be.jpg"
              alt="Doctor discussing a patient's health"
              className="h-[420px] w-full rounded-3xl object-cover shadow-lg"
            />

            <div className="absolute -bottom-5 left-5 right-5 rounded-2xl border border-[#D7E8F5] bg-white p-5 shadow-lg md:left-8 md:right-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF3FC]">
                  <Stethoscope size={26} className="text-[#299BCF]" />
                </div>
                <div>
                  <p className="font-bold text-[#299BCF]">
                    General practitioner
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Discuss your symptoms and receive medical care.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Common Health Concerns */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="text-sm font-semibold uppercase tracking-widest text-[#E51E2A]">
                Conditions and Symptoms
              </span>

              <h2 className="mt-3 text-2xl font-bold text-[#299BCF] md:text-3xl">
                What can you visit for?
              </h2>

              <p className="mt-4 leading-7 text-gray-600">
                You can visit a general practitioner for symptoms
                such as:
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {commonConcerns.map((concern) => {
                const Icon = concern.icon;

                return (
                  <article
                    key={concern.title}
                    className="group rounded-2xl border border-[#D7E8F5] bg-[#F1F8FD] p-7 transition duration-300 hover:-translate-y-1 hover:border-[#55B9E8] hover:shadow-lg"
                  >
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-white text-[#299BCF] shadow-sm transition group-hover:bg-[#299BCF] group-hover:text-white">
                      <Icon size={27} />
                    </div>

                    <h3 className="text-base font-bold text-[#299BCF]">
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

        {/* Additional Consultation Reasons */}
        <section className="bg-[#F1F8FD] py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="text-sm font-semibold uppercase tracking-widest text-[#E51E2A]">
                More Than Symptom Checks
              </span>

              <h2 className="mt-3 text-2xl font-bold text-[#299BCF] md:text-3xl">
                Other reasons to see a doctor
              </h2>

              <p className="mt-4 leading-7 text-gray-600">
                You do not have to wait until you feel unwell
                to arrange a consultation.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {reasons.map((reason) => {
                const Icon = reason.icon;

                return (
                  <article
                    key={reason.title}
                    className="rounded-2xl border border-[#D7E8F5] bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#EAF3FC] text-[#299BCF]">
                      <Icon size={28} />
                    </div>

                    <h3 className="text-lg font-bold text-[#299BCF]">
                      {reason.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-gray-600">
                      {reason.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* AI Intake Assistant */}
        <section className="bg-white py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 md:grid-cols-2 lg:px-8">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1000&q=85"
                alt="Healthcare professional using digital technology"
                className="h-[420px] w-full rounded-3xl object-cover shadow-lg"
              />

              <div className="absolute -bottom-5 left-5 right-5 rounded-2xl border border-[#D7E8F5] bg-white p-5 shadow-lg md:left-8 md:right-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF3FC]">
                    <FileText size={23} className="text-[#299BCF]" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-[#299BCF]">
                      Your original description
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Kept unchanged and shared with the doctor.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-[#E51E2A]">
                <Sparkles size={17} />
                FamCare AI Intake Assistant
              </span>

              <h2 className="mt-3 text-2xl font-bold leading-tight text-[#299BCF] md:text-3xl">
                Explain how you feel. AI helps organise your words.
              </h2>

              <p className="mt-5 leading-7 text-gray-600">
                Describe how you feel in English or Kinyarwanda.
                You do not need medical terms. FamCare AI helps
                organise your description into a short summary
                for the doctor.
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={21}
                    className="mt-1 shrink-0 text-[#299BCF]"
                  />
                  <p className="text-sm leading-7 text-gray-600">
                    <strong className="text-[#299BCF]">
                      Your words stay yours:
                    </strong>{" "}
                    Your original description is never rewritten or replaced.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <Languages
                    size={21}
                    className="mt-1 shrink-0 text-[#299BCF]"
                  />
                  <p className="text-sm leading-7 text-gray-600">
                    <strong className="text-[#299BCF]">
                      Two languages:
                    </strong>{" "}
                    Describe your symptoms in English or Kinyarwanda.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <FileText
                    size={21}
                    className="mt-1 shrink-0 text-[#299BCF]"
                  />
                  <p className="text-sm leading-7 text-gray-600">
                    <strong className="text-[#299BCF]">
                      Doctor's summary:
                    </strong>{" "}
                    A separate, organised summary helps the doctor
                    understand your concerns.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheck
                    size={21}
                    className="mt-1 shrink-0 text-[#299BCF]"
                  />
                  <p className="text-sm leading-7 text-gray-600">
                    <strong className="text-[#299BCF]">
                      Urgent symptom flagging:
                    </strong>{" "}
                    Potentially urgent symptoms can trigger an
                    emergency message instead of booking.
                  </p>
                </div>
              </div>

              <p className="mt-6 rounded-xl border-l-4 border-[#E51E2A] bg-[#F1F8FD] p-4 text-sm leading-7 text-gray-600">
                AI helps organise information. It does not diagnose
                conditions or recommend treatment. Your doctor makes
                medical decisions.
              </p>
            </div>
          </div>
        </section>

        {/* What to Expect */}
        <section className="bg-[#EAF3FC] py-16">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <span className="text-sm font-semibold uppercase tracking-widest text-[#E51E2A]">
                During Your Visit
              </span>

              <h2 className="mt-3 text-2xl font-bold text-[#299BCF] md:text-3xl">
                What happens during your consultation?
              </h2>

              <p className="mt-4 leading-7 text-gray-600">
                Your doctor listens, checks your symptoms and explains
                the care you may need.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {consultationSteps.map((step) => (
                <article
                  key={step.number}
                  className="rounded-2xl border border-[#D7E8F5] bg-white p-7"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF3FC] text-sm font-bold text-[#299BCF]">
                    {step.number}
                  </span>

                  <h3 className="mt-5 text-lg font-bold text-[#299BCF]">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-gray-600">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Booking Process */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="text-sm font-semibold uppercase tracking-widest text-[#E51E2A]">
                Booking Process
              </span>

              <h2 className="mt-3 text-2xl font-bold text-[#299BCF] md:text-3xl">
                Three steps to arrange your visit
              </h2>

              <p className="mt-4 leading-7 text-gray-600">
                Getting started with FamCare is straightforward.
              </p>
            </div>

            <div className="grid gap-10 md:grid-cols-3">
              {visitSteps.map((step) => (
                <div key={step.number} className="text-center">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF3FC] text-lg font-bold text-[#299BCF]">
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
              Your next step starts here.
            </h2>

            <p className="mt-4 leading-7 text-white/90">
              Create your FamCare account to describe your concerns
              and find an available appointment.
            </p>

            <Link
              to="/register"
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#E51E2A] px-7 py-3.5 font-semibold text-white transition hover:bg-[#C91824]"
            >
              Create your account
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
