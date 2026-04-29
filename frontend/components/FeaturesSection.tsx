"use client";

import { Zap, Brain, Shield, Gauge } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Multiple AI Models",
    description: "Choose from 4 powerful AI models optimized for different use cases",
  },
  {
    icon: Brain,
    title: "Advanced Reasoning",
    description: "Deep analysis and complex problem-solving capabilities",
  },
  {
    icon: Shield,
    title: "Enterprise Ready",
    description: "Built on Cloudflare Workers for maximum reliability and security",
  },
  {
    icon: Gauge,
    title: "Performance Optimized",
    description: "Lightning-fast responses with minimal latency",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="border-t border-gray-800 bg-dark-800 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Powerful Features</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Everything you need to leverage advanced AI capabilities
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group rounded-lg border border-gray-700 bg-dark-900/50 p-6 hover:border-blue-500 hover:bg-dark-900 transition"
              >
                <div className="mb-4 inline-block rounded-lg bg-blue-500/10 p-3">
                  <Icon className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="mb-2 font-semibold text-white">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
