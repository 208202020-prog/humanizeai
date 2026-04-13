import { createClient } from '@/lib/supabase/server'
import { detectAI } from '@/lib/anthropic/detect'
import { countWords } from '@/lib/utils/word-count'
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, deepScan = false } = body

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // For unauthenticated users, limit to 500 words
    const wordCount = countWords(text)
    if (!user && wordCount > 500) {
      return NextResponse.json(
        { error: 'Sign in to scan longer texts' },
        { status: 403 }
      )
    }

    const result = await detectAI(text, deepScan)

    return NextResponse.json({
      score: result.score,
      label: result.label,
      passesDetection: result.passesDetection,
      sentences: result.sentences,
    })
  } catch (error) {
    console.error('Detect error:', error)
    return NextResponse.json({ error: 'Detection failed' }, { status: 500 })
  }
}
