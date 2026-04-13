import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Clock, FileText, Lock } from 'lucide-react'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/sign-in')

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const isPaidUser = profile?.plan === 'basic' || profile?.plan === 'premium'

  if (!isPaidUser) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center">
        <div className="py-16 space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold">History requires a paid plan</h2>
          <p className="text-muted-foreground">
            Upgrade to Basic or Premium to save and access your past humanization jobs.
          </p>
          <Button asChild>
            <Link href="/pricing">View Plans</Link>
          </Button>
        </div>
      </div>
    )
  }

  const limit = profile.plan === 'premium' ? 1000 : 30
  const { data: jobs } = await supabase
    .from('humanization_jobs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (!jobs || jobs.length === 0) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center">
        <div className="py-16 space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold">No history yet</h2>
          <p className="text-muted-foreground">Your humanization jobs will appear here.</p>
          <Button asChild>
            <Link href="/dashboard/humanizer">Start Humanizing</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">History</h1>
        <p className="text-sm text-muted-foreground">{jobs.length} humanization jobs</p>
      </div>

      <div className="space-y-3">
        {jobs.map((job) => (
          <div key={job.id} className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {job.original_text?.slice(0, 100)}...
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                  </span>
                  <span className="text-xs text-muted-foreground">{job.word_count} words</span>
                  <Badge variant="outline" className="text-xs">
                    Intensity {job.intensity_level}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {job.mode}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                {job.original_ai_score !== null && job.humanized_ai_score !== null && (
                  <div className="text-xs text-right">
                    <div className="text-red-400">{job.original_ai_score}% AI before</div>
                    <div className="text-green-400">{job.humanized_ai_score}% AI after</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
