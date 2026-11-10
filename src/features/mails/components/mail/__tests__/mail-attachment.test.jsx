import { TooltipProvider } from '@/components/ui/tooltip'
import authReducer from '@/features/auth/components/store/auth.slice'
import { notificationsReducer } from '@/features/notifications'
import { configureStore } from '@reduxjs/toolkit'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MailAttachment } from '../mail-attachment'

jest.mock('next-intl', () => ({
  useTranslations: () => () => 'Download',
  useFormatter: () => ({
    number: (value, options) =>
      new Intl.NumberFormat('en', options).format(value),
  }),
}))

jest.mock('@/lib/env-service', () => ({
  getCachedEnvVars: () => ({ REACT_APP_API_BASE_URL: 'http://localhost:5000' }),
}))

function createTestStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      notifications: notificationsReducer,
    },
    preloadedState: {
      auth: { token: 'test-token', user: null, rememberMe: false },
    },
  })
}

function renderWithProviders(ui) {
  return render(
    <Provider store={createTestStore()}>
      <TooltipProvider>{ui}</TooltipProvider>
    </Provider>
  )
}

describe('MailAttachment', () => {
  const mockPart = {
    partId: '1',
    name: 'image.png',
    contentType: 'image/png',
    size: 15432,
  }

  it('renders attachment name, size and download link', () => {
    renderWithProviders(
      <MailAttachment part={mockPart} attachmentsUrl="/mail/1/" />
    )
    expect(screen.getByTestId('attachment-name')).toHaveTextContent(
      /^image\.png$/
    )
    expect(screen.getByText('15.1 kB')).toBeInTheDocument()
    const downloadLink = screen.getByRole('link', { name: 'Download' })
    expect(downloadLink).toBeInTheDocument()
    expect(downloadLink).toHaveAttribute(
      'href',
      'http://localhost:5000/mail/1/image.png'
    )
  })

  it('shows tooltip on download link hover', async () => {
    renderWithProviders(
      <MailAttachment part={mockPart} attachmentsUrl="/mail/1/" />
    )
    const downloadLink = screen.getByRole('link', { name: 'Download' })
    await userEvent.hover(downloadLink)
    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip).toHaveTextContent('Download')
  })

  it('renders the file type badge', () => {
    renderWithProviders(
      <MailAttachment part={mockPart} attachmentsUrl="/mail/1/" />
    )
    expect(screen.getByText('PNG')).toBeInTheDocument()
  })

  it('renders names up to the limit in full', () => {
    const name = 'verylongfilenameforanattachment.pdf'
    renderWithProviders(
      <MailAttachment part={{ ...mockPart, name }} attachmentsUrl="/mail/1/" />
    )
    expect(screen.getByTestId('attachment-name')).toHaveTextContent(name)
  })

  it('shows the full name in a tooltip when the name is cut', async () => {
    const longName = `${'x'.repeat(80)}.pdf`
    renderWithProviders(
      <MailAttachment
        part={{ ...mockPart, name: longName }}
        attachmentsUrl="/mail/1/"
      />
    )
    const shortName = screen.getByTestId('attachment-name')
    expect(shortName).toHaveTextContent(/^x+…x+\.pdf$/)
    await userEvent.hover(shortName)
    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip).toHaveTextContent(longName)
  })
})
