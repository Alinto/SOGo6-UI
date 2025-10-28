export interface Timezone {
  value: string
  label: string
  offset: string
}

export interface TimezoneSelectProps {
  value?: string
  onValueChange?: (_value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}
