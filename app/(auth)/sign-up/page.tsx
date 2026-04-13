import { SignUpForm } from '@/components/auth/SignUpForm'
import { Bot } from 'lucide-react'
import Link from 'next/link'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-primary/5 to-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Bot className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              HumanizeAI
            </span>
          </Link>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground mt-1">Start with 3 free humanizations per day</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
          <SignUpForm />
        </div>
      </div>
    </div>
  )
}
