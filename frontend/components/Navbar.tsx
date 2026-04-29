"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-black font-bold">
              O
            </div>
            <div>
              <span className="text-lg font-semibold text-white">Ouwibo Agent</span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden items-center gap-8 md:flex">
            <Link href="/" className="text-sm text-gray-400 transition hover:text-white">
              Home
            </Link>
            <Link href="/chat" className="text-sm text-gray-400 transition hover:text-white">
              Chat
            </Link>
            <a href="#features" className="text-sm text-gray-400 transition hover:text-white">
              Features
            </a>
            <a href="https://github.com/ouwibo/Agent" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 transition hover:text-white">
              GitHub
            </a>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400">Online</span>
            </div>
            <Link
              href="/chat"
              className="flex h-10 items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 text-sm font-semibold text-black transition hover:shadow-lg hover:shadow-amber-500/30"
            >
              <Zap className="mr-1 h-4 w-4" />
              Launch App
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
