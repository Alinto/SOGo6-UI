import { cn } from '@/lib/utils'
import React from 'react'

interface FixedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
}

const FixedButton: React.FC<FixedButtonProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <button
      className={cn(
        `bg-primary text-background hover:text-primary fixed right-12 bottom-20 rounded-full p-3 shadow-lg hover:bg-transparent`,
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export default FixedButton
