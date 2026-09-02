import { cn } from '@/lib/utils'
import React from 'react'
import { Skeleton } from '../skeleton'

interface ButtonSkeletonProps {
  className?: string
  size: 'sm' | 'default' | 'lg' | 'icon'
}

const ButtonSkeleton: React.FC<ButtonSkeletonProps> = ({
  size = 'default',
  className,
}) => {
  return (
    <Skeleton
      className={cn(
        'inline-flex gap-2 rounded-md',
        {
          'h-9 w-20 px-4 py-2': size === 'default',
          'h-9 rounded-md px-3': size === 'sm',
          'h-11 rounded-md px-8': size === 'lg',
          'h-9 w-9': size === 'icon',
        },
        className
      )}
    />
  )
}

const FixedButtonGroupSkeleton: React.FC = () => {
  return (
    <div className="fixed right-12 bottom-20 flex justify-end gap-4 pt-6">
      <ButtonSkeleton
        size="icon"
        className="h-14 w-14 rounded-full shadow-lg"
      />
      <ButtonSkeleton
        size="icon"
        className="h-14 w-14 rounded-full shadow-lg"
      />
    </div>
  )
}

export { ButtonSkeleton, FixedButtonGroupSkeleton }
