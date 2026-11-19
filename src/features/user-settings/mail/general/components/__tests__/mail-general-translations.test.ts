import en from '@/messages/en/user-settings/mail/general.json'
import fr from '@/messages/fr/user-settings/mail/general.json'
import { readFileSync } from 'fs'
import path from 'path'

type Messages = Record<string, unknown>

function resolve(messages: Messages, key: string): unknown {
  return key
    .split('.')
    .reduce<unknown>(
      (node, part) => (node as Messages | undefined)?.[part],
      messages
    )
}

describe('mail general settings translations', () => {
  it('has an English string for every key the form uses', () => {
    const source = readFileSync(
      path.join(__dirname, '..', 'mail-general-form-core.tsx'),
      'utf8'
    )
    const keys = Array.from(source.matchAll(/\bt\('([^']+)'\)/g), (m) => m[1])
    expect(keys.length).toBeGreaterThan(0)

    const missing = keys.filter(
      (key) => typeof resolve(en.US_MAIL_GENERAL, key) !== 'string'
    )
    expect(missing).toEqual([])
  })

  it.each(['immediately_on_display', 'after_displaying_for_seconds'])(
    'translates the "%s" option in English and French',
    (key) => {
      expect(resolve(en.US_MAIL_GENERAL, `${key}.string`)).toEqual(
        expect.any(String)
      )
      expect(resolve(fr.US_MAIL_GENERAL, `${key}.string`)).toEqual(
        expect.any(String)
      )
    }
  )
})
