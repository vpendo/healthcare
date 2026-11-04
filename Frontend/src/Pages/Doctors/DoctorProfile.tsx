
import { useState } from "react";
import { UserRound, Save, Stethoscope } from "lucide-react";

export default function DoctorProfile() {
  const [profile, setProfile] = useState({
    name: "Dr....",
    email: "@example.com",
    specialty: "General Medicine",
    phone: "0780000000",
    experience: " years",
    bio: "Dedicated to providing quality patient care.",
  });

  const [message, setMessage] = useState("");

  function updateField(field: keyof typeof profile, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
    setMessage("");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("Profile updated in this session. Connect the API to save permanently.");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-2 text-gray-500">
          View and update your professional information.
        </p>
      </div>

      <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF3FC] text-[#299BCF]">
            <UserRound size={34} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {profile.name}
            </h2>
            <p className="mt-1 flex items-center gap-2 text-sm text-gray-500">
              <Stethoscope size={16} />
              {profile.specialty}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Full name
              </label>
              <input
                required
                value={profile.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-[#299BCF]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                type="email"
                required
                value={profile.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-[#299BCF]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Specialty
              </label>
              <select
                value={profile.specialty}
                onChange={(e) => updateField("specialty", e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white p-3"
              >
                <option>General Medicine</option>
                <option>Cardiology</option>
                <option>Pediatrics</option>
                <option>Dental</option>
                <option>Dermatology</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Phone number
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-[#299BCF]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Experience
              </label>
              <input
                value={profile.experience}
                onChange={(e) => updateField("experience", e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-[#299BCF]"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Professional biography
            </label>
            <textarea
              rows={4}
              value={profile.bio}
              onChange={(e) => updateField("bio", e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-[#299BCF]"
            />
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#299BCF] px-6 py-3 font-semibold text-white hover:bg-[#2187B5]"
          >
            <Save size={18} />
            Save Changes
          </button>

          {message && (
            <p role="status" className="text-sm text-green-700">
              {message}
            </p>
          )}
        </form>
      </section>
    </div>
  );
}
