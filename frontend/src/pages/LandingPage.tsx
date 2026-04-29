import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bot,
  Brain,
  Shield,
  Zap,
  Globe,
  Wallet,
  Code,
  MessageSquare,
  ChevronRight,
  Check,
  Star,
  Menu,
  X,
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'Intelligent Conversations',
    description: 'Dynamic step-by-step reasoning powered by advanced LLMs with session memory across reloads.',
  },
  {
    icon: Wallet,
    title: 'Web3 Integration',
    description: 'Multi-chain wallet scanning, ENS resolution, and real-time crypto market data.',
  },
  {
    icon: Globe,
    title: 'Real-time Knowledge',
    description: 'Global search and web reading capabilities for up-to-date information.',
  },
  {
    icon: Code,
    title: 'Extensible Skills',
    description: 'Drop-in skill system - add new capabilities by simply adding a SKILL.md file.',
  },
  {
    icon: Shield,
    title: 'Enterprise Ready',
    description: 'Rate limiting, API key management, and proper error handling built-in.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized for speed with Bun runtime and edge deployment on Cloudflare.',
  },
]

const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: ['100 messages/month', 'Basic Web3 features', 'Community support', '1 API key'],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For power users and small teams',
    features: ['Unlimited messages', 'Full Web3 suite', 'Priority support', '5 API keys', 'Custom skills', 'Analytics dashboard'],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations',
    features: ['Everything in Pro', 'Unlimited API keys', 'Dedicated support', 'SLA guarantee', 'Custom integrations', 'On-premise option'],
    cta: 'Contact Sales',
    popular: false,
  },
]

const testimonials = [
  {
    name: 'Alex Chen',
    role: 'DeFi Developer',
    content: 'Ouwibo Agent has transformed how I interact with blockchain data. The Web3 integration is seamless.',
    avatar: 'AC',
  },
  {
    name: 'Sarah Kim',
    role: 'Product Manager',
    content: 'The extensible skill system is a game-changer. We added our custom workflow in minutes.',
    avatar: 'SK',
  },
  {
    name: 'Marcus Johnson',
    role: 'CTO at Web3 Startup',
    content: 'Enterprise-ready with proper security. Exactly what we needed for our AI infrastructure.',
    avatar: 'MJ',
  },
]

