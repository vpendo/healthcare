import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowLeft,
  Mail,
  KeyRound,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

interface ResetPasswordLocationState {
  email?: string;
  code?: string;
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

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as ResetPasswordLocationState | null;

  const [email, setEmail] = useState(state?.email || "");
  const [code, setCode] = useState(state?.code || "");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (loading) return;

    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = code.trim();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^\d{6}$/.test(normalizedCode)) {
      setError("Please enter a valid 6-digit reset code.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
            code: normalizedCode,
            newPassword,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || "Could not reset your password."
        );
      }

      navigate("/login", {
        replace: true,
        state: {
          message:
            data?.message ||
            "Password reset successfully. Please log in with your new password.",
        },
      });
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Unable to connect to the server. Please try again."
          : err instanceof Error
            ? err.message
            : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-[#F1F8FD] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[#EAF3FC] bg-white p-8 shadow-lg sm:p-10">

        {/* FamCare Logo - Same as Login */}
        <Link
          to="/"
          aria-label="FamCare home"
          className="mb-8 flex items-center justify-center gap-2"
        >
          <FamCareLogo />
          <Wordmark />
        </Link>

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Reset Your Password
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Enter your email, the 6-digit reset code sent to
            you, and your new password.
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-5">

          {/* Email */}
          <div>
            <label
              htmlFor="reset-email"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Email Address
            </label>

            <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 transition focus-within:border-[#55B9E8] focus-within:ring-2 focus-within:ring-[#55B9E8]/20">
              <Mail size={18} className="shrink-0 text-gray-400" />

              <input
                id="reset-email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                maxLength={254}
                required
                disabled={loading}
                className="w-full py-3 text-sm text-gray-800 outline-none"
              />
            </div>
          </div>

          {/* Reset Code */}
          <div>
            <label
              htmlFor="reset-code"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              6-Digit Reset Code
            </label>

            <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 transition focus-within:border-[#55B9E8] focus-within:ring-2 focus-within:ring-[#55B9E8]/20">
              <KeyRound size={18} className="shrink-0 text-gray-400" />

              <input
                id="reset-code"
                name="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
                disabled={loading}
                className="w-full py-3 text-sm tracking-[0.3em] text-gray-800 outline-none"
              />
            </div>
          </div>

          {/* New Password */}
          <div>
            <label
              htmlFor="new-password"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              New Password
            </label>

            <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 transition focus-within:border-[#55B9E8] focus-within:ring-2 focus-within:ring-[#55B9E8]/20">
              <LockKeyhole size={18} className="shrink-0 text-gray-400" />

              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Enter new password"
                autoComplete="new-password"
                minLength={8}
                required
                disabled={loading}
                className="w-full py-3 text-sm outline-none"
              />

              <button
                type="button"
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="text-gray-400 transition hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirm-password"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Confirm New Password
            </label>

            <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 transition focus-within:border-[#55B9E8] focus-within:ring-2 focus-within:ring-[#55B9E8]/20">
              <LockKeyhole size={18} className="shrink-0 text-gray-400" />

              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Confirm new password"
                autoComplete="new-password"
                minLength={8}
                required
                disabled={loading}
                className="w-full py-3 text-sm outline-none"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword((previous) => !previous)
                }
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
                className="text-gray-400 transition hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Your password must contain at least 8 characters.
          </p>

          {/* Error */}
          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
            >
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#55B9E8] px-4 py-3 font-semibold text-white transition hover:bg-[#299BCF] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Updating Password..." : "Reset Password"}
          </button>
        </form>

        {/* Request Another Code */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Didn't receive a code?{" "}
          <Link
            to="/forgot-password"
            state={{ email }}
            className="font-semibold text-[#299BCF] transition hover:text-[#E51E2A]"
          >
            Request a new code
          </Link>
        </p>

        {/* Back to Login */}
        <div className="mt-4 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#299BCF] transition hover:text-[#E51E2A]"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} FamCare. All rights reserved.
        </p>
      </div>
    </main>
  );
}