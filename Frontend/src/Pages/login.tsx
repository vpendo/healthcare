
import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import {
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  Home,
} from "lucide-react";
import { useAuth, type AuthUser, type UserRole } from "../Context/AuthContext";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address.")
    .max(254, "Email is too long.")
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Password is required."),
});

const isUserRole = (role: unknown): role is UserRole => {
  return ["patient", "doctor", "receptionist", "admin"].includes(
    role as string
  );
};

function getDashboardPath(role: UserRole): string {
  switch (role) {
    case "patient":
      return "/patients";

    case "doctor":
      return "/doctors";

    case "receptionist":
      return "/receptionist";

    case "admin":
      return "/admin";

    default:
      return "/";
  }
}

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

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const locationState = location.state as
    | { message?: string }
    | null;

  const successMessage = locationState?.message;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const validation = loginSchema.safeParse({ email, password });

    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validation.data),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Invalid email or password."
        );
      }

      // Validate the backend response before saving the session.
      if (
        typeof data.token !== "string" ||
        !data.user ||
        typeof data.user.id !== "string" ||
        typeof data.user.name !== "string" ||
        typeof data.user.email !== "string" ||
        !isUserRole(data.user.role)
      ) {
        throw new Error(
          "Invalid server response. Please try again."
        );
      }

      const user: AuthUser = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      };

      // Save the token and user details.
      login(data.token, user);

      // Redirect according to the user's role.
      navigate(getDashboardPath(user.role), {
        replace: true,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Try again."
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
          className="mb-8 flex items-center justify-center gap-2"
        >
          <FamCareLogo />
          <Wordmark />
        </Link>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Sign in to manage your clinic appointments.
          </p>
        </div>

        {successMessage && (
          <p
            role="status"
            className="mb-5 rounded-xl bg-green-50 p-3 text-sm text-green-700"
          >
            {successMessage}
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mb-5 rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email address
            </label>

            <div className="relative">
              <Mail
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={19}
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
                className="w-full rounded-xl border border-gray-200 py-3.5 pl-11 pr-4 text-sm outline-none focus:border-[#55B9E8] focus:ring-4 focus:ring-[#55B9E8]/15"
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
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={19}
              />

              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 py-3.5 pl-11 pr-12 text-sm outline-none focus:border-[#55B9E8] focus:ring-4 focus:ring-[#55B9E8]/15"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#299BCF]"
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>

            <div className="mt-2 text-right">
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-[#299BCF] transition hover:text-[#E51E2A]"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E51E2A] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#C91824] focus:outline-none focus:ring-4 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-[#299BCF] hover:text-[#E51E2A]"
          >
            Create account
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
