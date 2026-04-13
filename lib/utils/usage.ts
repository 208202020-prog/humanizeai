import { createServiceClient } from '@/lib/supabase/server'

export async function checkAndIncrementUsage(
  userId: string,
  type: 'humanization' | 'scan'
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const supabase = await createServiceClient()

  // Get user profile with plan limits
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, daily_humanizations_used, daily_scans_used, last_reset_date')
    .eq('id', userId)
    .single()

  if (!profile) return { allowed: false, remaining: 0, limit: 0 }

  const { data: planLimits } = await supabase
    .from('plan_limits')
    .select('*')
    .eq('plan', profile.plan)
    .single()

  if (!planLimits) return { allowed: false, remaining: 0, limit: 0 }

  // Check if reset needed
  const today = new Date().toISOString().split('T')[0]
  if (profile.last_reset_date !== today) {
    await supabase
      .from('profiles')
      .update({
        daily_humanizations_used: 0,
        daily_scans_used: 0,
        last_reset_date: today,
      })
      .eq('id', userId)
    profile.daily_humanizations_used = 0
    profile.daily_scans_used = 0
  }

  const field = type === 'humanization' ? 'daily_humanizations_used' : 'daily_scans_used'
  const limitField = type === 'humanization' ? 'daily_humanizations' : 'daily_scans'
  const used = type === 'humanization' ? profile.daily_humanizations_used : profile.daily_scans_used
  const limit = planLimits[limitField as keyof typeof planLimits] as number

  if (used >= limit) {
    return { allowed: false, remaining: 0, limit }
  }

  // Increment usage
  await supabase
    .from('profiles')
    .update({ [field]: used + 1 })
    .eq('id', userId)

  return { allowed: true, remaining: limit - used - 1, limit }
}
