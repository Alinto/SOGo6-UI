import type { ApiNotification } from '../mail-notifications-api-types'
import {
  createEmptyNotification,
  mapApiNotificationToUi,
  mapFormValuesToMailNotification,
  mapMailNotificationToFormValues,
  mapUiNotificationToApi,
} from '../mail-notifications-utils'

describe('mail-notifications-utils', () => {
  const sampleApiNotification: ApiNotification = {
    enabled: 1,
    notifyAddresses: ['a@example.com', 'b@example.com'],
    notifyMessage: 'Filter triggered',
  }

  describe('createEmptyNotification', () => {
    it('returns default disabled notification', () => {
      const empty = createEmptyNotification()
      expect(empty.enabled).toBe(false)
      expect(empty.addresses).toEqual([])
      expect(empty.message).toBe('')
    })
  })

  describe('mapApiNotificationToUi', () => {
    it('maps null to empty notification', () => {
      const ui = mapApiNotificationToUi(null)
      expect(ui.enabled).toBe(false)
      expect(ui.addresses).toEqual([])
    })

    it('maps API notification to UI model', () => {
      const ui = mapApiNotificationToUi(sampleApiNotification)
      expect(ui.enabled).toBe(true)
      expect(ui.addresses).toEqual(['a@example.com', 'b@example.com'])
      expect(ui.message).toBe('Filter triggered')
    })
  })

  describe('mapUiNotificationToApi', () => {
    it('maps UI notification to API model', () => {
      const ui = mapApiNotificationToUi(sampleApiNotification)
      const api = mapUiNotificationToApi(ui)

      expect(api.enabled).toBe(1)
      expect(api.notifyAddresses).toEqual(['a@example.com', 'b@example.com'])
      expect(api.notifyMessage).toBe('Filter triggered')
    })

    it('preserves config when disabled', () => {
      const ui = mapApiNotificationToUi(sampleApiNotification)
      ui.enabled = false
      const api = mapUiNotificationToApi(ui)

      expect(api.enabled).toBe(0)
      expect(api.notifyAddresses).toEqual(['a@example.com', 'b@example.com'])
    })
  })

  describe('mapMailNotificationToFormValues / mapFormValuesToMailNotification', () => {
    it('maps addresses to emails field array', () => {
      const ui = mapApiNotificationToUi(sampleApiNotification)
      const formValues = mapMailNotificationToFormValues(ui)

      expect(formValues.emails).toEqual([
        { value: 'a@example.com' },
        { value: 'b@example.com' },
      ])
      expect(formValues.email).toBe('')
      expect(formValues.message).toBe('Filter triggered')
    })

    it('ignores pending email input when mapping to domain', () => {
      const formValues = mapMailNotificationToFormValues(createEmptyNotification())
      formValues.email = 'pending@example.com'
      formValues.emails = [{ value: 'saved@example.com' }]
      formValues.message = 'Hello'

      const ui = mapFormValuesToMailNotification(formValues)
      expect(ui.addresses).toEqual(['saved@example.com'])
      expect(ui.message).toBe('Hello')
    })
  })

  describe('round-trip', () => {
    it('preserves data through API → UI → API', () => {
      const ui = mapApiNotificationToUi(sampleApiNotification)
      const api = mapUiNotificationToApi(ui)

      expect(api).toEqual(sampleApiNotification)
    })

    it('null notification round-trips to coherent POST payload', () => {
      const ui = mapApiNotificationToUi(null)
      const api = mapUiNotificationToApi(ui)

      expect(api.enabled).toBe(0)
      expect(api.notifyAddresses).toEqual([])
      expect(api.notifyMessage).toBe('')
    })
  })
})
