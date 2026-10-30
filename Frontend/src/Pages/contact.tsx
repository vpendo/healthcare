import Navbar from "../Components/Navbar";
import Footer from "../Components/footer";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  HeartPulse,
  Send,
  ArrowRight,
  Headset,
} from "lucide-react";

const emergencyPhone = "+2507813203084";
const contactEmail = "support@famcare.rw";
const contactAddress = "KK 548, Kigali, Rwanda";

export default function Contact() {
  return (
    <>
      <Navbar />

      <main className="bg-white text-slate-700">
        {/* Contact Hero */}
        <section className="relative overflow-hidden bg-[#F1F8FD] px-5 py-16 sm:py-20 lg:py-24">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#55B9E8]/10" />
          <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-[#55B9E8]/10" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D7E8F5] bg-white px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-[#E51E2A]" />
                <span className="text-sm font-semibold text-[#299BCF]">
                  CONTACT FAMCARE
                </span>
              </div>

              <h1 className="mt-6 max-w-xl text-4xl font-extrabold leading-tight tracking-tight text-slate-800 sm:text-5xl lg:text-6xl">
                We're here to
                <span className="block text-[#299BCF]">help you feel</span>
                <span className="text-[#E51E2A]">better.</span>
              </h1>

              <p className="mt-5 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
                Questions about appointments or our services? Our team is
                ready to help.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#contact-form"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#E51E2A] px-6 py-3.5 font-semibold text-white transition hover:bg-[#C91824]"
                >
                  Send a message
                  <ArrowRight size={18} />
                </a>

                <a
                  href={`tel:${emergencyPhone}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#55B9E8] bg-white px-6 py-3.5 font-semibold text-[#299BCF] transition hover:bg-[#EAF3FC]"
                >
                  <Phone size={18} />
                  Call us
                </a>
              </div>
            </div>

            {/* Contact Information */}
            <div className="relative mx-auto w-full max-w-lg">
              <div className="absolute -right-3 -top-3 h-16 w-16 rounded-2xl border-2 border-[#55B9E8]/50" />

              <div className="relative rounded-3xl border border-[#D7E8F5] bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3FC] text-[#299BCF]">
                    <Headset size={30} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">
                      How can we help?
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Get in touch with our team.
                    </p>
                  </div>
                </div>

                <a
                  href={`tel:${emergencyPhone}`}
                  className="mt-5 flex items-center gap-4 rounded-xl p-3 transition hover:bg-[#F1F8FD]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF3FC] text-[#299BCF]">
                    <Phone size={21} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="mt-1 break-all font-semibold text-slate-800">
                      +250 781 320 3084
                    </p>
                  </div>
                </a>

                <a
                  href={`mailto:${contactEmail}`}
                  className="mt-2 flex items-center gap-4 rounded-xl p-3 transition hover:bg-[#F1F8FD]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF3FC] text-[#299BCF]">
                    <Mail size={21} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="mt-1 break-all font-semibold text-slate-800">
                      {contactEmail}
                    </p>
                  </div>
                </a>

                <div className="mt-2 flex items-center gap-4 rounded-xl p-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#E51E2A]">
                    <MapPin size={21} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Address</p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {contactAddress}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3 rounded-xl bg-[#F1F8FD] p-4">
                  <Clock size={20} className="shrink-0 text-[#299BCF]" />
                  <p className="text-sm text-slate-600">
                    Our online contact page is available 24/7.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Emergency Banner */}
        <section className="px-5 py-12 sm:py-16">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 rounded-2xl bg-[#E51E2A] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                <HeartPulse size={27} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white sm:text-2xl">
                  Medical emergency?
                </h2>
                <p className="mt-1 text-sm text-white/90">
                  Contact local emergency services immediately.
                </p>
              </div>
            </div>

            <a
              href={`tel:${emergencyPhone}`}
              className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-white px-5 py-3 font-bold text-[#E51E2A] transition hover:bg-red-50 sm:self-auto"
            >
              <Phone size={18} />
              Emergency call
            </a>
          </div>
        </section>

        {/* Contact Form */}
        <section
          id="contact-form"
          className="bg-[#F1F8FD] px-5 py-12 sm:py-16"
        >
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-[#E51E2A]">
                Get in touch
              </p>
              <h2 className="mt-3 text-3xl font-extrabold text-[#299BCF] sm:text-4xl">
                Send us a message
              </h2>
              <p className="mt-4 max-w-md leading-7 text-slate-600">
                Complete the form and let us know how we can help.
              </p>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                // Connect your backend or email service here.
              }}
              className="rounded-2xl border border-[#D7E8F5] bg-white p-6 sm:p-8"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Full name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="Your name"
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-[#55B9E8] focus:ring-2 focus:ring-[#55B9E8]/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-[#55B9E8] focus:ring-2 focus:ring-[#55B9E8]/20"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  defaultValue=""
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#55B9E8] focus:ring-2 focus:ring-[#55B9E8]/20"
                >
                  <option value="" disabled>
                    Select a subject
                  </option>
                  <option value="appointment">Appointments</option>
                  <option value="account">Account support</option>
                  <option value="technical">Technical support</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  placeholder="How can we help?"
                  className="w-full resize-y rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-[#55B9E8] focus:ring-2 focus:ring-[#55B9E8]/20"
                />
              </div>

              <button
                type="submit"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#E51E2A] px-5 py-3.5 font-semibold text-white transition hover:bg-[#C91824]"
              >
                Send message
                <Send size={18} />
              </button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
