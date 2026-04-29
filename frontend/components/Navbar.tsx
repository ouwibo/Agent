"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-gray-800 bg-dark-900/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-premium" />
          <span className="text-xl font-bold text-white">Ouwibo Agent</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden gap-8 md:flex">
          <Link href="/#features" className="text-gray-300 hover:text-white transition">
            Features
          </Link>
          <Link href="/#pricing" className="text-gray-300 hover:text-white transition">
            Models
          </Link>
          <Link href="/#docs" className="text-gray-300 hover:text-white transition">
            Docs
          </Link>
        </div>

        {/* CTA Button */}
        <div className="hidden gap-4 md:flex">
          <Link
            href="/chat"
            className="rounded-lg bg-gradient-premium px-6 py-2 font-medium text-white hover:shadow-lg hover:shadow-blue-500/50 transition"
          >
            Try Now
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-300 hover:text-white"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="border-t border-gray-800 bg-dark-800 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link href="/#features" className="text-gray-300 hover:text-white">
              Features
            </Link>
            <Link href="/#pricing" className="text-gray-300 hover:text-white">
              Models
            </Link>
            <Link href="/#docs" className="text-gray-300 hover:text-white">
              Docs
            </Link>
            <Link
              href="/chat"
              className="mt-2 rounded-lg bg-gradient-premium px-6 py-2 text-center font-medium text-white"
            >
              Try Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
