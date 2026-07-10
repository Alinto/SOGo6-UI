// import localFont from "next/font/local";
import { ThemesClient } from '@/features/themes/themes-client'
// import { getThemesServer } from '@/features/themes/themes-server'
import { EnvGate } from '@/components/env-gate'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import React from 'react'

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages()

  // Fetch themes on the server side
  // const themes = await getThemesServer()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemesClient themes={null} />
      <EnvGate>{children}</EnvGate>
    </NextIntlClientProvider>
  )
}
