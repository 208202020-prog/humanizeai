import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PricingCards } from '@/components/pricing/PricingCards'

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-muted-foreground text-lg">
              Start free. No credit card required. Upgrade when you need more power.
            </p>
          </div>
          <PricingCards />
        </div>
      </main>
      <Footer />
    </div>
  )
}
