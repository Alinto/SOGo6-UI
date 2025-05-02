import React from 'react'
import { Skeleton } from '../skeleton'

const InputSkeleton: React.FC = () => {
  return (
    <Skeleton className="flex h-9 w-full rounded-md border border-input px-3 py-1 shadow-xs" />
  )
}

export default InputSkeleton
