import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Mail,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

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

export default function ForgotPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const initialEmail =
    (location.state as { email?: string } | null)?.email || "";

  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (loading) return;

    setError("");
    setSuccess(false);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to process your request. Please try again."
        );
      }

      setSuccess(true);
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
            Forgot Password?
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Enter your registered email address and we'll
            send you a 6-digit password reset code.
          </p>
        </div>

        {success ? (
          /* Success State */
          <div className="space-y-5 text-center">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF3FC]">
                <CheckCircle2
                  size={34}
                  className="text-[#299BCF]"
                />
              </div>
            </div>

            <h2 className="text-lg font-bold text-gray-900">
              Check Your Email
            </h2>

            <p className="text-sm leading-6 text-gray-500">
              If an account exists with this email address,
              a 6-digit reset code will be sent to you.
              Check your inbox and spam folder.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/verify-reset-code", {
                  state: { email: email.trim().toLowerCase() },
                })
              }
              className="w-full rounded-lg bg-[#55B9E8] py-3 font-semibold text-white transition hover:bg-[#299BCF]"
            >
              Continue to Verification
            </button>

            <button
              type="button"
              onClick={() => {
                setSuccess(false);
                setError("");
              }}
              className="w-full rounded-lg border border-[#55B9E8] py-3 font-semibold text-[#299BCF] transition hover:bg-[#EAF3FC]"
            >
              Try Another Email
            </button>
          </div>
        ) : (
          /* Forgot Password Form */
          <form
            onSubmit={handleForgotPassword}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="forgot-email"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Email Address
              </label>

              <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 transition focus-within:border-[#55B9E8] focus-within:ring-2 focus-within:ring-[#55B9E8]/20">
                <Mail
                  size={18}
                  className="shrink-0 text-gray-400"
                />

                <input
                  id="forgot-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  maxLength={254}
                  required
                  disabled={loading}
                  className="w-full py-3 text-sm text-gray-800 outline-none disabled:opacity-60"
                />
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#55B9E8] py-3 font-semibold text-white transition hover:bg-[#299BCF] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending reset code..." : "Send Reset Code"}
            </button>
          </form>
        )}

        {/* Back to Login */}
        <div className="mt-7 text-center">
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