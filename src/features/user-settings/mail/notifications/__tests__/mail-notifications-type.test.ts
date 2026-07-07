import type {
  MailNotification,
  NotificationFormValues,
} from '../mail-notifications-type'
import {
  createEmptyNotification,
  mapFormValuesToMailNotification,
  mapMailNotificationToFormValues,
} from '../mail-notifications-utils'

describe('mail-notifications-type', () => {
  describe('MailNotification interface', () => {
    it('can represent a disabled notification', () => {
      const notification: MailNotification = createEmptyNotification()

      expect(notification.enabled).toBe(false)
      expect(notification.addresses).toEqual([])
      expect(notification.message).toBe('')
    })

    it('can represent an enabled notification with addresses', () => {
      const notification: MailNotification = {
        enabled: true,
        addresses: ['alert@example.com', 'backup@example.com'],
        message: 'New mail received',
      }

      expect(notification.enabled).toBe(true)
      expect(notification.addresses).toHaveLength(2)
      expect(notification.message).toBe('New mail received')
    })
  })

  describe('NotificationFormValues interface', () => {
    it('maps MailNotification to form values', () => {
      const ui: MailNotification = {
        enabled: true,
        addresses: ['a@example.com'],
        message: 'Alert',
      }

      const values: NotificationFormValues = mapMailNotificationToFormValues(ui)

      expect(values.enabled).toBe(true)
      expect(values.emails).toEqual([{ value: 'a@example.com' }])
      expect(values.email).toBe('')
      expect(values.message).toBe('Alert')
    })

    it('maps form values back to MailNotification', () => {
      const values: NotificationFormValues = {
        enabled: true,
        emails: [{ value: 'a@example.com' }],
        email: '',
        message: 'Alert',
      }

      const ui = mapFormValuesToMailNotification(values)

      expect(ui.enabled).toBe(true)
      expect(ui.addresses).toEqual(['a@example.com'])
      expect(ui.message).toBe('Alert')
    })
  })
})
