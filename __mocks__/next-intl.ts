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