const stats = [
  { value: '50K+', label: 'Active Users' },
  { value: '1M+', label: 'Messages Processed' },
  { value: '99.9%', label: 'Uptime' },
  { value: '<100ms', label: 'Response Time' },
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-[-10rem] h-[28rem] bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_42%)]" />
        <div className="absolute right-[-8rem] top-[12rem] h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(circle,_rgba(56,189,248,0.13),_transparent_66%)] blur-3xl" />
        <div className="absolute left-[-8rem] bottom-[8rem] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,_rgba(34,197,94,0.1),_transparent_66%)] blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative mx-auto max-w-7xl px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 backdrop-blur">
              <Bot className="size-6 text-emerald-400" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.38em] text-white/40">Ouwibo</div>
              <div className="text-sm font-semibold text-white">Agent</div>
            </div>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-white/70 hover:text-white transition">Features</a>
            <a href="#pricing" className="text-sm text-white/70 hover:text-white transition">Pricing</a>
            <a href="#testimonials" className="text-sm text-white/70 hover:text-white transition">Testimonials</a>
            <Link to="/docs" className="text-sm text-white/70 hover:text-white transition">Docs</Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/chat" className="btn-secondary">
              Try Chat
            </Link>
            <Link to="/chat" className="btn-primary">
              Get Started
              <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 text-white/70"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 p-4 glass-card">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-sm text-white/70 hover:text-white transition">Features</a>
              <a href="#pricing" className="text-sm text-white/70 hover:text-white transition">Pricing</a>
              <a href="#testimonials" className="text-sm text-white/70 hover:text-white transition">Testimonials</a>
              <Link to="/docs" className="text-sm text-white/70 hover:text-white transition">Docs</Link>
              <hr className="border-white/10" />
              <Link to="/chat" className="btn-primary w-full justify-center">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-6 py-20 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-1 text-[11px] uppercase tracking-[0.3em] text-emerald-200 mb-6">
              <Zap className="size-3" />
              Now in Production
            </div>
            
            <h1 className="text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              Your Professional{' '}
              <span className="gradient-text">AI Agent</span>{' '}
              for Web & Web3
            </h1>
            
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/70">
              Clean presentation. Focused chat. Strong hierarchy. Built to feel credible on first view. 
              Multi-chain wallet scanning, real-time knowledge, and extensible skills architecture.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/chat" className="btn-primary text-base px-8">
                Try the Chat
                <ArrowRight className="size-5" />
              </Link>
              <a href="#features" className="btn-secondary text-base px-8">
                Learn More
              </a>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-white/50">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative">
            <div className="glass-card p-6 animate-float">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
                <div className="size-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
                  <Bot className="size-5 text-black" />
                </div>
                <div>
                  <div className="font-semibold">Ouwibo Agent</div>
                  <div className="text-xs text-white/50">Online • Ready to help</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-br-md bg-white px-4 py-3 text-sm text-black">
                    What's the price of ETH?
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl rounded-bl-md border border-white/10 bg-white/8 px-4 py-3 text-sm text-white">
                    ETH is currently trading at <span className="text-emerald-400 font-semibold">$3,245.67</span>, up 2.3% in the last 24 hours.
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-br-md bg-white px-4 py-3 text-sm text-black">
                    Check my wallet 0x123...abc
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl rounded-bl-md border border-white/10 bg-white/8 px-4 py-3 text-sm text-white">
                    <span className="text-white/50">Analyzing wallet...</span>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between"><span>ETH:</span><span className="text-emerald-400">12.5 ($40.5k)</span></div>
                      <div className="flex justify-between"><span>USDC:</span><span className="text-emerald-400">5,000</span></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex gap-3">
                <input
                  type="text"
                  placeholder="Ask anything..."
                  className="input-chat"
                  disabled
                />
                <button className="btn-primary px-4" disabled>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Everything you need in an{' '}
            <span className="gradient-text">AI Agent</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-white/60">
            Built with modern infrastructure and enterprise-grade reliability
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="glass-card p-6 group hover:border-emerald-500/30 transition">
                <div className="flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-emerald-400 group-hover:bg-emerald-500/20 transition">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/60">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Simple, transparent{' '}
            <span className="gradient-text">pricing</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-white/60">
            Start for free, scale when you need
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div 
              key={plan.name} 
              className={`glass-card p-8 relative ${plan.popular ? 'border-emerald-500/50 ring-2 ring-emerald-500/20' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-500 text-xs font-semibold text-black">
                  Most Popular
                </div>
              )}
              
              <div className="text-sm text-white/50 uppercase tracking-wider">{plan.name}</div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-white/50">{plan.period}</span>
              </div>
              <p className="mt-2 text-sm text-white/60">{plan.description}</p>
              
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-white/70">
                    <Check className="size-4 text-emerald-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button className={`mt-8 w-full ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Loved by{' '}
            <span className="gradient-text">developers</span>
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div key={testimonial.name} className="glass-card p-6">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="size-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-white/70 leading-relaxed">"{testimonial.content}"</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="size-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-sm font-semibold text-black">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-medium text-white">{testimonial.name}</div>
                  <div className="text-xs text-white/50">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="glass-card p-12 text-center bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Ready to get started?
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-lg text-white/60">
            Start building with Ouwibo Agent today. Free tier available.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/chat" className="btn-primary text-base px-8">
              Try the Chat
              <ArrowRight className="size-5" />
            </Link>
            <Link to="/docs" className="btn-secondary text-base px-8">
              Read Docs
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative mx-auto max-w-7xl px-6 py-12 border-t border-white/10">
        <div className="grid gap-8 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                <Bot className="size-5 text-emerald-400" />
              </div>
              <div>
                <div className="font-semibold">Ouwibo Agent</div>
                <div className="text-xs text-white/50">Professional AI Assistant</div>
              </div>
            </div>
            <p className="text-sm text-white/50">
              Your intelligent, extensible AI assistant built for the modern web and Web3.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><a href="#features" className="hover:text-white transition">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
              <li><Link to="/docs" className="hover:text-white transition">Documentation</Link></li>
              <li><Link to="/chat" className="hover:text-white transition">Live Chat</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><a href="https://github.com/ouwibo/Agent" className="hover:text-white transition">GitHub</a></li>
              <li><a href="#" className="hover:text-white transition">API Reference</a></li>
              <li><a href="#" className="hover:text-white transition">Status</a></li>
              <li><a href="#" className="hover:text-white transition">Changelog</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-white/50">
            © 2024 Ouwibo Agent. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/ouwibo/Agent" className="text-white/50 hover:text-white transition">
              <svg className="size-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
            <a href="https://twitter.com/ouwibo" className="text-white/50 hover:text-white transition">
              <svg className="size-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
