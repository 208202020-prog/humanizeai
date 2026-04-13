'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Sentence {
  text: string
  score: number
  label: string
}

interface DeepScanHighlighterProps {
  sentences: Sentence[]
  onApply?: (originalText: string, newText: string) => void
}

export function DeepScanHighlighter({ sentences, onApply }: DeepScanHighlighterProps) {
  const [selected, setSelected] = useState<number | null>(null)

  const getSentenceStyle = (label: string) => {
    if (label === 'Human') return 'bg-green-500/20 text-green-100 border-b-2 border-green-500 cursor-pointer hover:bg-green-500/30'
    if (label === 'Borderline') return 'bg-yellow-500/20 text-yellow-100 border-b-2 border-yellow-500 cursor-pointer hover:bg-yellow-500/30'
    return 'bg-red-500/20 text-red-100 border-b-2 border-red-500 cursor-pointer hover:bg-red-500/30'
  }

  const getScoreBadgeStyle = (label: string) => {
    if (label === 'Human') return 'bg-green-500/20 text-green-400'
    if (label === 'Borderline') return 'bg-yellow-500/20 text-yellow-400'
    return 'bg-red-500/20 text-red-400'
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Human</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span>Borderline</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>AI Detected</span>
        </div>
      </div>

      <div className="text-sm leading-7 rounded-md border border-border p-4 bg-muted/20">
        {sentences.map((sentence, index) => (
          <span key={index}>
            <span
              className={cn('px-0.5 rounded transition-all', getSentenceStyle(sentence.label))}
              onClick={() => setSelected(selected === index ? null : index)}
            >
              {sentence.text}
            </span>
            {selected === index && (
              <span className={cn('inline-block mx-1 text-[10px] px-1.5 py-0.5 rounded font-medium', getScoreBadgeStyle(sentence.label))}>
                {sentence.label} ({sentence.score}% AI)
              </span>
            )}
            {' '}
          </span>
        ))}
      </div>
    </div>
  )
}
