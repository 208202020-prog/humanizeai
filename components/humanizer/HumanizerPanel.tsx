'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { IntensitySlider } from './IntensitySlider'
import { ModeSelector } from './ModeSelector'
import { DetectionScore } from './DetectionScore'
import { DeepScanHighlighter } from './DeepScanHighlighter'
import { countWords } from '@/lib/utils/word-count'
import { Sparkles, Scan, Copy, RefreshCw, GitCompare, Loader2, CheckCheck } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface HumanizerPanelProps {
  maxWords?: number
  isPaidUser?: boolean
}

export function HumanizerPanel({ maxWords = 1000, isPaidUser = false }: HumanizerPanelProps) {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [intensity, setIntensity] = useState(7)
  const [mode, setMode] = useState('standard')
  const [isHumanizing, setIsHumanizing] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)
  const [inputScore, setInputScore] = useState<number | null>(null)
  const [outputScore, setOutputScore] = useState<number | null>(null)
  const [deepScanData, setDeepScanData] = useState<any[] | null>(null)
  const [copied, setCopied] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const wordCount = countWords(inputText)
  const outputWordCount = countWords(outputText)
  const isOverLimit = wordCount > maxWords

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
      if (isInput) {
        setInputScore(data.score)
      } else {
        setOutputScore(data.score)
      }
    } catch {
      toast.error('Detection failed. Please try again.')
    } finally {
      setIsDetecting(false)
    }
  }, [])

  const handleDeepScan = useCallback(async () => {
    const text = outputText || inputText
    if (!text.trim()) return
    setIsDetecting(true)
    try {
      const res = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, deepScan: true }),
      })
      const data = await res.json()
      setDeepScanData(data.sentences || [])
      if (outputText) setOutputScore(data.score)
      else setInputScore(data.score)
    } catch {
      toast.error('Deep scan failed.')
    } finally {
      setIsDetecting(false)
    }
  }, [inputText, outputText])

  const handleHumanize = useCallback(async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text first.')
      return
    }
    if (isOverLimit) {
      toast.error(`Text exceeds ${maxWords} word limit for your plan.`)
      return
    }

    setIsHumanizing(true)
    setOutputText('')
    setOutputScore(null)
    setDeepScanData(null)

    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/humanize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, intensity, mode }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const error = await res.json()
        toast.error(error.error || 'Humanization failed.')
        return
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
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

      // Auto-detect output after humanization
      if (accumulated) {
        await handleDetect(accumulated, false)
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        toast.error('Humanization failed. Please try again.')
      }
    } finally {
      setIsHumanizing(false)
    }
  }, [inputText, intensity, mode, isOverLimit, maxWords, handleDetect])

  const handleCopy = () => {
    if (!outputText) return
    navigator.clipboard.writeText(outputText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied to clipboard!')
  }

  const handleRehumanize = () => {
    if (outputText) {
      setInputText(outputText)
      setOutputText('')
      setInputScore(outputScore)
      setOutputScore(null)
    }
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-xl border border-border">
        <IntensitySlider value={intensity} onChange={setIntensity} />
        <ModeSelector value={mode} onChange={setMode} disabled={!isPaidUser && mode !== 'standard'} />
      </div>

      {/* Main panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* Input Panel */}
        <div className="flex flex-col gap-3 p-4 bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">AI-Generated Text</h3>
            <div className="flex items-center gap-2">
              <DetectionScore score={inputScore} size="sm" />
            </div>
          </div>

          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your AI-generated text here..."
            className="flex-1 min-h-[300px] resize-none bg-background font-mono text-sm"
          />

          <div className="flex items-center justify-between">
            <span className={cn('text-xs', isOverLimit ? 'text-red-500 font-medium' : 'text-muted-foreground')}>
              {wordCount.toLocaleString()} / {maxWords.toLocaleString()} words
              {isOverLimit && ' — Exceeds limit'}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDetect(inputText, true)}
                disabled={!inputText || isDetecting}
              >
                {isDetecting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Scan className="h-3 w-3 mr-1" />}
                Check AI
              </Button>
              <Button
                size="sm"
                onClick={handleHumanize}
                disabled={isHumanizing || !inputText || isOverLimit}
                className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
              >
                {isHumanizing ? (
                  <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Humanizing...</>
                ) : (
                  <><Sparkles className="h-3 w-3 mr-1" /> Humanize</>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="flex flex-col gap-3 p-4 bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Humanized Output</h3>
            <div className="flex items-center gap-2">
              <DetectionScore score={outputScore} size="sm" />
            </div>
          </div>

          <Tabs defaultValue="output" className="flex-1 flex flex-col">
            <TabsList className="w-full grid grid-cols-2 h-8">
              <TabsTrigger value="output" className="text-xs">Output</TabsTrigger>
              <TabsTrigger value="deepscan" className="text-xs" disabled={!deepScanData}>
                Deep Scan {deepScanData && `(${deepScanData.length})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="output" className="flex-1 mt-2">
              {isHumanizing ? (
                <div className="min-h-[300px] p-3 rounded-md border border-input bg-background font-mono text-sm whitespace-pre-wrap leading-relaxed">
                  {outputText}
                  <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5" />
                </div>
              ) : (
                <Textarea
                  value={outputText}
                  readOnly
                  placeholder="Humanized text will appear here..."
                  className="min-h-[300px] resize-none bg-background font-mono text-sm"
                />
              )}
            </TabsContent>

            <TabsContent value="deepscan" className="flex-1 mt-2 overflow-auto">
              {deepScanData && <DeepScanHighlighter sentences={deepScanData} />}
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {outputWordCount > 0 && `${outputWordCount.toLocaleString()} words`}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDeepScan} disabled={(!inputText && !outputText) || isDetecting}>
                {isDetecting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Scan className="h-3 w-3 mr-1" />}
                Deep Scan
              </Button>
              <Button variant="outline" size="sm" onClick={handleRehumanize} disabled={!outputText}>
                <RefreshCw className="h-3 w-3 mr-1" />
                Re-humanize
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopy} disabled={!outputText}>
                {copied ? <CheckCheck className="h-3 w-3 mr-1 text-green-500" /> : <Copy className="h-3 w-3 mr-1" />}
                Copy
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
