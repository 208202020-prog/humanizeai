'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Bot, Scan, History, CreditCard, Settings, Sparkles } from 'lucide-react'
import { usePlan } from '@/hooks/usePlan'

const navItems = [
  { href: '/dashboard/humanizer', label: 'Humanizer', icon: Sparkles },
  { href: '/dashboard/detector', label: 'AI Detector', icon: Scan },
  { href: '/dashboard/history', label: 'History', icon: History },
]

export function Sidebar() {
  const pathname = usePathname()
  const { profile } = usePlan()

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-background border-r border-border flex flex-col z-40">
      <div className="p-6 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <Bot className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            HumanizeAI
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-1">
        <Link
          href="/pricing"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <CreditCard className="h-4 w-4" />
          Upgrade Plan
        </Link>
        <Link
          href="/account"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Settings className="h-4 w-4" />
          Account
        </Link>
        {profile && (
          <div className="px-3 py-2 mt-2">
            <span className={cn(
              'text-xs px-2 py-1 rounded-full font-medium',
              profile.plan === 'free' ? 'bg-muted text-muted-foreground' :
              profile.plan === 'basic' ? 'bg-blue-500/10 text-blue-500' :
              'bg-purple-500/10 text-purple-500'
            )}>
              {profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1)} Plan
            </span>
          </div>
        )}
      </div>
    </aside>
  )
}
