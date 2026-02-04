import { render, screen } from '@testing-library/react'
import React from 'react'
import RootLayout from '../layout'

jest.mock('@/lib/fonts', () => ({
  geistSans: {
    className: 'geist-sans',
    variable: '--font-geist-sans',
    style: { fontFamily: 'Geist Sans' },
  },
  geistMono: {
    className: 'geist-mono',
    variable: '--font-geist-mono',
    style: { fontFamily: 'Geist Mono' },
  },
  openDyslexic: {
    className: 'open-dyslexic',
    variable: '--font-opendyslexic',
    style: { fontFamily: 'OpenDyslexic' },
  },
}))

// Mock next-intl's createTranslator
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Mock the components
jest.mock('@/components/theme-provider', () => {
  return {
    ThemeProvider: ({
      children,
      attribute,
      defaultTheme,
      enableSystem,
      themes,
    }: any) => (
      <div
        data-testid="theme-provider"
        data-attribute={attribute}
        data-default-theme={defaultTheme}
        data-enable-system={enableSystem}
        data-themes={themes?.join(',')}
      >
        {children}
      </div>
    ),
  }
})

jest.mock('@/lib/redux/store-provider', () => {
  return function MockStoreProvider({
    children,
  }: {
    children: React.ReactNode
  }) {
    return <div data-testid="store-provider">{children}</div>
  }
})

describe('RootLayout', () => {
  const mockParams = Promise.resolve({ locale: 'en' })

  it('should render children correctly', async () => {
    const testChild = <div data-testid="test-child">Test Content</div>

    render(
      await RootLayout({
        children: testChild,
        params: mockParams,
      })
    )

    expect(screen.getByTestId('test-child')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('should render ThemeProvider with correct props', async () => {
    const testChild = <div>Content</div>

    render(
      await RootLayout({
        children: testChild,
        params: mockParams,
      })
    )

    const themeProvider = screen.getByTestId('theme-provider')
    expect(themeProvider).toBeInTheDocument()
    expect(themeProvider).toHaveAttribute('data-attribute', 'class')
    expect(themeProvider).toHaveAttribute('data-default-theme', 'system')
    expect(themeProvider).toHaveAttribute('data-enable-system', 'true')
  })

  it('should render StoreProvider', async () => {
    const testChild = <div>Content</div>

    render(
      await RootLayout({
        children: testChild,
        params: mockParams,
      })
    )

    expect(screen.getByTestId('store-provider')).toBeInTheDocument()
  })

  it('should include all required theme options', async () => {
    const testChild = <div>Content</div>

    render(
      await RootLayout({
        children: testChild,
        params: mockParams,
      })
    )

    const themeProvider = screen.getByTestId('theme-provider')
    const themes = themeProvider.getAttribute('data-themes')
    const themesList = themes?.split(',') || []

    expect(themesList).toContain('light')
    expect(themesList).toContain('dark')
    expect(themesList).toContain('dyslexia')
    expect(themesList).toContain('system')
  })

  it('should render nested providers in correct order', async () => {
    const testChild = <div data-testid="test-child">Nested Content</div>

    render(
      await RootLayout({
        children: testChild,
        params: mockParams,
      })
    )

    // Verify providers are rendered
    const themeProvider = screen.getByTestId('theme-provider')
    const storeProvider = screen.getByTestId('store-provider')
    const child = screen.getByTestId('test-child')

    expect(themeProvider).toBeInTheDocument()
    expect(storeProvider).toBeInTheDocument()
    expect(child).toBeInTheDocument()

    // Verify store provider is inside theme provider
    expect(themeProvider.contains(storeProvider)).toBe(true)
    // Verify child is inside store provider
    expect(storeProvider.contains(child)).toBe(true)
  })

  it('should handle different locales', async () => {
    const testChild = <div>Content</div>
    const frParams = Promise.resolve({ locale: 'fr' })

    render(
      await RootLayout({
        children: testChild,
        params: frParams,
      })
    )

    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('should render successfully with multiple children', async () => {
    const multipleChildren = (
      <>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </>
    )

    render(
      await RootLayout({
        children: multipleChildren,
        params: mockParams,
      })
    )

    expect(screen.getByTestId('child-1')).toBeInTheDocument()
    expect(screen.getByTestId('child-2')).toBeInTheDocument()
  })
})
