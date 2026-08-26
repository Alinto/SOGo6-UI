import { getDefaultLocale } from '@/lib/i18n/config'

export const PWA_INBOX_PATH = '/u/0/INBOX'

export function pwaStartUrl(locale = getDefaultLocale()) {
  return `/${locale}${PWA_INBOX_PATH}`
}
