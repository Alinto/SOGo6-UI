import { TooltipProvider } from '@/components/ui/tooltip'
import authReducer from '@/features/auth/components/store/auth.slice'
import { notificationsReducer } from '@/features/notifications'
import { configureStore } from '@reduxjs/toolkit'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { AttachmentName, MailAttachment } from '../mail-attachment'

jest.mock('next-intl', () => ({
  useTranslations: () => () => 'Download',
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
    expect(screen.getByText('image.png')).toBeInTheDocument()
    expect(screen.getByText('15.1 Ko')).toBeInTheDocument()
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
})

describe('AttachmentName', () => {
  it('renders name without tooltip if not long', () => {
    render(
      <TooltipProvider>
        <AttachmentName name="shortname.txt" />
      </TooltipProvider>
    )
    expect(screen.getByText('shortname.txt')).toBeInTheDocument()
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('renders truncated name and tooltip if long', async () => {
    const longName = 'verylongfilenameforanattachment.pdf'
    render(
      <TooltipProvider>
        <AttachmentName name={longName} maxLength={10} />
      </TooltipProvider>
    )
    expect(screen.getByText(/verylongfi.*pdf/)).toBeInTheDocument()

    await userEvent.hover(screen.getByText(/verylongfi.*pdf/))
    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip).toHaveTextContent(longName)
  })
})
