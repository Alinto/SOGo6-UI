import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import {
  getQueryErrorStatus,
  SettingsAsyncPage,
} from '../settings-async-page'

describe('getQueryErrorStatus', () => {
  it('returns status from RTK query error objects', () => {
    expect(getQueryErrorStatus({ status: 403 })).toBe(403)
  })

  it('returns undefined for non-error values', () => {
    expect(getQueryErrorStatus(null)).toBeUndefined()
    expect(getQueryErrorStatus('error')).toBeUndefined()
  })
})

describe('SettingsAsyncPage', () => {
  it('renders skeleton while loading', () => {
    render(
      <SettingsAsyncPage
        title="Title"
        description="Description"
        error={undefined}
        isLoading
        featureDisabledMessage="Disabled"
        loadFailedMessage="Failed"
        skeleton={<div data-testid="skeleton" />}
      >
        <div data-testid="content" />
      </SettingsAsyncPage>
    )

    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
    expect(screen.queryByTestId('content')).not.toBeInTheDocument()
  })

  it('renders children when loaded', () => {
    render(
      <SettingsAsyncPage
        title="Title"
        error={undefined}
        isLoading={false}
        featureDisabledMessage="Disabled"
        loadFailedMessage="Failed"
        skeleton={<div data-testid="skeleton" />}
      >
        <div data-testid="content" />
      </SettingsAsyncPage>
    )

    expect(screen.getByTestId('content')).toBeInTheDocument()
  })

  it('shows feature disabled message on 403', () => {
    render(
      <SettingsAsyncPage
        title="Title"
        error={{ status: 403 }}
        isLoading={false}
        featureDisabledMessage="Feature disabled"
        loadFailedMessage="Load failed"
        skeleton={<div data-testid="skeleton" />}
      >
        <div data-testid="content" />
      </SettingsAsyncPage>
    )

    expect(screen.getByText('Feature disabled')).toBeInTheDocument()
  })

  it('shows load failed message for other errors', () => {
    render(
      <SettingsAsyncPage
        title="Title"
        error={{ status: 500 }}
        isLoading={false}
        featureDisabledMessage="Feature disabled"
        loadFailedMessage="Load failed"
        skeleton={<div data-testid="skeleton" />}
      >
        <div data-testid="content" />
      </SettingsAsyncPage>
    )

    expect(screen.getByText('Load failed')).toBeInTheDocument()
  })
})
