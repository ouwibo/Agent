"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen bg-[#050816] text-white">
      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-[-10rem] h-[40rem] bg-[radial-gradient(circle_at_top,_rgba(240,165,0,0.12),_transparent_50%)]" />
        <div className="absolute right-[-12rem] top-[16rem] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,_rgba(59,130,246,0.08),_transparent_66%)] blur-3xl" />
        <div className="absolute left-[-12rem] bottom-[12rem] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,_rgba(34,197,94,0.06),_transparent_66%)] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-32">
        <div className="text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-200">AI Agent Platform</span>
          </div>

          {/* Title */}
          <h1 className="mb-6 text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
            <span className="text-white">Professional AI</span>
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              Agent Studio
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-400 sm:text-xl">
            Clean presentation. Focused chat. Strong hierarchy. Built to feel credible on first view.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/chat"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 text-base font-semibold text-black shadow-lg shadow-amber-500/25 transition hover:shadow-xl hover:shadow-amber-500/30"
            >
              Try the Chat
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="https://github.com/ouwibo/Agent"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 text-base font-semibold text-white transition hover:bg-white/10"
            >
              View on GitHub
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
              <div className="text-3xl font-bold text-amber-400">24/7</div>
              <div className="mt-1 text-sm text-gray-500">Availability</div>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
              <div className="text-3xl font-bold text-blue-400">Multi</div>
              <div className="mt-1 text-sm text-gray-500">Model Support</div>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
              <div className="text-3xl font-bold text-green-400">Edge</div>
              <div className="mt-1 text-sm text-gray-500">Deployment</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
