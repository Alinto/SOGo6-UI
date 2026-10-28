import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

type ZoneTitleKey =
  | 'mail.string'
  | 'address_book.string'
  | 'calendar.string'
  | 'tasks.string'
  | 'notes.string'
  | 'sign_in.string'
  | 'settings.string'
  | 'admin.string'

export async function zoneMetadata(key: ZoneTitleKey): Promise<Metadata> {
  const t = await getTranslations('NAVIGATION')
  return { title: t(key) }
}
