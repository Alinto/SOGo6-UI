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
  const t = useTranslations('Header')

  return (
    <>
      <div className="flex items-center justify-center gap-2">
        <Collapsible>
          <Toggle
            aria-label="Dark"
            size={'sm'}
            pressed={theme === 'dark'}
            onClick={() => setTheme('dark')}
            title={t('theme.dark.string')}
          >
            <Moon className="h-4 w-4" />
          </Toggle>
          <Toggle
            aria-label="Light"
            size={'sm'}
            pressed={theme === 'light'}
            onClick={() => setTheme('light')}
            title={t('theme.light.string')}
          >
            <Sun className="h-4 w-4" />
          </Toggle>
          <Toggle
            aria-label="System"
            size={'sm'}
            pressed={theme === 'system'}
            onClick={() => setTheme('system')}
            title={t('theme.auto.string')}
          >
            <ComputerIcon className="h-4 w-4" />
          </Toggle>
          <CollapsibleTrigger className="cursor-pointer">
            <ChevronDown className="text-muted-foreground pt-2" />
          </CollapsibleTrigger>
          <CollapsibleContent className="flex flex-col gap-2">
            <Toggle
              aria-label="Dyslexia"
              size={'sm'}
              pressed={theme === 'dyslexia'}
              onClick={() => setTheme('dyslexia')}
            >
              {t('theme.dyslexia.string')}
            </Toggle>
            <Toggle
              aria-label="Tritanopia"
              size={'sm'}
              pressed={theme === 'tritanopia'}
              onClick={() => setTheme('tritanopia')}
            >
              {t('theme.tritanopia.string')}
            </Toggle>
            <Toggle
              aria-label="Deuteranopia"
              size={'sm'}
              pressed={theme === 'deuteranopia'}
              onClick={() => setTheme('deuteranopia')}
            >
              {t('theme.deuteranopia.string')}
            </Toggle>
            <Toggle
              aria-label="Protanopia"
              size={'sm'}
              pressed={theme === 'protanopia'}
              onClick={() => setTheme('protanopia')}
            >
              {t('theme.protanopia.string')}
            </Toggle>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </>
  )
}
