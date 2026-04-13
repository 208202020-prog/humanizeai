'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const plans = [
  {
    name: 'Free',
    price: { monthly: 0, annual: 0 },
    description: 'Perfect for trying out HumanizeAI',
    badge: null,
    features: [
      { text: '3 humanizations per day', included: true },
      { text: '5 AI scans per day', included: true },
      { text: 'Up to 1,000 words', included: true },
      { text: 'Standard mode only', included: true },
      { text: 'Deep Scan', included: true },
      { text: 'History (last 30)', included: false },
      { text: 'All rewrite modes', included: false },
      { text: 'Priority support', included: false },
    ],
    priceId: { monthly: null, annual: null },
    cta: 'Get Started Free',
    popular: false,
  },
  {
    name: 'Basic',
    price: { monthly: 20, annual: 200 },
    description: 'For regular writers and students',
    badge: 'Most Popular',
    features: [
      { text: '15 humanizations per day', included: true },
      { text: '25 AI scans per day', included: true },
      { text: 'Up to 2,000 words', included: true },
      { text: 'All rewrite modes', included: true },
      { text: 'Deep Scan', included: true },
      { text: 'History (last 30)', included: true },
      { text: 'Priority support', included: false },
    ],
    priceId: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_BASIC_MONTHLY_PRICE_ID,
      annual: process.env.NEXT_PUBLIC_STRIPE_BASIC_ANNUAL_PRICE_ID,
    },
    cta: 'Start Basic',
    popular: true,
  },
  {
    name: 'Premium',
    price: { monthly: 50, annual: 500 },
    description: 'For professionals and power users',
    badge: 'Best Value',
    features: [
      { text: '50 humanizations per day', included: true },
      { text: '100 AI scans per day', included: true },
      { text: 'Up to 5,000 words', included: true },
      { text: 'All rewrite modes', included: true },
      { text: 'Deep Scan', included: true },
      { text: 'Unlimited history', included: true },
      { text: 'Priority support', included: true },
    ],
    priceId: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID,
      annual: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_ANNUAL_PRICE_ID,
    },
    cta: 'Start Premium',
    popular: false,
  },
]

export function PricingCards() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (planName: string, priceId: string | null | undefined) => {
    if (!priceId) {
      window.location.href = '/sign-up'
      return
    }
    setLoading(planName)
    try {
      const res = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      if (res.status === 401) {
        window.location.href = '/sign-in'
        return
      }
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      toast.error('Failed to start checkout. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setBilling('monthly')}
          className={cn('text-sm font-medium transition-colors', billing === 'monthly' ? 'text-foreground' : 'text-muted-foreground')}
        >
          Monthly
        </button>
        <div
          className="relative w-12 h-6 rounded-full bg-muted cursor-pointer"
          onClick={() => setBilling(b => b === 'monthly' ? 'annual' : 'monthly')}
        >
          <div className={cn('absolute top-1 w-4 h-4 rounded-full bg-primary transition-transform', billing === 'annual' ? 'translate-x-7' : 'translate-x-1')} />
        </div>
        <button
          onClick={() => setBilling('annual')}
          className={cn('text-sm font-medium transition-colors', billing === 'annual' ? 'text-foreground' : 'text-muted-foreground')}
        >
          Annual <span className="text-green-500 text-xs font-normal">(2 months free)</span>
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              'relative flex flex-col',
              plan.popular && 'border-primary shadow-lg shadow-primary/10 scale-105'
            )}
          >
            {plan.badge && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                {plan.badge}
              </Badge>
            )}
            <CardHeader>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-2">
                <span className="text-4xl font-bold">${plan.price[billing]}</span>
                {plan.price[billing] > 0 && (
                  <span className="text-muted-foreground">/{billing === 'monthly' ? 'mo' : 'yr'}</span>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2.5">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    {feature.included ? (
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                    )}
                    <span className={feature.included ? '' : 'text-muted-foreground'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
                onClick={() => handleSubscribe(plan.name, plan.priceId[billing] as string)}
                disabled={loading === plan.name}
              >
                {loading === plan.name ? 'Loading...' : plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
