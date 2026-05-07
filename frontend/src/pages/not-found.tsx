import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="text-center">
        <p className="font-mono text-primary/60 text-sm tracking-widest mb-3">404</p>
        <h1 className="text-3xl font-bold text-white mb-4">Page Not Found</h1>
        <p className="text-white/40 text-sm mb-8">This page doesn't exist.</p>
        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-black font-semibold text-sm hover:opacity-90 transition-opacity">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
