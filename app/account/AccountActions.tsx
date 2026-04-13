'use client'

import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useState } from 'react'

export default function AccountActions() {
  const [loading, setLoading] = useState(false)

  const handlePortal = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      toast.error('Failed to open billing portal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handlePortal} disabled={loading}>
      {loading ? 'Loading...' : 'Manage Billing'}
    </Button>
  )
}
