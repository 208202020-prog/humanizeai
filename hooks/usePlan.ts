'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

interface Profile {
  plan: 'free' | 'basic' | 'premium'
  daily_humanizations_used: number
  daily_scans_used: number
  stripe_customer_id: string | null
  subscription_status: string | null
}

export function usePlan() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('plan, daily_humanizations_used, daily_scans_used, stripe_customer_id, subscription_status')
        .eq('id', user.id)
        .single()

      setProfile(data)
      setLoading(false)
    }

    getProfile()
  }, [])

  return { profile, loading }
}
