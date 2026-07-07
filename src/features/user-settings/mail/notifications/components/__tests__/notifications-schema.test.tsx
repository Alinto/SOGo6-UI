import {
  createEmptyNotification,
  mapMailNotificationToFormValues,
} from '../../mail-notifications-utils'
import { createNotificationSchema } from '../notifications-schema'

const t = ((key: string) => key) as Parameters<typeof createNotificationSchema>[0]

describe('notifications-schema', () => {
  const schema = createNotificationSchema(t)

  it('accepts disabled notification without addresses', () => {
    const result = schema.safeParse(
      mapMailNotificationToFormValues(createEmptyNotification())
    )
    expect(result.success).toBe(true)
  })

  it('requires at least one address when enabled', () => {
    const result = schema.safeParse({
      enabled: true,
      emails: [],
      email: '',
      message: 'Alert',
    })
    expect(result.success).toBe(false)
  })

  it('requires message when enabled', () => {
    const result = schema.safeParse({
      enabled: true,
      emails: [{ value: 'a@example.com' }],
      email: '',
      message: '',
    })
    expect(result.success).toBe(false)
  })

  it('accepts enabled notification with addresses and message', () => {
    const result = schema.safeParse({
      enabled: true,
      emails: [{ value: 'a@example.com' }],
      email: '',
      message: 'Alert',
    })
    expect(result.success).toBe(true)
  })
})
