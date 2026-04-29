"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-dark-900 pt-24">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Left Column */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-block rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 text-sm text-blue-400">
                🚀 Powered by Advanced AI
              </div>
              <h1 className="text-5xl font-bold leading-tight text-white sm:text-6xl">
                Meet <span className="bg-gradient-premium bg-clip-text text-transparent">Ouwibo Agent</span>
              </h1>
              <p className="text-xl text-gray-400">
                Experience the power of state-of-the-art AI models. From quick responses to deep analysis, Ouwibo Agent handles it all with precision and style.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/chat"
                className="flex items-center justify-center gap-2 rounded-lg bg-gradient-premium px-8 py-4 font-semibold text-white hover:shadow-xl hover:shadow-blue-500/30 transition group"
              >
                Start Chatting
                <ArrowRight size={20} className="group-hover:translate-x-1 transition" />
              </Link>
              <Link
                href="#docs"
                className="flex items-center justify-center rounded-lg border border-gray-700 bg-dark-800/50 px-8 py-4 font-semibold text-white hover:border-blue-500 transition"
              >
                View Documentation
              </Link>
            </div>
          </div>

          {/* Right Column - Feature Cards */}
          <div className="grid grid-cols-2 gap-4">
            <FeatureCard
              title="⚡ Lightning Fast"
              description="Qwen 3.6 Flash for instant responses"
            />
            <FeatureCard
              title="⚖️ Balanced"
              description="Qwen 3.5 Plus for most use cases"
            />
            <FeatureCard
              title="🧠 Advanced Reasoning"
              description="Qwen 3 Max for complex analysis"
            />
            <FeatureCard
              title="🔬 Experimental"
              description="QwQ Plus for cutting-edge tasks"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-lg border border-gray-800 bg-dark-800/50 p-4 hover:border-blue-500/50 hover:bg-dark-800 transition">
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-gray-400">{description}</p>
    </div>
  );
}
