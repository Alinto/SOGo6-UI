'use client'

import { ChevronDown, ComputerIcon, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { useTranslations } from 'next-intl'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible'
import { Toggle } from './ui/toggle'

export function ThemeSwitcher() {
  const { setTheme, theme } = useTheme()
  const t = useTranslations('HEADER')

  return (
    <>
      <div className="flex items-center justify-center gap-2">
        <Collapsible>
          <Toggle
            aria-label={t('theme.dark.string')}
            size={'sm'}
            pressed={theme === 'dark'}
            onClick={() => setTheme('dark')}
            title={t('theme.dark.string')}
          >
            <Moon className="h-4 w-4" />
          </Toggle>
          <Toggle
            aria-label={t('theme.light.string')}
            size={'sm'}
            pressed={theme === 'light'}
            onClick={() => setTheme('light')}
            title={t('theme.light.string')}
          >
            <Sun className="h-4 w-4" />
          </Toggle>
          <Toggle
            aria-label={t('theme.system.string')}
            size={'sm'}
            pressed={theme === 'system'}
            onClick={() => setTheme('system')}
            title={t('theme.system.string')}
          >
            <ComputerIcon className="h-4 w-4" />
          </Toggle>
          <CollapsibleTrigger className="cursor-pointer">
            <ChevronDown className="text-muted-foreground pt-2" />
          </CollapsibleTrigger>
          <CollapsibleContent className="flex flex-col gap-2">
            <Toggle
              aria-label={t('theme.dyslexia.string')}
              size={'sm'}
              pressed={theme === 'dyslexia'}
              onClick={() => setTheme('dyslexia')}
              title={t('theme.dyslexia.string')}
            >
              {t('theme.dyslexia.string')}
            </Toggle>
            <Toggle
              aria-label={t('theme.tritanopia.string')}
              size={'sm'}
              pressed={theme === 'tritanopia'}
              onClick={() => setTheme('tritanopia')}
              title={t('theme.tritanopia.string')}
            >
              {t('theme.tritanopia.string')}
            </Toggle>
            <Toggle
              aria-label={t('theme.deuteranopia.string')}
              size={'sm'}
              pressed={theme === 'deuteranopia'}
              onClick={() => setTheme('deuteranopia')}
              title={t('theme.deuteranopia.string')}
            >
              {t('theme.deuteranopia.string')}
            </Toggle>
            <Toggle
              aria-label={t('theme.protanopia.string')}
              size={'sm'}
              pressed={theme === 'protanopia'}
              onClick={() => setTheme('protanopia')}
              title={t('theme.protanopia.string')}
            >
              {t('theme.protanopia.string')}
            </Toggle>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </>
  )
}
