import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** × dismiss control on removable tags/chips (categories, emails, attendees, etc.) */
export function tagDismissButtonClassName(className?: string) {
  return cn(
    'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full',
    'text-muted-foreground hover:bg-muted hover:text-foreground',
    'focus-visible:ring-ring focus-visible:ring-1 focus:outline-none transition-colors',
    className
  )
}
