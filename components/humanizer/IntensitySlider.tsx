'use client'

import * as SliderPrimitive from '@radix-ui/react-slider'
import { cn } from '@/lib/utils'

interface IntensitySliderProps {
  value: number
  onChange: (value: number) => void
}

const INTENSITY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Light', color: 'text-blue-400' },
  2: { label: 'Light', color: 'text-blue-400' },
  3: { label: 'Light', color: 'text-blue-400' },
  4: { label: 'Medium', color: 'text-yellow-400' },
  5: { label: 'Medium', color: 'text-yellow-400' },
  6: { label: 'Medium', color: 'text-yellow-400' },
  7: { label: 'Heavy', color: 'text-orange-400' },
  8: { label: 'Heavy', color: 'text-orange-400' },
  9: { label: 'Heavy', color: 'text-orange-400' },
  10: { label: 'Maximum Stealth', color: 'text-red-400' },
}

export function IntensitySlider({ value, onChange }: IntensitySliderProps) {
  const info = INTENSITY_LABELS[value]

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Intensity Level</label>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">{value}/10</span>
          <span className={cn('text-xs font-medium', info.color)}>{info.label}</span>
        </div>
      </div>
      <SliderPrimitive.Root
        className="relative flex w-full touch-none select-none items-center"
        value={[value]}
        min={1}
        max={10}
        step={1}
        onValueChange={([v]) => onChange(v)}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-muted">
          <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer" />
      </SliderPrimitive.Root>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>Light</span>
        <span>Medium</span>
        <span>Heavy</span>
        <span>Max</span>
      </div>
    </div>
  )
}
