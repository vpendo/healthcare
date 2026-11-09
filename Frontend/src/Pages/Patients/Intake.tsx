
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  HeartPulse,
  Languages,
  Loader2,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";

type Language = "English" | "Kinyarwanda";

type AnalysisResult = {
  suggestedSpecialty: string;
  urgency: "normal" | "urgent";
  summary: string;
};

export default function Intake() {
  const navigate = useNavigate();

  const [language, setLanguage] = useState<Language>("English");
  const [symptoms, setSymptoms] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeSymptoms = async () => {
    if (symptoms.trim().length < 10) {
      setError(
        language === "English"
          ? "Please describe your symptoms in at least 10 characters."
          : "Sobanura ibimenyetso byawe mu magambo arambuye."
      );
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Connect this URL to your team's actual backend endpoint.
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/intake/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            symptoms,
            language,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to analyze symptoms.");
      }

      setResult({
        suggestedSpecialty: data.suggestedSpecialty,
        urgency: data.urgency,
        summary: data.summary,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. You can still book a normal appointment."
      );
    } finally {
      setLoading(false);
    }
  };

  const isUrgent = result?.urgency === "urgent";

  return (
    <div className="min-h-screen bg-[#F1F8FD] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#299BCF]">
            <Sparkles size={18} />
            <span>AI HEALTH ASSISTANT</span>
          </div>

          <h1 className="text-2xl font-bold text-[#172B4D] sm:text-3xl">
            AI Symptom Intake
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
            Tell us how you are feeling. Our AI assistant can help suggest
            the appropriate medical specialty and summarize your symptoms
            for the healthcare team.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Input section */}
          <div className="rounded-2xl border border-[#DCEAF3] bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-[#E8F6FC] p-3 text-[#299BCF]">
                <HeartPulse size={24} />
              </div>

              <div>
                <h2 className="font-bold text-[#172B4D]">
                  Describe your symptoms
                </h2>
                <p className="text-xs text-gray-500">
                  Share what you are experiencing.
                </p>
              </div>
            </div>

            {/* Language selection */}
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Preferred language
            </label>

            <div className="mb-6 grid grid-cols-2 gap-3">
              {(["English", "Kinyarwanda"] as Language[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setLanguage(item)}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    language === item
                      ? "border-[#299BCF] bg-[#E8F6FC] text-[#1685B9]"
                      : "border-gray-200 bg-white text-gray-600 hover:border-[#299BCF]"
                  }`}
                >
                  <Languages size={17} />
                  {item}
                  {language === item && <CheckCircle2 size={16} />}
                </button>
              ))}
            </div>

            {/* Symptoms */}
            <label
              htmlFor="symptoms"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              {language === "English"
                ? "What symptoms are you experiencing?"
                : "Ni ibihe bimenyetso ufite?"}
            </label>

            <textarea
              id="symptoms"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={7}
              maxLength={2000}
              placeholder={
                language === "English"
                  ? "Example: I have been experiencing headaches and fever for two days..."
                  : "Urugero: Maze iminsi ibiri ndibwa umutwe kandi mfite umuriro..."
              }
              className="w-full resize-none rounded-xl border border-gray-200 bg-[#FAFCFE] p-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#299BCF] focus:ring-2 focus:ring-[#299BCF]/10"
            />

            <div className="mt-2 flex justify-between text-xs text-gray-400">
              <span>Do not include unnecessary personal information.</span>
              <span>{symptoms.length}/2000</span>
            </div>

            {error && (
              <div className="mt-4 flex gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                <AlertCircle size={18} className="shrink-0" />
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={analyzeSymptoms}
              disabled={loading || symptoms.trim().length < 10}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#299BCF] px-5 py-3.5 font-semibold text-white transition hover:bg-[#2088B8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={19} className="animate-spin" />
                  Analyzing symptoms...
                </>
              ) : (
                <>
                  <Sparkles size={19} />
                  Analyze My Symptoms
                </>
              )}
            </button>

            <p className="mt-4 text-center text-xs text-gray-400">
              Your information should only be shared with authorized
              healthcare personnel.
            </p>
          </div>

          {/* Information section */}
          <div className="space-y-5">
            <div className="rounded-2xl bg-[#299BCF] p-6 text-white shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <Activity size={25} />
              </div>

              <h3 className="text-lg font-bold">
                How does it work?
              </h3>

              <div className="mt-5 space-y-5">
                {[
                  {
                    title: "Describe",
                    text: "Tell us what you are experiencing.",
                  },
                  {
                    title: "Analyze",
                    text: "AI reviews your description and suggests a specialty.",
                  },
                  {
                    title: "Continue",
                    text: "Use the result to guide your next appointment step.",
                  },
                ].map((step, index) => (
                  <div key={step.title} className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">{step.title}</h4>
                      <p className="mt-1 text-xs leading-5 text-blue-50">
                        {step.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#DCEAF3] bg-white p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-[#299BCF]" size={22} />
                <h3 className="font-bold text-[#172B4D]">
                  Your safety matters
                </h3>
              </div>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                AI suggestions are not medical diagnoses. A healthcare
                professional should assess your condition.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex gap-3">
                <AlertCircle className="shrink-0 text-amber-600" size={21} />
                <div>
                  <h3 className="font-bold text-amber-800">
                    Medical emergency?
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-amber-700">
                    If you have severe chest pain, difficulty breathing,
                    unconsciousness, or another life-threatening symptom,
                    seek emergency medical help immediately. Do not wait
                    for an AI response or an appointment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis result */}
        {result && (
          <div className="mt-7 rounded-2xl border border-[#DCEAF3] bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-[#E8F6FC] p-3 text-[#299BCF]">
                <Stethoscope size={23} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#172B4D]">
                  AI Analysis Result
                </h2>
                <p className="text-sm text-gray-500">
                  Review the information below.
                </p>
              </div>
            </div>

            <div
              className={`mb-5 flex items-start gap-3 rounded-xl border p-4 ${
                isUrgent
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-green-200 bg-green-50 text-green-700"
              }`}
            >
              {isUrgent ? (
                <AlertCircle size={22} className="shrink-0" />
              ) : (
                <CheckCircle2 size={22} className="shrink-0" />
              )}

              <div>
                <h3 className="font-bold">
                  {isUrgent ? "Urgent attention required" : "No urgent flag identified"}
                </h3>
                <p className="mt-1 text-sm">
                  {isUrgent
                    ? "Seek emergency medical assistance immediately. Do not continue to appointment booking."
                    : "The AI did not identify an urgent flag. This does not guarantee that your condition is safe."}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-[#F5FAFD] p-4">
                <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
                  <Stethoscope size={17} />
                  Suggested specialty
                </div>
                <p className="font-bold text-[#172B4D]">
                  {result.suggestedSpecialty || "Not available"}
                </p>
              </div>

              <div className="rounded-xl bg-[#F5FAFD] p-4">
                <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
                  <Clock size={17} />
                  Urgency
                </div>
                <p
                  className={`font-bold ${
                    isUrgent ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {isUrgent ? "Urgent" : "No urgent flag identified"}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-[#F5FAFD] p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-600">
                <MessageSquare size={17} />
                Symptom summary
              </div>
              <p className="text-sm leading-7 text-gray-700">
                {result.summary}
              </p>
            </div>

            {isUrgent ? (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-700">
                  Please seek emergency care now. In Rwanda, you can call
                  912 for emergency assistance.
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() =>
                  navigate("/patients/book-appointment", {
                    state: {
                      suggestedSpecialty: result.suggestedSpecialty,
                    },
                  })
                }
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#299BCF] px-5 py-3.5 font-semibold text-white transition hover:bg-[#2088B8] sm:w-auto"
              >
                Continue to Book Appointment
                <ArrowRight size={18} />
              </button>
            )}

            <p className="mt-4 text-xs text-gray-400">
              This is not medical advice. AI results can be inaccurate and
              must not replace professional medical assessment.
            </p>
          </div>
        )}

        {!result && (
          <p className="mt-6 text-center text-xs text-gray-400">
            FamCare AI Intake · Supporting better communication between
            patients and healthcare professionals.
          </p>
        )}
      </div>
    </div>
  );
}
