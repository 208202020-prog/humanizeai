import Link from 'next/link'
import { Bot } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Bot className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                HumanizeAI
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Transform AI-generated text into naturally human writing. Bypass GPTZero, ZeroGPT, and Turnitin with confidence.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-3">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/dashboard/humanizer" className="hover:text-foreground transition-colors">Humanizer</Link></li>
              <li><Link href="/dashboard/detector" className="hover:text-foreground transition-colors">AI Detector</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-3">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} HumanizeAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
