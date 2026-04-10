"use client";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import axios from "axios";

function DashboardClient({ ownerId }: { ownerId: string }) {
  const navigate = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [knowledge, setKnowledge] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [saved, setSaved] = useState(false);
  const [validationError, setValidationError] = useState("");

  const validate = () => {
    if (supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)) {
      setValidationError("Please enter a valid email address.");
      return false;
    }
    if (businessName.length > 200) {
      setValidationError("Business name must be under 200 characters.");
      return false;
    }
    if (knowledge.length > 50000) {
      setValidationError("Knowledge base must be under 50,000 characters.");
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleSettings = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await axios.post("/api/settings", {
        ownerId,
        businessName,
        supportEmail,
        knowledge,
      });
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error(error);
      setLoading(false);
      setValidationError("Failed to save settings. Please try again.");
    }
  };

  useEffect(() => {
    if (ownerId) {
      const handleGetDetails = async () => {
        try {
          const result = await axios.post("/api/settings/get", { ownerId });
          if (result.data) {
            setBusinessName(result.data.businessName || "");
            setSupportEmail(result.data.supportEmail || "");
            setKnowledge(result.data.knowledge || "");
          }
        } catch (error) {
          console.error(error);
          setFetchError("Failed to load settings.");
        } finally {
          setFetching(false);
        }
      };

      handleGetDetails();
    }
  }, [ownerId]);

  return (
    <div className="min-h-screen bg-zinc-50/50 text-zinc-900">
      {/* ── Navbar ─────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="fixed top-0 left-0 w-full z-50 bg-white/60 backdrop-blur-2xl border-b border-zinc-100"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div
            className="text-lg font-bold tracking-tight cursor-pointer"
            onClick={() => navigate.push("/")}
          >
            HelpDesk<span className="gradient-text ml-1">AI</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="px-4 py-2 rounded-lg text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-all duration-200"
              onClick={() => navigate.push("/")}
            >
              Home
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-zinc-900 text-white text-sm font-medium
                hover:bg-zinc-800 transition-all duration-200
                hover:shadow-lg hover:shadow-zinc-300/30"
              onClick={() => navigate.push("/embed")}
            >
              Embed ChatBot
            </button>
          </div>
        </div>
      </motion.nav>

      <div className="flex justify-center px-4 pt-28 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-3xl"
        >
          {/* ── Header ─────────────────────────────────────── */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-zinc-500 mt-1">
              Configure your AI chatbot&apos;s knowledge and business details.
            </p>
          </div>

          {fetching ? (
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-10 space-y-6 animate-pulse">
              <div className="h-5 w-40 bg-zinc-100 rounded-lg" />
              <div className="h-12 bg-zinc-100 rounded-xl" />
              <div className="h-12 bg-zinc-100 rounded-xl" />
              <div className="h-5 w-40 bg-zinc-100 rounded-lg mt-4" />
              <div className="h-48 bg-zinc-100 rounded-xl" />
            </div>
          ) : fetchError ? (
            <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-10">
              <div className="flex items-center gap-3 text-red-600">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                  />
                </svg>
                <p className="text-sm font-medium">{fetchError}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* ── Business Details Card ───────────────── */}
              <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base font-semibold">
                      Business Details
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Your business name and support contact
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                      Business Name
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm
                        focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300
                        placeholder:text-zinc-400 transition-all duration-200"
                      placeholder="Acme Inc."
                      value={businessName}
                      maxLength={200}
                      onChange={(e) => setBusinessName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                      Support Email
                    </label>
                    <input
                      type="email"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm
                        focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300
                        placeholder:text-zinc-400 transition-all duration-200"
                      placeholder="support@yourcompany.com"
                      value={supportEmail}
                      maxLength={320}
                      onChange={(e) => setSupportEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* ── Knowledge Base Card ────────────────── */}
              <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base font-semibold">Knowledge Base</h2>
                    <p className="text-xs text-zinc-400">
                      The AI will use this to answer customer questions
                    </p>
                  </div>
                </div>
                <textarea
                  className="w-full h-56 rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm
                    focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300
                    placeholder:text-zinc-400 transition-all duration-200 resize-none"
                  placeholder={`Add your FAQs, policies, and business info here...

Example:
- Refund policy: 7 days return available
- Delivery time: 3-5 working days
- Cash on Delivery available
- Support hours: Mon-Fri 9am-6pm`}
                  onChange={(e) => setKnowledge(e.target.value)}
                  value={knowledge}
                  maxLength={50000}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-zinc-400">
                    Tip: Be specific with your answers for better AI responses
                  </p>
                  <p className="text-xs text-zinc-400 tabular-nums">
                    {knowledge.length.toLocaleString()} / 50,000
                  </p>
                </div>
              </div>

              {/* ── Actions ────────────────────────────── */}
              {validationError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                    />
                  </svg>
                  {validationError}
                </div>
              )}

              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={loading}
                  onClick={handleSettings}
                  className="px-7 py-3 rounded-xl
                    bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium
                    hover:shadow-lg hover:shadow-violet-500/25
                    transition-all duration-300 disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    "Save Settings"
                  )}
                </motion.button>
                {saved && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm font-medium text-emerald-600 flex items-center gap-1.5"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4.5 12.75 6 6 9-13.5"
                      />
                    </svg>
                    Settings saved
                  </motion.span>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default DashboardClient;
