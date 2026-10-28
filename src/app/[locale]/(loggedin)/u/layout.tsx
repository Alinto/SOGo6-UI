import { ReactNode } from 'react'

export async function generateMetadata() {
  const { zoneMetadata } = await import('@/lib/i18n/zone-metadata')
  return zoneMetadata('mail.string')
}

export default function MailZoneLayout({ children }: { children: ReactNode }) {
  return children
}
