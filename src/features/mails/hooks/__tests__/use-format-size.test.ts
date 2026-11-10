import { renderHook } from '@testing-library/react'
import { useFormatSize } from '../use-format-size'

let mockLocale = 'fr'

jest.mock('next-intl', () => ({
  // Mirrors the "size_bytes" translations ("{size} o" / "{size} B").
  useTranslations: () => (_key: string, values: { size: string }) =>
    `${values.size} ${mockLocale === 'fr' ? 'o' : 'B'}`,
  useFormatter: () => ({
    number: (value: number, options: Intl.NumberFormatOptions) =>
      new Intl.NumberFormat(mockLocale, options).format(value),
  }),
}))

// Intl uses non-breaking spaces between the number and the unit.
const normalize = (value: string) => value.replace(/\s/g, ' ')

function formatWith(locale: string, size: number) {
  mockLocale = locale
  const { result } = renderHook(() => useFormatSize())
  return normalize(result.current(size))
}

describe('useFormatSize', () => {
  it('formats sizes with French units', () => {
    expect(formatWith('fr', 500)).toBe('500 o')
    expect(formatWith('fr', 2048)).toBe('2,0 ko')
    expect(formatWith('fr', 2 * 1024 * 1024)).toBe('2,0 Mo')
  })

  it('formats sizes with English units', () => {
    expect(formatWith('en', 500)).toBe('500 B')
    expect(formatWith('en', 2048)).toBe('2.0 kB')
    expect(formatWith('en', 2 * 1024 * 1024)).toBe('2.0 MB')
  })
})
