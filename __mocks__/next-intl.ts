import React from 'react'

export const useTranslations = () => {
  return (key: string) => key
}

export const useLocale = () => 'en'

export const useMessages = () => ({})

export const useNow = () => new Date()

export const useTimeZone = () => 'UTC'

export const useFormatter = () => ({
  dateTime: (date: Date) => date.toISOString(),
  number: (num: number) => num.toString(),
  list: (items: string[]) => items.join(', '),
})

export const NextIntlClientProvider = ({
  children,
}: {
  children: React.ReactNode
}) => children

export const IntlProvider = ({ children }: { children: React.ReactNode }) =>
  children

// Navigation module exports
export const usePathname = () => '/'
export const useRouter = () => ({
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
})
export const useSearchParams = () => new URLSearchParams()
export const useParams = () => ({})
export const Link = (props: any) =>
  React.createElement('a', { href: props.href }, props.children)

// createNavigation export
export const createNavigation = (routing: any) => ({
  Link: Link,
  redirect: jest.fn(),
  usePathname: usePathname,
  useRouter: useRouter,
  getPathname: (name: string) => name,
  useLocale: useLocale,
})
