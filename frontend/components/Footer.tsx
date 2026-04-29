"use client";

import Link from "next/link";
import { ExternalLink, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-dark-900 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-semibold text-white mb-4">Ouwibo Agent</h3>
            <p className="text-sm text-gray-400">
              Advanced AI agent powered by state-of-the-art models
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <div className="space-y-2">
              <Link href="/chat" className="block text-sm text-gray-400 hover:text-white">
                Chat
              </Link>
              <Link href="#features" className="block text-sm text-gray-400 hover:text-white">
                Features
              </Link>
              <Link href="#pricing" className="block text-sm text-gray-400 hover:text-white">
                Models
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <div className="space-y-2">
              <Link href="#docs" className="block text-sm text-gray-400 hover:text-white">
                Documentation
              </Link>
              <Link href="#api" className="block text-sm text-gray-400 hover:text-white">
                API Reference
              </Link>
              <Link href="#" className="block text-sm text-gray-400 hover:text-white">
                Examples
              </Link>
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-white mb-4">Follow</h4>
            <div className="flex gap-4">
              <a
                href="https://github.com/ouwibo/Agent"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition"
              >
                <ExternalLink size={20} />
              </a>
              <a
                href="mailto:hello@ouwibo.com"
                className="text-gray-400 hover:text-white transition"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © 2026 Ouwibo. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-sm text-gray-400 hover:text-white">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-gray-400 hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
