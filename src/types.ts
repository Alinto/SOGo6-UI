import { type LucideIcon } from 'lucide-react'

export interface NavItems {
  title: string
  url?: string
  icon?: LucideIcon
  isActive?: boolean
  items?: NavItems[]
}
