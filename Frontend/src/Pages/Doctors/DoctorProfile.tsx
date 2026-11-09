
import { useEffect, useState, type FormEvent } from "react";
import { UserRound, Save, Stethoscope } from "lucide-react";
import { useAuth } from "../../Context/AuthContext";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

interface DoctorProfileData {
  name: string;
  email: string;
  specialty: string;
}

const specialties = [
  "general consultation",
  "dental care",
  "optical care",
];

export default function DoctorProfile() {
  const { user, token, loading: authLoading, login } = useAuth();

  const [profile, setProfile] = useState<DoctorProfileData>({
    name: "",
    email: "",
    specialty: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Load the logged-in doctor's profile.
  useEffect(() => {
    if (authLoading) return;

    if (!user || !token) {
      setError("Please log in to view your profile.");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        setProfile((current) => ({
          ...current,
          name: user.name,
          email: user.email,
        }));

        const response = await fetch(
          `${API_URL}/api/doctors/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load doctor profile."
          );
        }

        setProfile((current) => ({
          ...current,
          specialty: data.doctor.specialty || "",
        }));
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading your profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id, token, authLoading]);

  function updateField(field: keyof DoctorProfileData, value: string) {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));

    setMessage("");
    setError("");
  }

  // Save name, email and specialty.
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!user || !token) {
      setError("Please log in before updating your profile.");
      return;
    }

    let personalDetailsSaved = false;

    try {
      setSaving(true);
      setMessage("");
      setError("");

      // 1. Update name and email in the User collection.
      const userResponse = await fetch(
        `${API_URL}/api/auth/profile`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: profile.name.trim(),
            email: profile.email.trim(),
          }),
        }
      );

      const userData = await userResponse.json();

      if (!userResponse.ok) {
        throw new Error(
          userData.message || "Failed to update your personal details."
        );
      }

      // Update AuthContext immediately.
      login(token, userData.user);

      setProfile((current) => ({
        ...current,
        name: userData.user.name,
        email: userData.user.email,
      }));

      personalDetailsSaved = true;

      // 2. Update specialty in the DoctorProfile collection.
      const doctorResponse = await fetch(
        `${API_URL}/api/doctors/${user.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            specialty: profile.specialty,
          }),
        }
      );

      const doctorData = await doctorResponse.json();

      if (!doctorResponse.ok) {
        throw new Error(
          doctorData.message || "Failed to update your specialty."
        );
      }

      setProfile((current) => ({
        ...current,
        specialty: doctorData.doctor.specialty || current.specialty,
      }));

      setMessage("Your profile has been updated successfully.");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Something went wrong while updating your profile.";

      if (personalDetailsSaved) {
        setMessage("Your name and email were saved successfully.");
        setError(
          `However, your specialty was not updated: ${errorMessage}`
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 text-center text-gray-500 shadow-sm">
        Loading your profile...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          My Profile
        </h1>
        <p className="mt-2 text-gray-500">
          View and update your personal and professional information.
        </p>
      </div>

      <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF3FC] text-[#299BCF]">
            <UserRound size={34} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {profile.name || "Doctor"}
            </h2>

            <p className="mt-1 flex items-center gap-2 text-sm capitalize text-gray-500">
              <Stethoscope size={16} />
              {profile.specialty || "Specialty not set"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Full name */}
            <div>
              <label
                htmlFor="doctor-name"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Full name
              </label>

              <input
                id="doctor-name"
                type="text"
                required
                minLength={1}
                value={profile.name}
                onChange={(e) =>
                  updateField("name", e.target.value)
                }
                className="w-full rounded-xl border border-gray-200 bg-white p-3 outline-none focus:border-[#299BCF]"
              />
            </div>

            {/* Email address */}
            <div>
              <label
                htmlFor="doctor-email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email address
              </label>

              <input
                id="doctor-email"
                type="email"
                required
                value={profile.email}
                onChange={(e) =>
                  updateField("email", e.target.value)
                }
                className="w-full rounded-xl border border-gray-200 bg-white p-3 outline-none focus:border-[#299BCF]"
              />
            </div>

            {/* Specialty */}
            <div className="sm:col-span-2">
              <label
                htmlFor="doctor-specialty"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Specialty
              </label>

              <select
                id="doctor-specialty"
                required
                value={profile.specialty}
                onChange={(e) =>
                  updateField("specialty", e.target.value)
                }
                className="w-full rounded-xl border border-gray-200 bg-white p-3 outline-none focus:border-[#299BCF]"
              >
                <option value="" disabled>
                  Select your specialty
                </option>

                {profile.specialty &&
                  !specialties.includes(profile.specialty.toLowerCase()) && (
                    <option value={profile.specialty}>
                      {profile.specialty}
                    </option>
                  )}

                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty.replace(/\b\w/g, (letter) =>
                      letter.toUpperCase()
                    )}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={
              saving ||
              !profile.name.trim() ||
              !profile.email.trim() ||
              !profile.specialty
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-[#299BCF] px-6 py-3 font-semibold text-white hover:bg-[#2187B5] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Changes"}
          </button>

          {message && (
            <p role="status" className="text-sm text-green-700">
              {message}
            </p>
          )}

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
        </form>
      </section>
    </div>
  );
}
