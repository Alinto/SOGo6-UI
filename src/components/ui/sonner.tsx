'use client'

import { useTheme } from 'next-themes'
import React from 'react'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const LIGHT_THEMES = new Set([
  'light',
  'dyslexia',
  'tritanopia',
  'deuteranopia',
  'protanopia',
])

function toSonnerTheme(theme: string | undefined): ToasterProps['theme'] {
  if (!theme || theme === 'system') return 'system'
  if (theme === 'dark') return 'dark'
  if (LIGHT_THEMES.has(theme)) return 'light'
  return 'system'
}

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={toSonnerTheme(theme)}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
