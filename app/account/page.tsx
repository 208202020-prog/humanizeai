import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import AccountActions from './AccountActions'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/sign-in')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: planLimits } = await supabase
    .from('plan_limits')
    .select('*')
    .eq('plan', profile?.plan ?? 'free')
    .single()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold">Account Settings</h1>

          {/* Profile */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Profile</h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Name</span>
                <span className="text-sm font-medium">{profile?.full_name || '—'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">Member since</span>
                <span className="text-sm font-medium">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Plan */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Subscription</h2>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold capitalize">{profile?.plan ?? 'Free'} Plan</span>
                  <Badge variant={profile?.plan === 'free' ? 'outline' : 'default'}>
                    {profile?.subscription_status ?? 'active'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {planLimits?.daily_humanizations} humanizations/day · {planLimits?.max_words_per_input?.toLocaleString()} words max
                </p>
              </div>
              {profile?.plan !== 'premium' && (
                <Button asChild size="sm">
                  <a href="/pricing">Upgrade</a>
                </Button>
              )}
            </div>

            {/* Usage today */}
            <div className="pt-4 border-t border-border space-y-3">
              <h3 className="text-xs font-medium text-muted-foreground">Today&apos;s Usage</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="text-2xl font-bold">{profile?.daily_humanizations_used ?? 0}</div>
                  <div className="text-xs text-muted-foreground">of {planLimits?.daily_humanizations} humanizations</div>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="text-2xl font-bold">{profile?.daily_scans_used ?? 0}</div>
                  <div className="text-xs text-muted-foreground">of {planLimits?.daily_scans} AI scans</div>
                </div>
              </div>
            </div>

            {profile?.stripe_customer_id && (
              <AccountActions />
            )}
          </div>

          {/* Danger zone */}
          <div className="rounded-xl border border-destructive/30 bg-card p-6 space-y-4">
            <h2 className="text-sm font-semibold text-destructive uppercase tracking-wider">Danger Zone</h2>
            <p className="text-sm text-muted-foreground">
              Deleting your account will permanently remove all your data including history and subscription.
            </p>
            <Button variant="destructive" size="sm" disabled>
              Delete Account
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
