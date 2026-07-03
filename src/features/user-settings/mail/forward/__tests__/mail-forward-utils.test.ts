import type { ApiForward } from '../mail-forward-api-types'
import {
  createEmptyForward,
  mapApiForwardToUi,
  mapFormValuesToMailForward,
  mapMailForwardToFormValues,
  mapUiForwardToApi,
} from '../mail-forward-utils'

describe('mail-forward-utils', () => {
  const sampleApiForward: ApiForward = {
    enabled: 1,
    forwardAddress: ['a@example.com', 'b@example.com'],
    keepCopy: 1,
    alwaysSend: 0,
  }

  describe('createEmptyForward', () => {
    it('returns default disabled forward', () => {
      const empty = createEmptyForward()
      expect(empty.enabled).toBe(false)
      expect(empty.addresses).toEqual([])
    })
  })

  describe('mapApiForwardToUi', () => {
    it('maps null to empty forward', () => {
      const ui = mapApiForwardToUi(null)
      expect(ui.enabled).toBe(false)
      expect(ui.addresses).toEqual([])
    })

    it('maps API forward to UI model', () => {
      const ui = mapApiForwardToUi(sampleApiForward)
      expect(ui.enabled).toBe(true)
      expect(ui.addresses).toEqual(['a@example.com', 'b@example.com'])
      expect(ui.keepCopy).toBe(true)
      expect(ui.alwaysSend).toBe(false)
    })
  })

  describe('mapUiForwardToApi', () => {
    it('maps UI forward to API model', () => {
      const ui = mapApiForwardToUi(sampleApiForward)
      const api = mapUiForwardToApi(ui)

      expect(api.enabled).toBe(1)
      expect(api.forwardAddress).toEqual(['a@example.com', 'b@example.com'])
      expect(api.keepCopy).toBe(1)
      expect(api.alwaysSend).toBe(0)
    })

    it('preserves config when disabled', () => {
      const ui = mapApiForwardToUi(sampleApiForward)
      ui.enabled = false
      const api = mapUiForwardToApi(ui)

      expect(api.enabled).toBe(0)
      expect(api.forwardAddress).toEqual(['a@example.com', 'b@example.com'])
    })
  })

  describe('mapMailForwardToFormValues / mapFormValuesToMailForward', () => {
    it('maps addresses to emails field array', () => {
      const ui = mapApiForwardToUi(sampleApiForward)
      const formValues = mapMailForwardToFormValues(ui)

      expect(formValues.emails).toEqual([
        { value: 'a@example.com' },
        { value: 'b@example.com' },
      ])
      expect(formValues.email).toBe('')
      expect(formValues.alwaysSend).toBe(false)
    })

    it('ignores pending email input when mapping to domain', () => {
      const formValues = mapMailForwardToFormValues(createEmptyForward())
      formValues.email = 'pending@example.com'
      formValues.emails = [{ value: 'saved@example.com' }]

      const ui = mapFormValuesToMailForward(formValues)
      expect(ui.addresses).toEqual(['saved@example.com'])
    })
  })

  describe('round-trip', () => {
    it('preserves data through API → UI → API', () => {
      const ui = mapApiForwardToUi(sampleApiForward)
      const api = mapUiForwardToApi(ui)

      expect(api).toEqual(sampleApiForward)
    })

    it('null forward round-trips to coherent POST payload', () => {
      const ui = mapApiForwardToUi(null)
      const api = mapUiForwardToApi(ui)

      expect(api.enabled).toBe(0)
      expect(api.forwardAddress).toEqual([])
    })
  })
})
