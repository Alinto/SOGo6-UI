import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import React from 'react'

// Mock next-intl
jest.mock('next-intl', () => ({
  NextIntlClientProvider: ({
    children,
    locale,
    messages,
  }: {
    children: React.ReactNode
    locale: string
    messages: Record<string, unknown>
  }) => (
    <div data-testid="next-intl-provider" data-locale={locale}>
      {children}
    </div>
  ),
}))

jest.mock('next-intl/server', () => ({
  getMessages: jest.fn().mockResolvedValue({
    common: { test: 'Test message' },
  }),
}))

// Mock ThemesClient
jest.mock('@/features/themes/themes-client', () => ({
  ThemesClient: ({ themes }: { themes: unknown }) => (
    <div data-testid="themes-client" data-themes={JSON.stringify(themes)}>
      Themes Client
    </div>
  ),
}))

// Import after mocks
import Layout from '../layout'

describe('Locale Layout', () => {
  const mockParams = Promise.resolve({ locale: 'en' })

  it('renders children correctly', async () => {
    const LayoutComponent = await Layout({
      children: <div data-testid="test-content">Test Content</div>,
      params: mockParams,
    })

    render(LayoutComponent)

    expect(screen.getByTestId('test-content')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders NextIntlClientProvider with correct locale', async () => {
    const LayoutComponent = await Layout({
      children: <div>Child</div>,
      params: mockParams,
    })

    render(LayoutComponent)

    const provider = screen.getByTestId('next-intl-provider')
    expect(provider).toBeInTheDocument()
    expect(provider).toHaveAttribute('data-locale', 'en')
  })

  it('renders ThemesClient with null themes', async () => {
    const LayoutComponent = await Layout({
      children: <div>Child</div>,
      params: mockParams,
    })

    render(LayoutComponent)

    const themesClient = screen.getByTestId('themes-client')
    expect(themesClient).toBeInTheDocument()
    expect(themesClient).toHaveAttribute('data-themes', 'null')
  })

  it('renders without crashing', async () => {
    const LayoutComponent = await Layout({
      children: <div>Child Component</div>,
      params: mockParams,
    })

    const { container } = render(LayoutComponent)
    expect(container).toBeTruthy()
  })

  it('renders multiple children', async () => {
    const LayoutComponent = await Layout({
      children: (
        <>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </>
      ),
      params: mockParams,
    })

    render(LayoutComponent)

    expect(screen.getByTestId('child-1')).toBeInTheDocument()
    expect(screen.getByTestId('child-2')).toBeInTheDocument()
  })

  it('handles different locales', async () => {
    const frenchParams = Promise.resolve({ locale: 'fr' })

    const LayoutComponent = await Layout({
      children: <div>French Content</div>,
      params: frenchParams,
    })

    render(LayoutComponent)

    const provider = screen.getByTestId('next-intl-provider')
    expect(provider).toHaveAttribute('data-locale', 'fr')
  })

  it('calls getMessages from next-intl/server', async () => {
    const { getMessages } = await import('next-intl/server')

    await Layout({
      children: <div>Test</div>,
      params: mockParams,
    })

    expect(getMessages).toHaveBeenCalled()
  })
})
