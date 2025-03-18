'use client'

import { ComputerIcon, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { useTranslations } from 'next-intl'
import { Toggle } from './ui/toggle'

export function ThemeSwitcher() {
  const { setTheme, theme } = useTheme()
  const t = useTranslations('Header')

  return (
    <>
      <Toggle
        aria-label="Dark"
        size={'sm'}
        pressed={theme === 'dark'}
        onClick={() => setTheme('dark')}
      >
        <Moon />
        {t('theme.dark.string')}
      </Toggle>
      <Toggle
        aria-label="Light"
        size={'sm'}
        pressed={theme === 'light'}
        onClick={() => setTheme('light')}
      >
        <Sun />
        {t('theme.light.string')}
      </Toggle>
      <Toggle
        aria-label="System"
        size={'sm'}
        pressed={theme === 'system'}
        onClick={() => setTheme('system')}
      >
        <ComputerIcon />
        {t('theme.auto.string')}
      </Toggle>
    </>
  )
}
