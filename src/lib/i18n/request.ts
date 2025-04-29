import { routing } from '@/middleware'
import deepmerge from 'deepmerge'
import fs from 'fs'
import { getRequestConfig } from 'next-intl/server'
import path from 'path'

// Helper function to recursively get all files in a directory
const getAllFiles = (
  dirPath: string,
  arrayOfFiles: string[] = []
): string[] => {
  const files = fs.readdirSync(dirPath)

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file)
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles)
    } else {
      arrayOfFiles.push(fullPath)
    }
  })

  return arrayOfFiles
}

export const createDefaultMessages = async () => {
  const defaultDir = `src/messages/${routing.defaultLocale}`
  const defaultFileList = getAllFiles(defaultDir) // Recursively get all files
  const defaultMessages = {}

  for (const file of defaultFileList) {
    const relativePath = path.relative(defaultDir, file).replace(/\\/g, '/')
    const msgs = await import(
      `@/messages/${routing.defaultLocale}/${relativePath}`
    )
    const newMessages = {
      ...msgs.default,
    }
    Object.assign(defaultMessages, newMessages)
  }

  return defaultMessages
}

export const createMessages = async (locale: string) => {
  const localeDir = `src/messages/${locale}`
  const fileList = getAllFiles(localeDir) // Recursively get all files
  const messages = {}

  for (const file of fileList) {
    const relativePath = path.relative(localeDir, file).replace(/\\/g, '/')
    const msgs = await import(`@/messages/${locale}/${relativePath}`)
    const newMessages = {
      ...msgs.default,
    }
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
