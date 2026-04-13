'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface DetectionScoreProps {
  score: number | null
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

export function DetectionScore({ score, label, size = 'md' }: DetectionScoreProps) {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    if (score === null) return
    const duration = 1000
    const steps = 60
    const increment = score / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= score) {
        setAnimatedScore(score)
        clearInterval(timer)
      } else {
        setAnimatedScore(Math.round(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [score])

  // Human score = 100 - AI score
  const humanScore = score !== null ? 100 - animatedScore : null

  const getColor = (humanPct: number) => {
    if (humanPct >= 71) return { stroke: '#22c55e', text: 'text-green-500', bg: 'bg-green-500/10' }
    if (humanPct >= 41) return { stroke: '#f59e0b', text: 'text-yellow-500', bg: 'bg-yellow-500/10' }
    return { stroke: '#ef4444', text: 'text-red-500', bg: 'bg-red-500/10' }
  }

  const getStatusLabel = (humanPct: number) => {
    if (humanPct >= 71) return 'Passes Detection'
    if (humanPct >= 41) return 'Borderline'
    return 'AI Detected'
  }

  const sizeConfig = {
    sm: { svg: 80, cx: 40, cy: 40, r: 32, strokeW: 6, fontSize: 'text-lg', labelSize: 'text-xs' },
    md: { svg: 120, cx: 60, cy: 60, r: 48, strokeW: 8, fontSize: 'text-2xl', labelSize: 'text-xs' },
    lg: { svg: 160, cx: 80, cy: 80, r: 64, strokeW: 10, fontSize: 'text-3xl', labelSize: 'text-sm' },
  }

  const cfg = sizeConfig[size]
  const circumference = 2 * Math.PI * cfg.r
  const displayScore = humanScore !== null ? humanScore : 0
  const offset = circumference - (displayScore / 100) * circumference
  const colors = getColor(displayScore)

  if (score === null) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div
          style={{ width: cfg.svg, height: cfg.svg }}
          className="rounded-full border-4 border-dashed border-muted flex items-center justify-center"
        >
          <span className="text-muted-foreground text-xs text-center px-2">Scan to check</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg width={cfg.svg} height={cfg.svg} className="-rotate-90">
          <circle
            cx={cfg.cx} cy={cfg.cy} r={cfg.r}
            fill="none" stroke="currentColor"
            strokeWidth={cfg.strokeW}
            className="text-muted/30"
          />
          <circle
            cx={cfg.cx} cy={cfg.cy} r={cfg.r}
            fill="none" stroke={colors.stroke}
            strokeWidth={cfg.strokeW}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className={cn('font-bold', cfg.fontSize, colors.text)}>
            {displayScore}%
          </span>
          <span className="text-[10px] text-muted-foreground">Human</span>
        </div>
      </div>
      <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', colors.bg, colors.text)}>
        {label || getStatusLabel(displayScore)}
      </span>
    </div>
  )
}
