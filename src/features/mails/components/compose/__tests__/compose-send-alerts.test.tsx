import { fireEvent, render, screen } from '@testing-library/react'
import { ComposeSendAlerts } from '../compose-send-alerts'

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

jest.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children, open }: any) =>
    open ? <div data-testid="alert-dialog">{children}</div> : null,
  AlertDialogContent: ({ children }: any) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
  AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: any) => <h2>{children}</h2>,
  AlertDialogDescription: ({ children }: any) => <p>{children}</p>,
  AlertDialogCancel: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  AlertDialogAction: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
}))

const baseProps = {
  showNoRecipientAlert: false,
  onNoRecipientAlertOpenChange: jest.fn(),
  emptyContentAlert: null,
  onEmptyContentAlertOpenChange: jest.fn(),
  onConfirmSendAnyway: jest.fn(),
}

describe('ComposeSendAlerts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('no-recipient alert', () => {
    it('is hidden when showNoRecipientAlert is false', () => {
      render(<ComposeSendAlerts {...baseProps} />)
      expect(
        screen.queryByText('no_recipient_alert.title.string')
      ).not.toBeInTheDocument()
    })

    it('shows the title, content and confirms via onNoRecipientAlertOpenChange(false)', () => {
      render(<ComposeSendAlerts {...baseProps} showNoRecipientAlert />)

      expect(
        screen.getByText('no_recipient_alert.title.string')
      ).toBeInTheDocument()
      expect(
        screen.getByText('no_recipient_alert.content.string')
      ).toBeInTheDocument()

      fireEvent.click(screen.getByText('no_recipient_alert.ok.string'))
      expect(baseProps.onNoRecipientAlertOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('empty-content alert', () => {
    it('is hidden when emptyContentAlert is null', () => {
      render(<ComposeSendAlerts {...baseProps} />)
      expect(
        screen.queryByText('empty_content_alert.cancel.string')
      ).not.toBeInTheDocument()
    })

    it('shows the "both" copy when emptyContentAlert is "both"', () => {
      render(<ComposeSendAlerts {...baseProps} emptyContentAlert="both" />)
      expect(
        screen.getByText('no_subject_body_alert.title.string')
      ).toBeInTheDocument()
      expect(
        screen.getByText('no_subject_body_alert.content.string')
      ).toBeInTheDocument()
    })

    it('shows the "subject" copy when emptyContentAlert is "subject"', () => {
      render(<ComposeSendAlerts {...baseProps} emptyContentAlert="subject" />)
      expect(
        screen.getByText('no_subject_alert.title.string')
      ).toBeInTheDocument()
    })

    it('shows the "body" copy when emptyContentAlert is "body"', () => {
      render(<ComposeSendAlerts {...baseProps} emptyContentAlert="body" />)
      expect(screen.getByText('no_body_alert.title.string')).toBeInTheDocument()
    })

    it('calls onEmptyContentAlertOpenChange(false) when cancelling', () => {
      render(<ComposeSendAlerts {...baseProps} emptyContentAlert="body" />)
      fireEvent.click(screen.getByText('empty_content_alert.cancel.string'))
      expect(baseProps.onEmptyContentAlertOpenChange).toHaveBeenCalledWith(
        false
      )
    })

    it('calls onConfirmSendAnyway when confirming', () => {
      render(<ComposeSendAlerts {...baseProps} emptyContentAlert="body" />)
      fireEvent.click(screen.getByText('empty_content_alert.send.string'))
      expect(baseProps.onConfirmSendAnyway).toHaveBeenCalledTimes(1)
    })
  })
})
