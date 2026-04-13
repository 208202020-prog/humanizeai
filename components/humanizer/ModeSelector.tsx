'use client'

interface ModeSelectorProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

const MODES = [
  { value: 'standard', label: 'Standard' },
  { value: 'academic', label: 'Academic' },
  { value: 'business', label: 'Business' },
  { value: 'casual', label: 'Casual / Blog' },
  { value: 'creative', label: 'Creative' },
]

export function ModeSelector({ value, onChange, disabled }: ModeSelectorProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">Rewrite Mode</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full h-9 px-3 py-1 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {MODES.map((mode) => (
          <option key={mode.value} value={mode.value}>
            {mode.label}
          </option>
        ))}
      </select>
    </div>
  )
}
