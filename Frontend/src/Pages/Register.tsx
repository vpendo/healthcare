import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import {
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  Home,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:4000"
).replace(/\/+$/, "");

const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters.")
      .max(80, "Name cannot exceed 80 characters."),
    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .email("Enter a valid email address.")
      .max(254, "Email cannot exceed 254 characters.")
      .transform((value) => value.toLowerCase()),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(72, "Password cannot exceed 72 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

function FamCareLogo({ className = "h-10 w-10" }: { className?: string }) {
  const heart =
    "M16 28.5C6.5 21 2 15 2 9.8 2 5.8 5 3 8.7 3c3 0 5.9 1.6 7.3 4.2C17.4 4.6 20.3 3 23.3 3 27 3 30 5.8 30 9.8 30 15 25.5 21 16 28.5Z";

  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label="FamCare logo"
    >
      <defs>
        <clipPath id="fc-left">
          <rect x="0" y="0" width="16" height="32" />
        </clipPath>
        <clipPath id="fc-right">
          <rect x="16" y="0" width="16" height="32" />
        </clipPath>
      </defs>

      <path d={heart} fill="#E51E2A" clipPath="url(#fc-left)" />
      <path d={heart} fill="#55B9E8" clipPath="url(#fc-right)" />

      <rect x="12" y="7" width="5" height="13" rx="1.4" fill="#FFFFFF" />
      <rect x="8" y="11" width="13" height="5" rx="1.4" fill="#FFFFFF" />
    </svg>
  );
}

function Wordmark() {
  return (
    <span className="text-2xl font-extrabold tracking-tight">
      <span className="text-[#E51E2A]">Fam</span>
      <span className="text-[#299BCF]">Care</span>
    </span>
  );
}

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const validation = registerSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
    });

    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    setLoading(true);

    try {
      const { name, email, password } = validation.data;

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Registration failed. Please try again."
        );
      }

      navigate("/login", {
        replace: true,
        state: {
          message: "Account created successfully. Please log in.",
        },
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F1F8FD] px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 shadow-lg sm:p-10">
        {/* FamCare Logo */}
        <Link
          to="/"
          aria-label="FamCare home"
          className="mb-7 flex items-center justify-center gap-2"
        >
          <FamCareLogo />
          <Wordmark />
        </Link>

        <div className="mb-7 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#299BCF]">
            Get started today
          </p>
          <h1 className="text-3xl font-bold text-gray-900">
            Create your account
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Register as a patient to manage your clinic appointments.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Full name
            </label>
            <div className="relative">
              <UserRound
                size={19}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={80}
                className="w-full rounded-xl border border-gray-200 py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#55B9E8] focus:ring-4 focus:ring-[#55B9E8]/15"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <div className="relative">
              <Mail
                size={19}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={254}
                className="w-full rounded-xl border border-gray-200 py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#55B9E8] focus:ring-4 focus:ring-[#55B9E8]/15"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <LockKeyhole
                size={19}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                maxLength={72}
                className="w-full rounded-xl border border-gray-200 py-3.5 pl-11 pr-12 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#55B9E8] focus:ring-4 focus:ring-[#55B9E8]/15"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#299BCF]"
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Confirm password
            </label>
            <div className="relative">
              <LockKeyhole
                size={19}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Enter your password again"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 py-3.5 pl-11 pr-12 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#55B9E8] focus:ring-4 focus:ring-[#55B9E8]/15"
              />
              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#299BCF]"
              >
                {showConfirmPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E51E2A] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#C91824] focus:outline-none focus:ring-4 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#299BCF] hover:text-[#E51E2A]"
          >
            Sign in
          </Link>
        </p>

        {/* Back to Home */}
        <div className="mt-5 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#299BCF] transition hover:text-[#E51E2A]"
          >
            <Home size={17} />
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}
