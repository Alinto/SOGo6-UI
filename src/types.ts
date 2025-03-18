import { ResultTypeFrom } from '@reduxjs/toolkit/query'
import { type LucideIcon } from 'lucide-react'

export interface NavItems {
  title: string
  url?: string
  icon?: LucideIcon
  isActive?: boolean
  items?: NavItems[]
}

export interface BuilderSlice {
  query: <T, Q>(options: {
    query: (arg: Q) => string
  }) => ResultTypeFrom<{ query: (arg: Q) => string }>
  mutation: <T, Q>(options: {
    query: (arg: Q) => { url: string; method: string; body?: any }
  }) => ResultTypeFrom<{
    query: (arg: Q) => { url: string; method: string; body?: any }
  }>
}
