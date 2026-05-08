import { motion } from "framer-motion";
import { Link } from "wouter";

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-[#050608] text-white">
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p className="text-white/50 mb-8">Welcome to OUWIBO Agent Dashboard</p>
        <Link
          href="/agent"
          className="px-6 py-3 bg-primary text-black rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          Open Agent
        </Link>
      </div>
    </div>
  );
}