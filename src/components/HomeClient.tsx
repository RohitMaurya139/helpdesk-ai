"use client";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import axios from "axios";
import { useRouter } from "next/navigation";

function HomeClient({ email }: { email: string }) {
  const [loading, setLoading] = useState(false);
  const handleLogin = () => {
    setLoading(true);
    window.location.href = "/api/auth/login";
  };
  const firstLetter = email ? email[0].toUpperCase() : "";
  const [open, setOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const navigate = useRouter();

  const features = [
    {
      icon: (
        <svg
          className="w-6 h-6"
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
      ),
      title: "Plug & Play",
      desc: "Add the chatbot to your site with a single script tag. No complex setup or coding required.",
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
          />
        </svg>
      ),
      title: "Admin Controlled",
      desc: "You control exactly what the AI knows and answers. Full control over your chatbot's knowledge.",
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
          />
        </svg>
      ),
      title: "AI Powered",
      desc: "Powered by advanced AI models. Your customers get instant, accurate support 24/7.",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Create Account",
      desc: "Sign up and access your dashboard in seconds.",
    },
    {
      step: "02",
      title: "Add Knowledge",
      desc: "Enter your FAQs, policies, and business info.",
    },
    {
      step: "03",
      title: "Embed & Go",
      desc: "Copy one script tag and paste it into your site.",
    },
  ];

  const handleLogOut = async () => {
    try {
      await axios.get("/api/auth/logout");
      window.location.href = "/";
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 overflow-x-hidden">
      {/* ── Navbar ─────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 w-full z-50 bg-white/60 backdrop-blur-2xl border-b border-zinc-100"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-lg font-bold tracking-tight">
            HelpDesk<span className="gradient-text ml-1">AI</span>
          </div>

          <div className="flex items-center gap-4">
            {email ? (
              <div className="relative" ref={popupRef}>
                <button
                  className="w-9 h-9 rounded-full
                    bg-gradient-to-br from-violet-600 to-indigo-600 text-white
                    flex items-center justify-center
                    text-sm font-semibold
                    hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300"
                  onClick={() => setOpen(!open)}
                >
                  {firstLetter}
                </button>
                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-48
                        bg-white rounded-xl
                        shadow-2xl shadow-zinc-200/80 border border-zinc-100
                        overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-zinc-100">
                        <p className="text-xs text-zinc-400 truncate">{email}</p>
                      </div>
                      <button
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-50 transition"
                        onClick={() => navigate.push("/dashboard")}
                      >
                        Dashboard
                      </button>
                      <button
                        className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
                        onClick={handleLogOut}
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                className="px-5 py-2 rounded-full
                  bg-zinc-900 text-white text-sm font-medium
                  hover:bg-zinc-800 transition-all duration-300
                  hover:shadow-lg hover:shadow-zinc-300/50
                  disabled:opacity-60
                  flex items-center gap-2"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? "Loading..." : "Login"}
              </button>
            )}
          </div>
        </div>
      </motion.nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative pt-32 pb-28 px-6 aurora-bg overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-violet-200 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-200 rounded-full blur-3xl opacity-20" />

        <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 text-violet-700 text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
              AI-Powered Customer Support
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
              Customer Support
              <br />
              <span className="gradient-text">Reimagined with AI</span>
            </h1>

            <p className="mt-6 text-lg text-zinc-500 max-w-lg leading-relaxed">
              Add a powerful AI chatbot to your website in minutes. Let your
              customers get instant, accurate answers using your own business
              knowledge.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              {email ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-7 py-3.5 rounded-xl
                    bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium
                    hover:shadow-xl hover:shadow-violet-500/25
                    transition-all duration-300"
                  onClick={() => navigate.push("/dashboard")}
                >
                  Go to Dashboard
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-7 py-3.5 rounded-xl
                    bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium
                    hover:shadow-xl hover:shadow-violet-500/25
                    transition-all duration-300"
                  onClick={handleLogin}
                >
                  Get Started Free
                </motion.button>
              )}
              <a
                href="#how-it-works"
                className="px-7 py-3.5 rounded-xl
                  border border-zinc-200 bg-white/60 backdrop-blur
                  text-zinc-700 font-medium
                  hover:border-zinc-300 hover:bg-white transition-all duration-300"
              >
                How It Works
              </a>
            </div>
          </motion.div>

          {/* Chat Preview Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-2xl bg-white shadow-2xl shadow-zinc-200/60 border border-zinc-100 overflow-hidden glow">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 px-5 py-3.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                  AI
                </div>
                <div>
                  <div className="text-white text-sm font-medium">
                    Customer Support
                  </div>
                  <div className="text-zinc-400 text-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Online
                  </div>
                </div>
              </div>
              {/* Messages */}
              <div className="p-5 space-y-3 bg-zinc-50/50 min-h-[200px]">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex gap-2 items-end"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold">
                    AI
                  </div>
                  <div className="bg-white rounded-2xl rounded-bl-md px-4 py-2.5 text-sm shadow-sm border border-zinc-100 max-w-[80%]">
                    Hi! How can I help you today?
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 }}
                  className="flex justify-end"
                >
                  <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl rounded-br-md px-4 py-2.5 text-sm max-w-[80%]">
                    Do you offer cash on delivery?
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.6 }}
                  className="flex gap-2 items-end"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold">
                    AI
                  </div>
                  <div className="bg-white rounded-2xl rounded-bl-md px-4 py-2.5 text-sm shadow-sm border border-zinc-100 max-w-[80%]">
                    Yes! Cash on Delivery is available for all orders.
                  </div>
                </motion.div>
              </div>
              {/* Input */}
              <div className="px-4 py-3 border-t border-zinc-100 flex gap-2 bg-white">
                <div className="flex-1 bg-zinc-100 rounded-lg px-3 py-2 text-sm text-zinc-400">
                  Type a message...
                </div>
                <div className="px-4 py-2 bg-zinc-900 text-white text-sm rounded-lg font-medium">
                  Send
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute -bottom-4 -right-4 px-4 py-2 rounded-full
                bg-white shadow-xl shadow-zinc-200/60 border border-zinc-100
                text-xs font-medium text-zinc-600
                flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Instant Responses
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── How it Works ───────────────────────────────────── */}
      <section id="how-it-works" className="py-28 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <p className="text-sm font-medium text-violet-600 mb-3">
              Simple Setup
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Three steps to get started
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative p-8"
              >
                <div className="text-5xl font-black text-zinc-100 mb-4">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  {s.desc}
                </p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 -right-4 text-zinc-200 text-2xl">
                    &rarr;
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section
        id="feature"
        className="py-28 px-6 bg-zinc-50/50 border-t border-zinc-100"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <p className="text-sm font-medium text-violet-600 mb-3">
              Features
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Why businesses choose HelpDesk AI
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="card-hover bg-white rounded-2xl p-8 border border-zinc-100 shadow-sm"
              >
                <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-5">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Ready to transform your
              <br />
              customer support?
            </h2>
            <p className="text-zinc-500 mb-10 text-lg">
              Join businesses using HelpDesk AI to provide instant, intelligent
              customer support.
            </p>
            {email ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 rounded-xl
                  bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium text-lg
                  hover:shadow-xl hover:shadow-violet-500/25
                  transition-all duration-300"
                onClick={() => navigate.push("/dashboard")}
              >
                Open Dashboard
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 rounded-xl
                  bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium text-lg
                  hover:shadow-xl hover:shadow-violet-500/25
                  transition-all duration-300"
                onClick={handleLogin}
              >
                Get Started Free
              </motion.button>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-zinc-100 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm font-semibold">
            HelpDesk<span className="gradient-text ml-1">AI</span>
          </div>
          <p className="text-sm text-zinc-400">
            &copy; {new Date().getFullYear()} HelpDesk AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default HomeClient;
