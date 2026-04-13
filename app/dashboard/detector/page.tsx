'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { DetectionScore } from '@/components/humanizer/DetectionScore'
import { DeepScanHighlighter } from '@/components/humanizer/DeepScanHighlighter'
import { countWords } from '@/lib/utils/word-count'
import { Scan, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function DetectorPage() {
  const [text, setText] = useState('')
  const [score, setScore] = useState<number | null>(null)
  const [sentences, setSentences] = useState<any[] | null>(null)
  const [isScanning, setIsScanning] = useState(false)

  const wordCount = countWords(text)

  const handleScan = async (deepScan = false) => {
    if (!text.trim()) return
    setIsScanning(true)
    try {
      const res = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, deepScan }),
      })
      const data = await res.json()
      setScore(data.score)
      if (deepScan && data.sentences) {
        setSentences(data.sentences)
      }
    } catch {
      toast.error('Scan failed. Please try again.')
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">AI Detector</h1>
        <p className="text-sm text-muted-foreground">Check if text was written by AI or a human</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste text here to check for AI..."
            className="min-h-[400px] resize-none font-mono text-sm"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{wordCount.toLocaleString()} words</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleScan(false)} disabled={!text || isScanning}>
                {isScanning ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Scan className="h-3 w-3 mr-1" />}
                Quick Scan
              </Button>
              <Button size="sm" onClick={() => handleScan(true)} disabled={!text || isScanning}>
                {isScanning ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Scan className="h-3 w-3 mr-1" />}
                Deep Scan
              </Button>
            </div>
          </div>

          {sentences && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-3">Sentence Analysis</h3>
              <DeepScanHighlighter sentences={sentences} />
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-6 p-6 rounded-xl border border-border bg-card">
          <h3 className="text-sm font-semibold">AI Detection Score</h3>
          <DetectionScore score={score} size="lg" />

          {score !== null && (
            <div className="w-full space-y-3">
              <div className="text-xs text-muted-foreground space-y-2">
                <div className="flex justify-between">
                  <span>Human probability</span>
                  <span className="font-medium text-foreground">{100 - score}%</span>
                </div>
                <div className="flex justify-between">
                  <span>AI probability</span>
                  <span className="font-medium text-foreground">{score}%</span>
                </div>
              </div>
              <div className="text-xs text-center text-muted-foreground pt-2 border-t border-border">
                {score < 30 ? '✅ Likely passes detection' :
                 score < 70 ? '⚠️ May trigger detection' :
                 '❌ Will likely be flagged'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
