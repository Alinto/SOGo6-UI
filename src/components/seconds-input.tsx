import { Input } from '@/components/ui/input'

interface SecondsInputProps {
  value: number
  onChange: (value: number) => void
}

export function SecondsInput({ value, onChange }: SecondsInputProps) {
  return (
    <Input
      type="number"
      min={0}
      max={500}
      step={1}
      value={value}
      onChange={(e) => {
        const v = Number(e.target.value)
        if (v >= 0 && v <= 500) {
          onChange(v)
        }
      }}
      placeholder="Seconds (0–500)"
      className="w-24"
    />
  )
}
