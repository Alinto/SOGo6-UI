import { ThemeProvider } from '@/components/theme-provider'
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

// filepath: //src/components/theme-provider.test.tsx

jest.mock('next-themes', () => ({
  ThemeProvider: jest.fn(({ children }) => <div>{children}</div>),
}))

describe('ThemeProvider component', () => {
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
      <ThemeProvider attribute="class">
        <div>Test Child</div>
      </ThemeProvider>
    )
    expect(NextThemesProvider).toHaveBeenCalledWith(
      expect.objectContaining({ attribute: 'class' }),
      {}
    )
  })
})
