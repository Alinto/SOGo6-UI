import { useFormatter, useTranslations } from 'next-intl'
import { useCallback } from 'react'

const KILOBYTE = 1024
const MEGABYTE = 1024 * 1024

/**
 * Formats a size in bytes with units in the user's language
 * (e.g. "500 o" / "82,2 ko" in French, "500 B" / "82.2 kB" in English).
 */
export function useFormatSize() {
  const format = useFormatter()
  const t = useTranslations('MAILS_COMMONS')

  return useCallback(
    (size: number) => {
      // Intl has no short "B" symbol for bytes in English ("500 byte").
      if (size < KILOBYTE) {
        return t('mail_display.content.size_bytes.string', {
          size: format.number(size),
        })
      }

      const isMegabytes = size >= MEGABYTE
      return format.number(isMegabytes ? size / MEGABYTE : size / KILOBYTE, {
        style: 'unit',
        unit: isMegabytes ? 'megabyte' : 'kilobyte',
        unitDisplay: 'short',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })
    },
    [format, t]
  )
}
