import { createClient } from '@/lib/supabase/server'
import { HumanizerPanel } from '@/components/humanizer/HumanizerPanel'
import { AlertCircle } from 'lucide-react'

export default async function HumanizerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  let planLimits = null

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('plan, daily_humanizations_used, daily_scans_used')
      .eq('id', user.id)
      .single()
    profile = data

    if (profile) {
      const { data: limits } = await supabase
        .from('plan_limits')
        .select('*')
        .eq('plan', profile.plan)
        .single()
      planLimits = limits
    }
  }

  const maxWords = planLimits?.max_words_per_input ?? 1000
  const dailyLimit = planLimits?.daily_humanizations ?? 3
  const used = profile?.daily_humanizations_used ?? 0
  const remaining = Math.max(0, dailyLimit - used)
  const isPaidUser = profile?.plan !== 'free' && profile?.plan !== null

  return (
    <div className="p-6 h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Humanizer</h1>
          <p className="text-sm text-muted-foreground">
            Transform AI text into naturally human writing
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium">{remaining} / {dailyLimit} remaining today</div>
            <div className="text-xs text-muted-foreground capitalize">
              {profile?.plan ?? 'free'} plan · {maxWords.toLocaleString()} words max
            </div>
          </div>
          {remaining === 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium">
              <AlertCircle className="h-3.5 w-3.5" />
              Daily limit reached
            </div>
          )}
        </div>
      </div>

      <HumanizerPanel maxWords={maxWords} isPaidUser={isPaidUser} />
    </div>
  )
}
