'use client'

import { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { DetectionScore } from '@/components/humanizer/DetectionScore'
import { countWords } from '@/lib/utils/word-count'
import { Sparkles, Scan, Copy, ChevronRight, Loader2, CheckCheck } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const GUEST_LIMIT = 200
const PLACEHOLDER = `Artificial intelligence has fundamentally transformed the landscape of modern technology, enabling unprecedented capabilities across numerous domains. It is worth noting that the proliferation of AI-generated content has led to significant challenges in maintaining authenticity and originality. Furthermore, educational institutions have implemented sophisticated detection systems to identify and penalize the use of AI writing tools. In conclusion, students and professionals must navigate these complex dynamics carefully to ensure their work remains compliant with institutional standards.`

export function LiveDemo() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [inputScore, setInputScore] = useState<number | null>(null)
  const [outputScore, setOutputScore] = useState<number | null>(null)
  const [isHumanizing, setIsHumanizing] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [intensity, setIntensity] = useState(7)
  const abortRef = useRef<AbortController | null>(null)

  const wordCount = countWords(inputText)
  const isOverLimit = wordCount > GUEST_LIMIT

  const handleDetect = useCallback(async (text: string, isInput = true) => {
    if (!text.trim()) return
    setIsDetecting(true)
    try {
      const res = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, deepScan: false }),
      })
      const data = await res.json()
      if (isInput) setInputScore(data.score)
      else setOutputScore(data.score)
    } catch {
      toast.error('Detection failed.')
    } finally {
      setIsDetecting(false)
    }
  }, [])

  const handleHumanize = useCallback(async () => {
    const text = inputText.trim()
    if (!text) { toast.error('Paste some text first.'); return }
    if (isOverLimit) { toast.error(`Guest limit is ${GUEST_LIMIT} words. Sign up for more.`); return }

    setIsHumanizing(true)
    setOutputText('')
    setOutputScore(null)
    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/humanize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, intensity, mode: 'standard' }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Humanization failed.')
        return
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              if (parsed.text) {
                accumulated += parsed.text
                setOutputText(accumulated)
              }
            } catch {}
          }
        }
      }

      if (accumulated) await handleDetect(accumulated, false)
    } catch (e: any) {
      if (e.name !== 'AbortError') toast.error('Humanization failed. Try again.')
    } finally {
      setIsHumanizing(false)
    }
  }, [inputText, intensity, isOverLimit, handleDetect])

  const handleCopy = () => {
    if (!outputText) return
    navigator.clipboard.writeText(outputText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied!')
  }

  const loadSample = () => {
    setInputText(PLACEHOLDER)
    setInputScore(null)
    setOutputText('')
    setOutputScore(null)
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Intensity slider */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Intensity:</span>
          <div className="flex gap-1">
            {[3, 5, 7, 10].map((v) => (
              <button
                key={v}
                onClick={() => setIntensity(v)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                  intensity === v
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                {v === 3 ? 'Light' : v === 5 ? 'Medium' : v === 7 ? 'Heavy' : 'Max'}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={loadSample}
          className="text-xs text-primary hover:underline"
        >
          Load sample AI text →
        </button>
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Input */}
        <div className="flex flex-col rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI-Generated Text</span>
            <DetectionScore score={inputScore} size="sm" />
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your AI-generated text here to humanize it..."
            className="flex-1 min-h-[260px] p-4 bg-transparent text-sm resize-none outline-none font-mono leading-relaxed"
          />
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/20">
            <span className={cn('text-xs', isOverLimit ? 'text-red-400 font-medium' : 'text-muted-foreground')}>
              {wordCount} / {GUEST_LIMIT} words {isOverLimit && '— Sign up for 1,000+'}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDetect(inputText, true)}
                disabled={!inputText || isDetecting || isHumanizing}
                className="h-7 text-xs"
              >
                {isDetecting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Scan className="h-3 w-3 mr-1" />}
                Check AI
              </Button>
              <Button
                size="sm"
                onClick={handleHumanize}
                disabled={!inputText || isHumanizing || isOverLimit}
                className="h-7 text-xs bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
              >
                {isHumanizing
                  ? <><Loader2 className="h-3 w-3 animate-spin mr-1" />Humanizing...</>
                  : <><Sparkles className="h-3 w-3 mr-1" />Humanize</>}
              </Button>
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="flex flex-col rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Humanized Output</span>
            <DetectionScore score={outputScore} size="sm" />
          </div>
          <div className="flex-1 min-h-[260px] p-4 overflow-auto">
            {isHumanizing ? (
              <p className="text-sm font-mono leading-relaxed text-foreground whitespace-pre-wrap">
                {outputText}
                <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5 align-middle" />
              </p>
            ) : outputText ? (
              <p className="text-sm font-mono leading-relaxed text-foreground whitespace-pre-wrap">{outputText}</p>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
                <Sparkles className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Humanized text will appear here</p>
                <p className="text-xs text-muted-foreground/60">No account needed for {GUEST_LIMIT} words</p>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/20">
            <span className="text-xs text-muted-foreground">
              {outputText ? `${countWords(outputText)} words` : ''}
            </span>
            <div className="flex gap-2">
              {outputText && (
                <Button variant="outline" size="sm" onClick={handleCopy} className="h-7 text-xs">
                  {copied ? <CheckCheck className="h-3 w-3 mr-1 text-green-500" /> : <Copy className="h-3 w-3 mr-1" />}
                  Copy
                </Button>
              )}
              <Button size="sm" asChild className="h-7 text-xs">
                <Link href="/sign-up">
                  More words — Sign up free <ChevronRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Guest nudge */}
      <p className="text-center text-xs text-muted-foreground mt-3">
        Free demo · {GUEST_LIMIT} word limit · No account needed.{' '}
        <Link href="/sign-up" className="text-primary hover:underline">
          Sign up free
        </Link>{' '}
        for 1,000 words/day + history.
      </p>
    </div>
  )
}
