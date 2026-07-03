import {
  createEmptyForward,
  mapMailForwardToFormValues,
} from '../../mail-forward-utils'
import { createForwardSchema } from '../forward-schema'

const t = ((key: string) => key) as Parameters<typeof createForwardSchema>[0]

describe('forward-schema', () => {
  const schema = createForwardSchema(t)

  it('accepts disabled forward without addresses', () => {
    const result = schema.safeParse(
      mapMailForwardToFormValues(createEmptyForward())
    )
    expect(result.success).toBe(true)
  })

  it('requires at least one address when enabled', () => {
    const result = schema.safeParse({
      enabled: true,
      emails: [],
      email: '',
      alwaysSend: false,
      keepCopy: false,
    })
    expect(result.success).toBe(false)
  })

  it('accepts enabled forward with addresses', () => {
    const result = schema.safeParse({
      enabled: true,
      emails: [{ value: 'a@example.com' }],
      email: '',
      alwaysSend: false,
      keepCopy: true,
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid pending email', () => {
    const result = schema.safeParse({
      enabled: false,
      emails: [],
      email: 'not-an-email',
      alwaysSend: false,
      keepCopy: false,
    })
    expect(result.success).toBe(false)
  })
})
