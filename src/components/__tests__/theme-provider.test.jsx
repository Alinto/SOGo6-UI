import { ThemeProvider } from '@/components/theme-provider'
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

// filepath: //src/components/theme-provider.test.tsx

jest.mock('next-themes', () => ({
  ThemeProvider: jest.fn(({ children }) => <div>{children}</div>),
}))

describe('ThemeProvider component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders children correctly', () => {
    const { getByText } = render(
      <ThemeProvider>
        <div>Test Child</div>
      </ThemeProvider>
    )
    expect(getByText('Test Child')).toBeInTheDocument()
  })

  it('matches the snapshot', () => {
    const { asFragment } = render(
      <ThemeProvider>
        <div>Test Child</div>
      </ThemeProvider>
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('passes props to NextThemesProvider', () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="light">
        <div>Test Child</div>
      </ThemeProvider>
    )

    // Check that NextThemesProvider was called with the correct props
    expect(NextThemesProvider).toHaveBeenCalledTimes(1)
    const calls = NextThemesProvider.mock.calls[0]
    const props = calls[0]

    expect(props).toMatchObject({
      attribute: 'class',
      defaultTheme: 'light',
      children: expect.any(Object),
    })
  })
})
