import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { PricingCards } from '@/components/pricing/PricingCards'
import { LiveDemo } from '@/components/landing/LiveDemo'
import Link from 'next/link'
import { CheckCircle2, Sparkles, Scan, History, Zap, Shield, Users } from 'lucide-react'

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI Humanizer',
    description: 'Rewrite AI text with adjustable intensity (1-10) and multiple style modes. Streaming output, instant results.',
  },
  {
    icon: Scan,
    title: 'Built-in AI Detector',
    description: 'Check any text for AI probability before and after humanization. See your score drop in real time.',
  },
  {
    icon: Shield,
    title: 'Deep Scan Mode',
    description: 'Sentence-by-sentence analysis with color coding. Click any flagged sentence to get alternative rewrites.',
  },
  {
    icon: Zap,
    title: 'Multiple Rewrite Modes',
    description: 'Standard, Academic, Business, Casual/Blog, and Creative modes to match your specific writing context.',
  },
  {
    icon: History,
    title: 'History',
    description: 'Access your past humanization jobs. Re-open, compare, or delete. Available on paid plans.',
  },
  {
    icon: Users,
    title: 'Compare Mode',
    description: 'Side-by-side diff view of original vs humanized text with readability and perplexity scores.',
  },
]

const FAQ = [
  {
    q: 'Does HumanizeAI really bypass GPTZero and Turnitin?',
    a: 'Yes. Our humanization engine is specifically engineered to increase perplexity and burstiness — the two primary signals AI detectors use. Users consistently achieve 95%+ human scores on GPTZero and ZeroGPT, and under 10% AI rating on Turnitin.',
  },
  {
    q: 'Does it change the meaning of my text?',
    a: 'No. We preserve all factual content, citations, technical terms, and the original argument. The rewriting only affects style, structure, and phrasing — not meaning.',
  },
  {
    q: 'What AI detectors does it bypass?',
    a: 'HumanizeAI is optimized for GPTZero, ZeroGPT, and Turnitin. These three cover 90%+ of academic and professional use cases.',
  },
  {
    q: 'Is my text stored or used to train AI?',
    a: "Free users' text is not stored at all. Paid users can opt into history storage. We never use your text for AI training.",
  },
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Yes. Cancel anytime from your account page. You keep access until the end of your billing period.',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Trusted by 10,000+ writers
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">
            Humanize Your AI Writing.{' '}
            <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Pass Every Detector.
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Transform AI-generated text into naturally human writing in seconds.
            Bypass GPTZero, ZeroGPT, and Turnitin with a 95%+ success rate.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-base px-8">
              <Link href="/sign-up">Start Free — No Credit Card</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base px-8">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>

          {/* Bypass badges */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
            {['GPTZero', 'ZeroGPT', 'Turnitin'].map((detector) => (
              <div
                key={detector}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20"
              >
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-400">Bypasses {detector}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Demo */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Try It Now — No Account Needed</h2>
            <p className="text-muted-foreground text-sm">Paste up to 200 words of AI text and humanize it instantly</p>
          </div>
          <LiveDemo />
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-center text-muted-foreground mb-12">Three simple steps to undetectable writing</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Paste Your Text', desc: 'Copy your AI-generated content and paste it into the input panel. No limit on the type of content.' },
              { step: '2', title: 'Click Humanize', desc: 'Choose your intensity level (1-10) and writing mode. Our AI rewrites it to sound naturally human.' },
              { step: '3', title: 'Pass Detection', desc: 'Check your score with the built-in detector. Copy the humanized text and submit with confidence.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-xl flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Everything You Need</h2>
          <p className="text-center text-muted-foreground mb-12">Built for students, writers, and professionals</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-muted/20" id="pricing">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
          <p className="text-center text-muted-foreground mb-12">Start free. Upgrade when you need more.</p>
          <PricingCards />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQ.map((item, i) => (
              <div key={i} className="rounded-xl border border-border p-6">
                <h3 className="text-base font-semibold mb-2">{item.q}</h3>
                <p className="text-sm text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center bg-gradient-to-b from-transparent to-primary/5">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">Ready to pass every AI detector?</h2>
          <p className="text-muted-foreground mb-8">Join thousands of writers who trust HumanizeAI. Start free today.</p>
          <Button size="lg" asChild className="text-base px-10">
            <Link href="/sign-up">Get Started Free</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
