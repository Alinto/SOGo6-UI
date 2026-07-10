import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EnvGate } from '../env-gate'

const mockRefetch = jest.fn()
const mockUseEnvVars = jest.fn()

jest.mock('@/lib/env-service', () => ({
  useEnvVars: () => mockUseEnvVars(),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'serviceUnavailable.title.string': 'Service unavailable',
      'serviceUnavailable.description.string': 'Could not connect.',
      'serviceUnavailable.retry.string': 'Try again',
    }
    return translations[key] || key
  },
}))

describe('EnvGate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows a loader while env is loading', () => {
    mockUseEnvVars.mockReturnValue({
      envVars: null,
      loading: true,
      error: null,
      refetch: mockRefetch,
    })

    render(
      <EnvGate>
        <div data-testid="child">Child</div>
      </EnvGate>
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByTestId('child')).not.toBeInTheDocument()
  })

  it('renders children when env is available', () => {
    mockUseEnvVars.mockReturnValue({
      envVars: { REACT_APP_API_BASE_URL: 'https://api.example.test' },
      loading: false,
      error: null,
      refetch: mockRefetch,
    })

    render(
      <EnvGate>
        <div data-testid="child">Child</div>
      </EnvGate>
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('shows service unavailable when env loading fails', () => {
    mockUseEnvVars.mockReturnValue({
      envVars: null,
      loading: false,
      error: new Error('network'),
      refetch: mockRefetch,
    })

    render(
      <EnvGate>
        <div data-testid="child">Child</div>
      </EnvGate>
    )

    expect(screen.getByText('Service unavailable')).toBeInTheDocument()
    expect(screen.queryByTestId('child')).not.toBeInTheDocument()
  })

  it('retries env loading when the user clicks Try again', async () => {
    const user = userEvent.setup()
    mockRefetch.mockResolvedValue({
      REACT_APP_API_BASE_URL: 'https://api.example.test',
    })
    mockUseEnvVars.mockReturnValue({
      envVars: null,
      loading: false,
      error: new Error('network'),
      refetch: mockRefetch,
    })

    render(
      <EnvGate>
        <div data-testid="child">Child</div>
      </EnvGate>
    )

    await user.click(screen.getByRole('button', { name: 'Try again' }))

    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalledTimes(1)
    })
  })
})
