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
  query: <Q>(_options: {
    query: (_arg: Q) => string
  }) => ResultTypeFrom<{ query: (_arg: Q) => string }>
  mutation: <Q>(_options: {
    query: (_arg: Q) => { url: string; method: string; body?: object }
  }) => ResultTypeFrom<{
    query: (_arg: Q) => { url: string; method: string; body?: object }
  }>
}
