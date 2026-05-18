import calendarsJson from '@/messages/en/calendars.json'

type MessageValues = Record<string, string | number | boolean | Date>

function getNestedString(obj: unknown, path: string[]): string | undefined {
  let cur: unknown = obj
  for (const p of path) {
    if (cur === null || typeof cur !== 'object' || !(p in (cur as object))) {
      return undefined
    }
    cur = (cur as Record<string, unknown>)[p]
  }
  return typeof cur === 'string' ? cur : undefined
}

/** Mimics `useTranslations('CALENDARS')` for Jest when NextIntlClientProvider does not resolve messages. */
export function calendarsMessagesT(
  key: string,
  values?: MessageValues
): string {
  const raw = getNestedString(calendarsJson.CALENDARS, key.split('.'))
  if (raw === undefined) return key
  if (!values) return raw
  return Object.entries(values).reduce(
    (acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)),
    raw
  )
}
