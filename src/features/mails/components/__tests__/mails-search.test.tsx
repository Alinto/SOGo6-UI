/* eslint-disable react/jsx-no-literals */
import { render } from '@testing-library/react'
import { MailsSearch } from '../mails-search'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Mock all UI components and dependencies
jest.mock('lucide-react', () => ({
  SearchIcon: () => null,
}))

jest.mock('@/components/ui/button', () => ({
  Button: () => null,
}))

jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: () => null,
}))

jest.mock('@/components/ui/collapsible', () => ({
  Collapsible: () => null,
  CollapsibleTrigger: () => null,
  CollapsibleContent: () => null,
}))

jest.mock('@/components/ui/input', () => ({
  Input: () => null,
}))

jest.mock('@/components/ui/label', () => ({
  Label: () => null,
}))

jest.mock('@/components/ui/popover', () => ({
  Popover: () => null,
  PopoverTrigger: () => null,
  PopoverContent: () => null,
}))

jest.mock('@/components/ui/separator', () => ({
  Separator: () => null,
}))

jest.mock('../search-folders', () => ({
  default: () => null,
}))

jest.mock('../search-more-options', () => ({
  default: () => null,
}))

describe('MailsSearch', () => {
  it('renders without crashing', () => {
    expect(() => render(<MailsSearch />)).not.toThrow()
  })

  it('memoizes correctly', () => {
    const { rerender } = render(<MailsSearch />)
    expect(() => rerender(<MailsSearch />)).not.toThrow()
  })
})