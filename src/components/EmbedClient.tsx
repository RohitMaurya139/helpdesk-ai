"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import axios from "axios";

function EmbedClient({ ownerId }: { ownerId: string }) {
  const navigate = useRouter();
  const [copied, setCopied] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const result = await axios.post("/api/settings/get", { ownerId });
        if (result.data?.apiKey) {
          setApiKey(result.data.apiKey);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchApiKey();
  }, [ownerId]);

  const embedCode = `<script
    src="${process.env.NEXT_PUBLIC_APP_URL}/chatBot.js"
    data-api-key="${apiKey}">
</script>`;

  const copyCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    {
      num: "1",
      title: "Copy the embed script",
      desc: "Click the copy button above to copy the script tag.",
    },
    {
      num: "2",
      title: "Paste before </body>",
      desc: "Add the script tag just before the closing body tag of your HTML.",
    },
    {
      num: "3",
      title: "Reload your website",
      desc: "Refresh the page and the chatbot will appear in the bottom-right corner.",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50/50 text-zinc-900">
      {/* ── Navbar ─────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-40 bg-white/60 backdrop-blur-2xl border-b border-zinc-100"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div
            className="text-lg font-bold tracking-tight cursor-pointer"
            onClick={() => navigate.push("/")}
          >
            HelpDesk<span className="gradient-text ml-1">AI</span>
          </div>
          <button
            className="px-4 py-2 rounded-lg text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-all duration-200"
            onClick={() => navigate.push("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </motion.nav>

      <div className="flex justify-center px-4 py-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl"
        >
          {/* ── Header ─────────────────────────────────── */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">
              Embed ChatBot
            </h1>
            <p className="text-zinc-500 mt-1">
              Add the AI chatbot to your website with a single script tag.
            </p>
          </div>

          {/* ── Code Block ─────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-8 mb-6">
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
                    d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold">Embed Script</h2>
                <p className="text-xs text-zinc-400">
                  Copy and paste before <code className="text-violet-600">&lt;/body&gt;</code>
                </p>
              </div>
            </div>

            {loading ? (
              <div className="h-28 bg-zinc-100 rounded-xl animate-pulse" />
            ) : !apiKey ? (
              <div className="flex items-center gap-3 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-5 py-4">
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
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                  />
                </svg>
                Save your settings on the Dashboard first to generate an API key.
              </div>
            ) : (
              <div className="relative group">
                <div className="bg-zinc-900 rounded-xl p-5 overflow-hidden">
                  {/* Decorative line numbers */}
                  <div className="flex">
                    <div className="text-zinc-600 text-xs font-mono select-none pr-4 leading-6">
                      1<br />2<br />3
                    </div>
                    <pre className="text-sm font-mono text-zinc-100 overflow-x-auto leading-6">
                      <span className="text-violet-400">&lt;script</span>
                      {"\n"}
                      {"    "}
                      <span className="text-sky-400">src</span>
                      <span className="text-zinc-400">=</span>
                      <span className="text-emerald-400">&quot;...chatBot.js&quot;</span>
                      {" "}
                      <span className="text-sky-400">data-api-key</span>
                      <span className="text-zinc-400">=</span>
                      <span className="text-emerald-400">&quot;{apiKey.slice(0, 8)}...&quot;</span>
                      <span className="text-violet-400">&gt;</span>
                      {"\n"}
                      <span className="text-violet-400">&lt;/script&gt;</span>
                    </pre>
                  </div>
                </div>
                <button
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-medium
                    bg-white/10 text-white backdrop-blur border border-white/10
                    hover:bg-white/20 transition-all duration-200"
                  onClick={copyCode}
                >
                  {copied ? (
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <svg
                        className="w-3.5 h-3.5"
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
                      Copied
                    </span>
                  ) : (
                    "Copy"
                  )}
                </button>
              </div>
            )}
          </div>

          {/* ── Steps ──────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-8 mb-6">
            <h2 className="text-base font-semibold mb-6">
              Installation Steps
            </h2>
            <div className="space-y-5">
              {steps.map((s, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {s.num}
                  </div>
                  <div className="pt-0.5">
                    <p className="text-sm font-medium">{s.title}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Live Preview ───────────────────────────── */}
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
                    d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold">Live Preview</h2>
                <p className="text-xs text-zinc-400">
                  How the chatbot appears on your website
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white shadow-md overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 h-10 bg-zinc-50 border-b border-zinc-200">
                <span className="w-2.5 h-2.5 rounded-full bg-red-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-300" />
                <div className="ml-4 flex-1 max-w-xs h-6 rounded-md bg-zinc-100 flex items-center px-3">
                  <span className="text-[10px] text-zinc-400">
                    your-website.com
                  </span>
                </div>
              </div>

              <div className="relative h-72 p-6 bg-zinc-50/30">
                <div className="text-zinc-300 text-sm">
                  Your website content goes here...
                </div>

                {/* Mini chat window */}
                <div className="absolute bottom-20 right-6 w-64 bg-white rounded-xl shadow-2xl shadow-zinc-200/80 border border-zinc-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 text-white text-xs px-3 py-2.5 flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-[8px] font-bold">
                        AI
                      </span>
                      Customer Support
                    </span>
                    <span className="text-zinc-400 text-[10px]">&#x2715;</span>
                  </div>
                  <div className="p-3 space-y-2 bg-zinc-50/50">
                    <div className="bg-white text-zinc-800 text-[11px] px-3 py-2 rounded-xl rounded-bl-sm w-fit shadow-sm border border-zinc-100">
                      Hi! How can I help you?
                    </div>
                    <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[11px] px-3 py-2 rounded-xl rounded-br-sm ml-auto w-fit">
                      What is the return policy?
                    </div>
                  </div>
                </div>

                {/* Floating button */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="absolute bottom-6 right-6 w-12 h-12 rounded-full
                    bg-gradient-to-br from-zinc-900 to-zinc-800 text-white
                    flex items-center justify-center shadow-xl
                    text-xs font-bold"
                >
                  Chat
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default EmbedClient;
