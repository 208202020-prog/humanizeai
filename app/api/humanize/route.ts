import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { humanizeText } from '@/lib/anthropic/humanize'
import { countWords } from '@/lib/utils/word-count'
import { checkAndIncrementUsage } from '@/lib/utils/usage'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

// Guest users: 200 word limit, rate-limited by IP
const GUEST_WORD_LIMIT = 200
const guestRateLimit = new Map<string, number>()

function checkGuestRateLimit(ip: string): boolean {
  const now = Date.now()
  const last = guestRateLimit.get(ip) || 0
  if (now - last < 30000) return false // 30s cooldown for guests
  guestRateLimit.set(ip, now)
  return true
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const { text, intensity = 7, mode = 'standard' } = body

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const wordCount = countWords(text)

    // ── Guest (unauthenticated) path ──────────────────────────────────────────
    if (!user) {
      const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        'unknown'

      if (!checkGuestRateLimit(ip)) {
        return NextResponse.json(
          { error: 'Please wait 30 seconds before trying again.' },
          { status: 429 }
        )
      }

      if (wordCount > GUEST_WORD_LIMIT) {
        return NextResponse.json(
          { error: `Guest limit is ${GUEST_WORD_LIMIT} words. Sign up free for 1,000 words.` },
          { status: 403 }
        )
      }

      const stream = await humanizeText(text, Math.min(intensity, 7), 'standard')
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          'X-Guest': 'true',
        },
      })
    }

    // ── Authenticated path ────────────────────────────────────────────────────
    if (!checkRateLimit(user.id, 5000)) {
      return NextResponse.json({ error: 'Too many requests. Wait 5 seconds.' }, { status: 429 })
    }

    const serviceClient = await createServiceClient()
    const { data: profile } = await serviceClient
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    const { data: planLimits } = await serviceClient
      .from('plan_limits')
      .select('max_words_per_input, daily_humanizations')
      .eq('plan', profile?.plan ?? 'free')
      .single()

    const maxWords = planLimits?.max_words_per_input ?? 1000
    if (wordCount > maxWords) {
      return NextResponse.json(
        { error: `Text exceeds ${maxWords} word limit for your plan` },
        { status: 403 }
      )
    }

    const { allowed, remaining } = await checkAndIncrementUsage(user.id, 'humanization')
    if (!allowed) {
      return NextResponse.json(
        { error: 'Daily humanization limit reached. Upgrade your plan for more.' },
        { status: 403 }
      )
    }

    const safeIntensity = Math.min(10, Math.max(1, Number(intensity) || 7))
    const validModes = ['standard', 'academic', 'business', 'casual', 'creative']
    const safeMode = validModes.includes(mode) ? mode : 'standard'

    const { data: job } = await serviceClient
      .from('humanization_jobs')
      .insert({
        user_id: user.id,
        original_text: text,
        intensity_level: safeIntensity,
        mode: safeMode,
        word_count: wordCount,
        status: 'processing',
      })
      .select('id')
      .single()

    const stream = await humanizeText(text, safeIntensity, safeMode)
    const jobId = job?.id

    if (jobId) {
      const [streamForClient, streamForSave] = stream.tee()
      ;(async () => {
        try {
          const reader = streamForSave.getReader()
          const decoder = new TextDecoder()
          let fullText = ''
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const chunk = decoder.decode(value)
            for (const line of chunk.split('\n')) {
              if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                try {
                  const parsed = JSON.parse(line.slice(6))
                  if (parsed.text) fullText += parsed.text
                } catch {}
              }
            }
          }
          await serviceClient
            .from('humanization_jobs')
            .update({ humanized_text: fullText, status: 'completed' })
            .eq('id', jobId)
        } catch {}
      })()

      return new Response(streamForClient, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          'X-Remaining': String(remaining),
        },
      })
    }

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Humanize error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
