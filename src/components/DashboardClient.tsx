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
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <motion.div
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-zinc-200"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div
            className="text-lg font-semibold tracking-tight cursor-pointer"
            onClick={() => navigate.push("/")}
          >
            HelpDesk <span className="text-zinc-400">AI</span>
          </div>
          <button
            className="px-4 py-2 rounded-lg border border-zinc-300 text-sm hover:bg-zinc-100 transition"
            onClick={() => navigate.push("/embed")}
          >
            Embed ChatBot
          </button>
        </div>
      </motion.div>

      <div className="flex justify-center px-4 py-14 mt-20">
        <motion.div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-10">
          <div className="mb-10">
            <h1 className="text-2xl font-semibold">ChatBot Settings</h1>
            <p className="text-zinc-500 mt-1">
              Manage your AI chatbot knowledge and business details
            </p>
          </div>

          {fetching ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-12 bg-zinc-100 rounded-xl" />
              <div className="h-12 bg-zinc-100 rounded-xl" />
              <div className="h-54 bg-zinc-100 rounded-xl" />
            </div>
          ) : fetchError ? (
            <div className="text-red-600 bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm">
              {fetchError}
            </div>
          ) : (
            <>
              <div className="mb-10">
                <h2 className="text-lg font-medium mb-4">Business Details</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/80"
                    placeholder="Business Name"
                    value={businessName}
                    maxLength={200}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                  <input
                    type="email"
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/80"
                    placeholder="Support Email"
                    value={supportEmail}
                    maxLength={320}
                    onChange={(e) => setSupportEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="mb-10">
                <h2 className="text-lg font-medium mb-4">Knowledge Base</h2>
                <p className="text-sm text-zinc-500 mb-4">
                  Add FAQs, policies, delivery info, refunds, etc.
                </p>
                <div className="space-y-4">
                  <textarea
                    className="w-full h-54 rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/80"
                    placeholder={`Example:
• Refund policy: 7 days return available
• Delivery time: 3–5 working days
• Cash on Delivery available
• Support hours`}
                    onChange={(e) => setKnowledge(e.target.value)}
                    value={knowledge}
                    maxLength={50000}
                  />
                  <p className="text-xs text-zinc-400 text-right">
                    {knowledge.length.toLocaleString()} / 50,000
                  </p>
                </div>
              </div>

              {validationError && (
                <p className="text-sm text-red-600 mb-4">{validationError}</p>
              )}

              <div className="flex items-center gap-5">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={loading}
                  onClick={handleSettings}
                  className="px-7 py-3 rounded-xl bg-black text-white text-sm font-medium hover:bg-zinc-800 transition disabled:opacity-60"
                >
                  {loading ? "Saving..." : "Save"}
                </motion.button>
                {saved && (
                  <motion.span
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm font-medium text-emerald-600"
                  >
                    Settings saved
                  </motion.span>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default DashboardClient;
