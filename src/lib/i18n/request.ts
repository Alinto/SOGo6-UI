import { transformJson } from '@/lib/i18n/utils'
import { routing } from '@/middleware'
import deepmerge from 'deepmerge'
import fs from 'fs'
import { getRequestConfig } from 'next-intl/server'

export const createDefaultMessages = async () => {
  const defaultFileList = fs.readdirSync(
    `src/messages/${routing.defaultLocale}`
  )
  const defaultMessages = {}
  for (const file of defaultFileList) {
    const msgs = await import(`@/messages/${routing.defaultLocale}/${file}`)
    const newMessages = transformJson({
      ...msgs.default,
    })
    Object.assign(defaultMessages, newMessages)
  }
  return defaultMessages
}

export const createMessages = async (locale: string) => {
  const fileList = fs.readdirSync(`src/messages/${locale}`)
  const messages = {}
  for (const file of fileList) {
    const msgs = await import(`@/messages/${locale}/${file}`)
    const newMessages = transformJson({
      ...msgs.default,
    })
    Object.assign(messages, newMessages)
  }
  return messages
}

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale
  }

  const defaultMessages = await createDefaultMessages()
  const messages = await createMessages(locale)

  return {
    locale,
    messages: deepmerge(defaultMessages, messages),
  }
})
